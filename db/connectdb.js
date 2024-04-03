import mongoose from "mongoose";

const connectdb = async () => {
    return mongoose.connect(process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017/alpha')
        .then(() => {
            console.log("Connected Successfully");
        })
        .catch((err) => {
            console.log(err);
        })
}

export default connectdb