import mongoose from "mongoose";

const HackerSchema = new mongoose.Schema({
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
                return `${process.env.LOCALHOST_URL}/image/${profile_image}`;
            }
            return null
        }
    },
    seniority_level: {
        type: String,
        enum: ["senior", "junior"],
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