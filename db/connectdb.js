import mongoose from "mongoose";

// const connectdb = async () => {
//     return mongoose.connect(process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017/alpha')
//         .then(() => {
//             console.log("Connected Successfully");
//         })
//         .catch((err) => {
//             console.log(err);
//         })
// }

// export default connectdb

const connectionparams = {
    useNewURLParser: true,
    useUnifiedTopology: true
}

const uri = "mongodb+srv://sahilsakhavala0077:sahil222@cluster0.trrms57.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const connection = mongoose.connect(uri, connectionparams).then(() => {
    console.log('Connected');
}).catch((error) => {
    console.log(error);
})

export default connection