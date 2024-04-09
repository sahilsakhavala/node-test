import express from 'express'
const router = express.Router()
import userAuth from '../middleware/auth.js'
import { createReport, updateReport } from '../controllers/reportController.js'
import uploadFile from '../middleware/uploadfile.js'

router.post('/create-report/:program_id', userAuth, createReport)
router.post('/update-report/:report_id', userAuth, updateReport)

export default router