import mongoose from "mongoose";
import config from "../config/db.config.js";

const connection = async () => {
    return mongoose.connect(config.MONGODB_URI)
        .then(() => {
            console.log("Connected Successfully");
        })
        .catch((err) => {
            console.log(err);
        })
}

export default connection