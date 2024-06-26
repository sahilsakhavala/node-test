import mongoose from "mongoose";
import config from "../config/db.config.js";

const HackerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    wallet_id: {
        type: String,
        required: true
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
    seniority_level: {
        type: String,
        enum: ["senior", "junior"],
        default: null
    },
    is_verify: {
        type: Boolean,
        default: false
    },
    verify_token: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
},)

const Hacker = mongoose.model('hackers', HackerSchema)

export {
    Hacker
}