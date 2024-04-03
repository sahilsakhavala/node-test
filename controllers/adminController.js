import { Admin } from "../models/admin.model.js";
import { createDeleteOtherUserSessions } from "../helper/deleteTokenFunction.js";
import bcrypt from 'bcrypt'
import Joi from "joi";
import findUserByEmail from "../helper/function.js";
import { UserSession } from "../models/usersession.model.js";
import { createToken } from "../helper/jwtToken.js";

const login = async (req, res) => {
    const registerSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {

        const { body: { email, password } } = req;
        const { user, role } = await findUserByEmail(email);

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
        const payload = { userId: user.id }
        const token = await createToken(payload);
        const data = await UserSession.create({
            token: token,
            role: role,
            user_id: user.id
        })
        return res.status(200).json({ success: true, message: "Login successful", data: data });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const get_profile = async (req, res) => {
    try {
        const { user: { id, role } } = req
        if (role !== 'admin') {
            return res.status(401).json({ success: false, message: "You are not a admin" });
        }
        const data = await Admin.findById(id, '-password');
        res.status(500).json({ success: true, data: data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

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
        const { user: { id, role }, headers: { authorization }, body: { name, profile_image, new_password, old_password } } = req;
        console.log(authorization);
        if (role !== 'admin') {
            return res.status(401).json({ success: false, message: "You are not an admin" });
        }
        const updateObj = {
            name,
            profile_image
        };

        const findAdmin = await Admin.findById(id);

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

        const admin = await Admin.findByIdAndUpdate(id, updateObj);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const logout = async (req, res) => {
    try {
        const { user: { userSession_id } } = req
        await UserSession.deleteOne({ _id: userSession_id });
        res.status(200).json({ success: true, message: "Logout successful" });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


export {
    login,
    get_profile,
    update_profile,
    logout
}