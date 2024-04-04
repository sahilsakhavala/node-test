import { Company } from "../models/company.model.js";
import bcrypt from 'bcrypt'
import Joi from "joi";
import { createDeleteOtherUserSessions } from "../helper/deleteTokenFunction.js";
import { findUserByEmail } from "../helper/function.js";
import { sendMail } from "../helper/mail.js";

const get_profile = async (req, res) => {
    try {
        const { user: { id, role } } = req;
        if (role !== 'company') {
            return res.status(401).json({ success: false, message: "You are not a company" });
        }
        const data = await Company.findById(id, '-password');
        if (!data) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }
        return res.status(200).json({ success: true, data: data });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const update_profile = async (req, res) => {
    const schema = Joi.object({
        name: Joi.string(),
        profile_image: Joi.string(),
        new_password: Joi.string().min(8),
        old_password: Joi.when('new_password', {
            is: Joi.exist(),
            then: Joi.string().required(),
            otherwise: Joi.forbidden()
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const { user: { id, role }, body: { name, profile_image, new_password, old_password } } = req;

        if (role !== 'company') {
            return res.status(401).json({ success: false, message: "You are not an company" });
        }

        const updateObj = {
            name,
            profile_image
        };

        const findAdmin = await Company.findById(id);

        if (new_password && old_password) {
            const isMatch = await bcrypt.compare(old_password, findAdmin.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Enter correct old password" });
            }
            const hashedPassword = await bcrypt.hash(new_password, 10);
            updateObj.password = hashedPassword;
            const response = await createDeleteOtherUserSessions(id, role, authorization.split(' ')[1]);
            if (!response) {
                return res.status(401).json({ success: false, message: "Failed to delete other user sessions" });
            }
        }

        const data = await Company.findByIdAndUpdate(id, updateObj);
        return res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const addCompany = async (req, res) => {
    const registerSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(8),
    });
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const { user: { id, role } } = req
        if (role !== 'admin') {
            return res.status(401).json({ success: false, message: "You are not a admin" });
        }

        const { name, email, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10);
        const verifyEmail = await findUserByEmail(email)
        if (verifyEmail.user !== null) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }
        await Company.create({
            name: name,
            email: email,
            password: hashedPassword,
        })
        const emailObj = {
            to: email,
            subject: 'Registration successful',
            text: 'Registration successful',
        };
        await sendMail(emailObj);
        res.status(201).json({ success: true, message: "Company registered successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export {
    get_profile,
    update_profile,
    addCompany
};