import mongoose from "mongoose";

const ReportImageSchema = new mongoose.Schema({
    report_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'reports',
        required: true
    },
    image: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
)

const ReportImage = mongoose.model('report_images', ReportImageSchema);

export {
    ReportImage
}