import mongoose from "mongoose";
import config from "../config/db.config.js";

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    profile_image: {
        type: String,
        default: null,
        get: function (profile_image) {
            if (profile_image) {
                return `${config.url}/image/${profile_image}`;
            }
            return null
        }
    },
},
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true }

    })

const Company = mongoose.model('companys', CompanySchema)

export {
    Company
}