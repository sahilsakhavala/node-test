import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
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
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
},
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true }

    })

const Request = mongoose.model('requests', RequestSchema)

export {
    Request
}