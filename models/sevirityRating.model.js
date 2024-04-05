import mongoose from "mongoose";
const { Schema } = mongoose;

const severity_ratingSchema = new mongoose.Schema({
    program_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'programs',
        required: true
    },
    low: {
        type: Number,
        required: true
    },
    medium: {
        type: Number,
        required: true
    },
    high: {
        type: Number,
        required: true
    },
    critical: {
        type: Number,
        required: true
    }
})

const SeverityRating = mongoose.model('severity_ratings', severity_ratingSchema);

export {
    SeverityRating
}