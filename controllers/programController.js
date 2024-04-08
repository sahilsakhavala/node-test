import { Program } from "../models/program.model.js";
import { SeverityRating } from "../models/sevirityRating.model.js";
import Joi from 'joi'
import uploadFile from "../middleware/uploadfile.js";
import { fileValidation } from "../helper/image.js";

const createProgram = async (req, res) => {
    const createProgramSchema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        start_date: Joi.date().required(),
        min_reward: Joi.number().required(),
        max_reward: Joi.number().required(),
        focus_area: Joi.string().required(),
        program_rules: Joi.string().required(),
        severity_rating: Joi.object({
            low: Joi.number().required(),
            medium: Joi.number().required(),
            high: Joi.number().required(),
            critical: Joi.number().required()
        }).required()
    });
    const { error } = createProgramSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const { user: { id, role }, body: { name, description, start_date, min_reward, max_reward, focus_area, program_rules, severity_rating } } = req
        if (role !== 'company') {
            return res.status(401).json({ success: false, message: "You are not a company" });
        }

        const checkCompany = await Program.findOne({ company_id: id, status: { $in: ['pending', 'approved'] } })
        if (checkCompany) {
            return res.status(409).json({ success: false, message: "Program already exists" });
        }

        const data = await Program.create({
            company_id: id,
            name: name,
            description: description,
            start_date: start_date,
            min_reward: min_reward,
            max_reward: max_reward,
            focus_area: focus_area,
            program_rules: program_rules
        })
        await SeverityRating.create({
            program_id: data._id,
            low: severity_rating.low,
            medium: severity_rating.medium,
            high: severity_rating.high,
            critical: severity_rating.critical
        })
        return res.status(201).json({ success: true, message: "Program created successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const getProgramsForAdmin = async (req, res) => {
    try {
        const { user: { role }, query: { status } } = req;

        if (role !== 'admin') {
            return res.status(401).json({ success: false, message: "You are not an admin" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totaldata = await Program.countDocuments({ status: status });
        const data = await Program.find({ status: status }).populate('severity_rating')
            .skip(skip)
            .limit(limit);
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
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const getProgramsByIdForAdmin = async (req, res) => {
    try {
        const { user: { role }, params: { program_id } } = req
        if (role !== 'admin') {
            return res.status(401).json({ success: false, message: "You are not a admin" });
        }

        const data = await Program.findById(program_id)
            .populate('severity_rating')
        if (!data) {
            return res.status(404).json({ success: false, message: "Program not found" });
        }
        return res.status(200).json({ success: true, data: data })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const getApprovedProgramForCompany = async (req, res) => {
    try {
        const { user: { id, role } } = req;
        if (role !== 'company') {
            return res.status(401).json({ success: false, message: "You are not a company" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totaldata = await Program.countDocuments({ company_id: id });
        const totalPages = Math.ceil(totaldata / limit);
        const data = await Program.findOne({ company_id: id, status: 'approved' })
            .populate('severity_rating')
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            data: data,
            totalPages: totalPages,
            lastPage: totalPages,
            currentPage: page,
            previousPage: page - 1,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getClosedProgramForCompany = async (req, res) => {
    try {
        const { user: { id, role } } = req;
        if (role !== 'company') {
            return res.status(401).json({ success: false, message: "You are not a company" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totaldata = await Program.countDocuments({ company_id: id, status: 'close' });
        const totalPages = Math.ceil(totaldata / limit);
        const data = await Program.find({ company_id: id, status: 'close' })
            .populate('severity_rating')
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            data: data,
            totalPages: totalPages,
            lastPage: totalPages,
            currentPage: page,
            previousPage: page - 1,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getProgramForHacker = async (req, res) => {
    try {
        const { user: { id, role }, params: { program_id } } = req
        if (role !== 'hacker') {
            return res.status(401).json({ success: false, message: "You are not a hacker" });
        }

        if (program_id) {
            const data = await Program.findById(program_id, { is_vdp: false })
                .sort({ createdAt: -1 })
                .populate('severity_rating')
            if (!data) {
                return res.status(404).json({ success: false, message: "Program not found" });
            }
            return res.status(200).json({ success: true, data: data })
        }

        const data = await Program.find({ is_vdp: false })
            .sort({ createdAt: -1 })
            .populate('severity_rating');
        return res.status(200).json({ success: true, data: data })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}


const updateProgramByAdmin = async (req, res) => {
    try {
        const { user: { id, role },
            params: { program_id },
            body: { name, description, start_date, min_reward, max_reward, focus_area, program_rules, severity_rating, logo },
        } = req;
        if (role !== 'admin') {
            return res.status(401).json({ success: false, message: "You are not a admin" });
        }

        const file = req.files
        let image
        if (file) {
            image = uploadFile(file);
        }

        const verifyFile = await fileValidation(file);
        if (!verifyFile.success) {
            return res.status(422).json({
                success: false,
                message: verifyFile.message
            });
        }

        const updateObj = {
            name: name,
            description: description,
            start_date: start_date,
            min_reward: min_reward,
            max_reward: max_reward,
            focus_area: focus_area,
            program_rules: program_rules,
            ...(file.length) && { logo: image }
        }
        await Program.findByIdAndUpdate(program_id, updateObj)

        const parsedSeverityRating = JSON.parse(severity_rating);
        await SeverityRating.findOneAndUpdate({ program_id: program_id },
            parsedSeverityRating);
        return res.status(200).json({ success: true, message: "Program updated successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const updateProgramByCompany = async (req, res) => {
    try {
        const { user: { id, role },
            params: { program_id },
            body: { name, description, start_date, min_reward, max_reward, focus_area, program_rules, severity_rating },
        } = req;
        if (role !== 'company') {
            return res.status(401).json({ success: false, message: "You are not a company" });
        }

        const program = await Program.findById({ company_id: id });
        if (!program) {
            return res.status(403).json({ success: false, message: "You are not authorized to update this program" });
        }

        const file = req.files
        let image
        if (file) {
            image = uploadFile(file);
        }

        const updateObj = {
            name: name,
            description: description,
            start_date: start_date,
            min_reward: min_reward,
            max_reward: max_reward,
            focus_area: focus_area,
            program_rules: program_rules,
            ...(file.length) && { logo: image }
        }
        await Program.findByIdAndUpdate(program_id, updateObj)

        const parsedSeverityRating = JSON.parse(severity_rating);
        await SeverityRating.findOneAndUpdate({ program_id: program_id },
            parsedSeverityRating);
        return res.status(200).json({ success: true, message: "Program updated successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const approveProgram = async (req, res) => {
    const requestSchema = Joi.object({
        program_id: Joi.string().required(),
        status: Joi.string().valid('approved', 'rejected').required(),
    });
    const { error } = requestSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const { user: { id, role },
            body: { program_id, status }
        } = req;
        if (role !== 'admin') {
            return res.status(401).json({ success: false, message: "You are not a admin" });
        }

        const verifyProgram = await Program.findOne({ _id: program_id, status: 'pending' });
        if (!verifyProgram) {
            return res.status(404).json({ success: false, message: "Program not found" });
        }
        const updateObj = {
            status: status
        }
        await Program.findByIdAndUpdate(program_id, updateObj)
        return res.status(200).json({ success: true, message: "Program approved successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const closeProgramByAdmin = async (req, res) => {
    const requestSchema = Joi.object({
        program_id: Joi.string().required(),
    });
    const { error } = requestSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const { user: { role },
            body: { program_id }
        } = req;
        if (role !== 'admin') {
            return res.status(401).json({ success: false, message: "You are not a admin" });
        }

        const verifyProgram = await Program.findOne({ _id: program_id, status: 'approved' });
        if (!verifyProgram) {
            return res.status(404).json({ success: false, message: "Program not found" });
        }

        await Program.findByIdAndUpdate(program_id, { status: 'closed' })
        return res.status(200).json({ success: true, message: "Program closed successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const closeProgramByCompany = async (req, res) => {
    const requestSchema = Joi.object({
        program_id: Joi.string().required(),
    });
    const { error } = requestSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const { user: { id, role },
            body: { program_id }
        } = req;
        if (role !== 'company') {
            return res.status(401).json({ success: false, message: "You are not a company" });
        }

        const program = await Program.findOne({ company_id: id, status: 'approved' });
        if (!program) {
            return res.status(403).json({ success: false, message: "Program not found" });
        }

        await Program.findByIdAndUpdate(program_id, { status: 'closed' })
        return res.status(200).json({ success: true, message: "Program closed successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const reopenProgram = async (req, res) => {
    const requestSchema = Joi.object({
        program_id: Joi.string().required(),
    });
    const { error } = requestSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        const { user: { id, role },
            body: { program_id }
        } = req;
        if (role !== 'admin') {
            return res.status(401).json({ success: false, message: "You are not a admin" });
        }

        const program = await Program.findOne({ _id: program_id, status: 'closed' });
        if (!program) {
            return res.status(404).json({ success: false, message: "Program not found" });
        }
        const verifyProgram = await Program.findOne({ company_id: program.company_id, status: 'approved' });
        if (verifyProgram) {
            return res.status(403).json({ success: false, message: "Program already exist" });
        }

        await Program.findByIdAndUpdate(program_id, { status: 'approved' })
        return res.status(200).json({ success: true, message: "Program reopened successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export {
    createProgram,
    getProgramsForAdmin,
    getProgramsByIdForAdmin,
    getApprovedProgramForCompany,
    getClosedProgramForCompany,
    getProgramForHacker,
    updateProgramByAdmin,
    updateProgramByCompany,
    approveProgram,
    closeProgramByAdmin,
    closeProgramByCompany,
    reopenProgram
}