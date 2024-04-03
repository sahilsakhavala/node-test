import bcrypt from 'bcrypt'
import uploadFile from "../middleware/uploadfile.js";
import { Hacker } from '../models/hacker.model.js';
import findUserByEmail from '../helper/function.js';
import Joi from 'joi';

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
        const image = uploadFile(file)
        const { user } = await findUserByEmail(email);
        if (user) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }
        else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const data = await Hacker.create({
                name: name,
                email: email,
                password: hashedPassword,
                profile_image: image,
            })
            res.status(201).json({ success: true, message: "Hacker registered successfully" });
        }
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

        if (role !== 'hacker') {
            return res.status(401).json({ success: false, message: "You are not an admin" });
        }

        const updateObj = {
            name,
            profile_image
        };

        const findAdmin = await Hacker.findById(id);

        if (new_password && old_password) {
            const isMatch = await bcrypt.compare(old_password, findAdmin.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Enter correct old password" });
            }
            const hashedPassword = await bcrypt.hash(new_password, 10);
            updateObj.password = hashedPassword;
            const deleteSessions = createDeleteOtherUserSessions(id, role, authorization.split(' ')[1]);
            await deleteSessions();
        }

        const hacker = await Hacker.findByIdAndUpdate(id, updateObj);
        return res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export {
    register,
    get_profile,
    update_profile
}