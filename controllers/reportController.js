import { Report } from "../models/report.model.js";
import { Hacker } from "../models/hacker.model.js";
import { Program } from "../models/program.model.js";
import { ReportImage } from "../models/reportImage.model.js";
import { upload } from "../helper/image.js";
import Joi from 'joi';

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

        const verifyImage = await upload(req.files);
        if (!verifyImage.success) {
            return res.status(404).json({ success: false, message: verifyImage.message });
        }

        await Report.create({
            hacker_id: id,
            program_id,
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
                report_id: data._id,
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

        const data = await Report.findOne({ _id: report_id, hacker_id: id, is_draft: false });
        if (!data) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }

        if (req.files) {
            const verifyImage = await upload(req.files);
            if (!verifyImage.success) {
                return res.status(400).json({ success: false, message: verifyImage.message });
            }

            if (delete_image && delete_image.length > 0) {
                for (let imageId of delete_image) {
                    imageId = imageId.trim();
                    await ReportImage.findOneAndDelete({ _id: imageId });
                }
            }

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
        const data2 = await Report.findByIdAndUpdate(report_id, updateObj);
        console.log('data :>> ', data2);

        return res.status(200).json({ success: true, message: "Report updated successfully" });
    } catch (error) {
        console.error("Error updating report:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export {
    createReport,
    updateReport
}