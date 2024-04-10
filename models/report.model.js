import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
    hacker_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hackers',
        required: true
    },
    program_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'programs',
        required: true
    },
    vulnerability_title: {
        type: String,
        required: true
    },
    vulnerability_target: {
        type: String,
        required: true
    },
    vulnerability_endpoint: {
        type: String,
        required: true
    },
    severity_level: {
        type: String,
        required: true
    },
    severity_picker: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        required: true
    },
    proof_of_concept: {
        type: String,
        required: true
    },
    vulnerability_impact: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["new", "escalated", "informative", "not_applicable", "duplicate", "triaged", "resolved"],
        default: "new"
    },
    is_draft: {
        type: Boolean,
        required: true
    }
},
    {
        timestamps: true
    }
)

reportSchema.set("toObject", { virtuals: true, setter: true, getter: true });
reportSchema.set("toJSON", { virtuals: true, setter: true, getter: true });

reportSchema.virtual('report_image', {
    ref: 'report_images',
    localField: '_id',
    foreignField: 'report_id',
    justOne: false
});

const Report = mongoose.model('reports', reportSchema);

export {
    Report
}