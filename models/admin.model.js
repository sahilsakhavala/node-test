import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
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
            return null;
        }
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }

});

const Admin = mongoose.model('admins', AdminSchema);

export { Admin };
