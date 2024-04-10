import bcrypt from 'bcrypt'
import uploadFile from "../middleware/uploadfile.js";
import { Hacker } from '../models/hacker.model.js';
import { findUserByEmail } from '../helper/function.js';
import Joi from 'joi';
import { sendMail } from '../helper/mail.js';
import { createToken, verifyToken } from '../helper/jwtToken.js';
import ejs from 'ejs'
import { fileValidation } from '../helper/image.js';
import { deleteFile } from '../helper/delete.file.js';

const register = async (req, res) => {
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
        const { name, email, password } = req.body
        const file = req.files
        const image = uploadFile(file);
        const verifyFile = await fileValidation(file);
        if (!verifyFile.success) {
            return res.status(422).json({
                success: false,
                message: verifyFile.message
            });
        }

        const emailVerify = await findUserByEmail(email);
        if (emailVerify.user !== null) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const randomString = Math.random().toString(36).substring(2, 17);
        const payload = { randomString: randomString }
        const token = await createToken(payload, '1h');

        let object = {
            name: name,
            email: email,
            password: hashedPassword,
            profile_image: image,
            verify_token: token
        };
        await Hacker.updateOne({ email: email, is_verify: false }, { $set: object }, { upsert: true });

        let link = `${process.env.BASE_URL}/api/v1/verify-email?token=${token}`
        const renderedTemplate = await ejs.renderFile('./views/index.ejs', { link: link });
        const emailObj = {
            to: email,
            subject: 'For verify your email',
            html: renderedTemplate,
            text: 'Please verify your email',
        };
        await sendMail(emailObj);
        res.status(201).json({ success: true, message: "Hacker registered successfully Please verify your email" });

    } catch (error) {
        console.error("Error registering hacker:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const get_profile = async (req, res) => {
    try {
        const { user: { id, role } } = req;
        if (role !== 'hacker') {
            return res.status(401).json({ success: false, message: "You are not a hacker" });
        }
        const data = await Hacker.findById(id, '-password');
        if (!data) {
            return res.status(404).json({ success: false, message: "Hacker not found" });
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
        wallet_id: Joi.string(),
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
        const { user: { id, role },
            body: { name, new_password, old_password, wallet_id },
            files: { profile_image },
        } = req;

        if (role !== 'hacker') {
            return res.status(401).json({ success: false, message: "You are not an admin" });
        }

        const updateObj = {
            name,
            profile_image,
            wallet_id
        };

        if (req.files) {
            const file = req.files
            const image = uploadFile(file);
            const verifyFile = await fileValidation(file);
            if (!verifyFile.success) {
                return res.status(422).json({
                    success: false,
                    message: verifyFile.message
                });
            }
            updateObj.profile_image = image
        }

        const findAdmin = await Hacker.findById(id);

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

        const hacker = await Hacker.findByIdAndUpdate(id, updateObj);
        return res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { query: { token } } = req;
        const verifyResponse = await verifyToken(token);
        if (!verifyResponse.success) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Token'
            })
        }

        const data = await Hacker.findOne({ verify_token: token, is_verify: false });
        if (!data) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        const verifyEmail = await findUserByEmail(data.email)
        if (verifyEmail.user !== null) {
            return res.status(401).json({ success: false, message: "Email already exists" });
        }
        const updateObj = {
            is_verify: true,
            verify_token: null
        }
        await Hacker.findOneAndUpdate({ _id: data._id }, updateObj);
        return res.status(200).json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        console.error("Error verifying email:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export {
    register,
    get_profile,
    update_profile,
    verifyEmail
}