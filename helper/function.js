import { Admin } from "../models/admin.model.js";
import { Hacker } from "../models/hacker.model.js";
import { Company } from "../models/company.model.js";
import { UserSession } from "../models/usersession.model.js";


const findUserByEmail = async (email) => {
    try {
        const admin = await Admin.findOne({ email: email });
        const hacker = await Hacker.findOne({ email, is_verify: true });
        const company = await Company.findOne({ email });

        if (admin) {
            return { user: admin, role: 'admin' };
        } else if (hacker) {
            return { user: hacker, role: 'hacker' };
        } else if (company) {
            return { user: company, role: 'company' };
        } else {
            return { user: null, role: null };
        }
    } catch (error) {
        throw error;
    }
}

export {
    findUserByEmail,
}