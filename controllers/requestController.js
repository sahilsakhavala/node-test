import { Request } from "../models/request.model.js";
import { Company } from "../models/company.model.js";
import bcrypt from 'bcrypt'
import Joi from "joi";

const request = async (req, res) => {
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
        const hashedPassword = await bcrypt.hash(password, 10);
        const request = new Request({
            name: name,
            email: email,
            password: hashedPassword,
        })
        await request.save()
        res.status(201).json({ success: true, message: "Request send successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


const get_request = async (req, res) => {
    try {
        const { user: { id, role } } = req
        if (role !== 'admin') {
            return res.status(401).json({ success: false, message: "You are not a admin" });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalRequests = await Request.countDocuments({ status: "pending" });
        const data = await Request.find({ status: "pending" })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalRequests / limit);
        res.status(500).json({
            success: true,
            data: data,
            totalPages: totalPages,
            lastPage: totalPages,
            currentPage: page,
            previousPage: page - 1,
        });
    } catch (error) {
        console.log('error', error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const handle_request = async (req, res) => {
    const requestSchema = Joi.object({
        request_id: Joi.string().required(),
        status: Joi.string().valid('approved', 'rejected').required(),
    });
    const { error } = requestSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const { user: { id, role } } = req
        if (role !== 'admin') {
            return res.status(401).json({ success: false, message: "You are not a admin" });
        }

        const { request_id, status } = req.body;
        console.log(request_id);
        const request = await Request.findOne({ _id: request_id, status: "pending" });
        const email = request.email
        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        console.log('request', request)
        if (status === 'approved') {
            const { user } = await findUserByEmail(email);
            if (user) {
                return res.status(400).json({ success: false, message: "Email already exists" });
            }
            await Request.findOneAndUpdate(
                { _id: request_id },
                { $set: { status: status } },
            )
            const company = await Company.create({ name: request.name, email: request.email, password: request.password })
            return res.status(200).json({ success: true, message: "Request Approved successfully" });
        }
        else {
            await Request.findOneAndUpdate(
                { _id: request_id },
                { $set: { status: status } },
            )
            return res.status(200).json({ success: true, message: "Request Rejected successfully" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export {
    request,
    get_request,
    handle_request
}