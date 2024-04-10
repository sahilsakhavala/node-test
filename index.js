import express from 'express'
const app = express()
import connection from './db/connectdb.js'
import router from './routes/index.js'
import multer from 'multer'
import path from 'path'

const upload = multer();

app.use(upload.any());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/api/v1', router)


app.listen(process.env.PORT || 3000, () => {
    console.log('Server Listening at 3000');
})