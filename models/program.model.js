import mongoose from "mongoose";
const { Schema } = mongoose;

const programSchema = new mongoose.Schema({
    company_id: {
        type: Schema.Types.ObjectId,
        ref: 'companys',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    min_reward: {
        type: Number,
        required: true
    },
    max_reward: {
        type: Number,
        required: true
    },
    focus_area: {
        type: String,
        required: true
    },
    program_rules: {
        type: String,
        required: true
    },
    is_vdp: {
        type: Boolean,
        default: false
    },
    logo: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "closed"],
        default: "pending"
    }
})

programSchema.set("toObject", { virtuals: true, setter: true, getter: true });
programSchema.set("toJSON", { virtuals: true, setter: true, getter: true });

programSchema.virtual('severity_rating', {
    ref: 'severity_ratings',
    localField: '_id',
    foreignField: 'program_id',
    justOne: false
});

const Program = mongoose.model('programs', programSchema)

export {
    Program
}