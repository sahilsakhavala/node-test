import { Report } from "../models/report.model.js";
import { Hacker } from "../models/hacker.model.js";
import { Program } from "../models/program.model.js";
import { ReportImage } from "../models/reportImage.model.js";
import { upload } from "../middleware/uploadfile.js";
import Joi from 'joi';
import { deleteFile } from "../helper/delete.file.js";
import { zipFileValidation } from "../helper/image.js";

const createReport = async (req, res) => {
    const requestSchema = Joi.object({
        vulnerability_title: Joi.string().required(),
        vulnerability_target: Joi.string().required(),
        vulnerability_endpoint: Joi.string().required(),
        severity_level: Joi.string().required(),
        severity_picker: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
        proof_of_concept: Joi.string().required(),
        vulnerability_impact: Joi.string().required(),
        is_draft: Joi.boolean().required(),
    });
    const { error } = requestSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const { user: { id, role },
            params: { program_id },
            body: {
                vulnerability_title,
                vulnerability_target,
                vulnerability_endpoint,
                severity_level,
                severity_picker,
                proof_of_concept,
                vulnerability_impact,
                is_draft
            } } = req;
        if (role !== 'hacker') {
            return res.status(401).json({ success: false, message: "You are not a hacker" });
        }

        const verifyProgram = await Program.findOne({ _id: program_id, status: 'approved' });
        if (!verifyProgram) {
            return res.status(404).json({ success: false, message: "Program not found" });
        }

        const data = await Hacker.findById(id);
        if (!data.wallet_id) {
            return res.status(404).json({ success: false, message: "First add wallet id" });
        }

        const fileValidation = await zipFileValidation(req.files);
        if (!fileValidation.success) {
            return res.status(400).json({ success: false, message: fileValidation.message });
        }
        const verifyImage = await upload(req.files);

        const reportData = await Report.create({
            hacker_id: id,
            program_id,
            company_id: verifyProgram.company_id,
            vulnerability_title,
            vulnerability_target,
            vulnerability_endpoint,
            severity_level,
            severity_picker,
            proof_of_concept,
            vulnerability_impact,
            is_draft
        })

        for (const image of verifyImage.images) {
            await ReportImage.create({
                report_id: reportData._id,
                image: image
            });
        }
        return res.status(200).json({ success: true, message: "Report created successfully" });
    } catch (error) {
        console.error("Error creating report:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const updateReport = async (req, res) => {
    const requestSchema = Joi.object({
        vulnerability_title: Joi.string(),
        vulnerability_target: Joi.string(),
        vulnerability_endpoint: Joi.string(),
        severity_level: Joi.string(),
        severity_picker: Joi.string().valid('low', 'medium', 'high', 'critical'),
        proof_of_concept: Joi.string(),
        vulnerability_impact: Joi.string(),
        is_draft: Joi.boolean(),
        delete_image: Joi.array().items(Joi.string()).single()
    });
    const { error } = requestSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        let { user: { id, role }, params: { report_id }, body: {
            vulnerability_title,
            vulnerability_target,
            vulnerability_endpoint,
            severity_level,
            severity_picker,
            proof_of_concept,
            vulnerability_impact,
            is_draft,
            delete_image
        } } = req;
        delete_image = delete_image?.split(',') || [];
        if (role !== 'hacker') {
            return res.status(401).json({ success: false, message: "You are not a hacker" });
        }

        const data = await Report.findOne({ _id: report_id, hacker_id: id, is_draft: true });
        if (!data) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        const verifyImage = await upload(req.files);
        if (delete_image && delete_image.length > 0) {
            for (let imageId of delete_image) {
                imageId = imageId.trim();

                const findImage = await ReportImage.findOne({ _id: imageId });
                if (findImage) {
                    deleteFile(findImage.image)
                }
                await ReportImage.findOneAndDelete({ _id: imageId });
            }
        }

        if (req.files && req.files.length > 0) {
            for (const image of verifyImage.images) {
                await ReportImage.create({
                    report_id: report_id,
                    image: image
                });
            }
        }

        const updateObj = {
            vulnerability_title,
            vulnerability_target,
            vulnerability_endpoint,
            severity_level,
            severity_picker,
            proof_of_concept,
            vulnerability_impact,
            is_draft
        }
        await Report.findByIdAndUpdate(report_id, updateObj);

        return res.status(200).json({ success: true, message: "Report updated successfully" });
    } catch (error) {
        console.error("Error updating report:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getReportForHacker = async (req, res) => {
    const requestSchema = Joi.object({
        is_draft: Joi.boolean().valid(true, false).required(),
    });
    const { error } = requestSchema.validate(req.query);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const { user: { id, role }, query: { is_draft } } = req;
        if (role !== 'hacker') {
            return res.status(401).json({ success: false, message: "You are not a hacker" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totaldata = await Report.countDocuments({ hacker_id: id, is_draft: is_draft });

        const data = await Report.find({ hacker_id: id, is_draft: is_draft })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('report_image');

        const totalPages = Math.ceil(totaldata / limit);
        return res.status(200).json({
            success: true,
            data: data,
            totalPages: totalPages,
            lastPage: totalPages,
            currentPage: page,
            previousPage: page - 1,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const getReportForCompany = async (req, res) => {
    try {
        const { user: { id, role } } = req;
        if (role !== 'company') {
            return res.status(401).json({ success: false, message: "You are not a company" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totaldata = await Report.countDocuments({ company_id: id, is_draft: false });
        const data = await Report.find({ company_id: id, is_draft: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('report_image');
        return res.status(200).json({
            success: true,
            data: data,
            totalPages: Math.ceil(totaldata / limit),
            lastPage: Math.ceil(totaldata / limit),
            currentPage: page,
            previousPage: page - 1
        })
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const getReportForAdmin = async (req, res) => {
    try {
        const { user: { id, role } } = req;
        if (role !== 'admin') {
            return res.status(401).json({ success: false, message: "You are not an admin" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totaldata = await Report.countDocuments({ is_draft: false });
        const data = await Report.find({ is_draft: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('report_image');

        return res.status(200).json({
            success: true,
            data: data,
            totalPages: Math.ceil(totaldata / limit),
            lastPage: Math.ceil(totaldata / limit),
            currentPage: page,
            previousPage: page - 1
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export {
    createReport,
    updateReport,
    getReportForHacker,
    getReportForCompany,
    getReportForAdmin
}