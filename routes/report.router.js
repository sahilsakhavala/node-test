import express from 'express'
const router = express.Router()
import userAuth from '../middleware/auth.js'
import { createReport, getReportForAdmin, getReportForCompany, getReportForHacker, updateReport } from '../controllers/reportController.js'

router.post('/create-report/:program_id', userAuth, createReport)
router.post('/update-report/:report_id', userAuth, updateReport)
router.get('/get-report-for-hacker/', userAuth, getReportForHacker)
router.get('/get-report-for-company/', userAuth, getReportForCompany)
router.get('/get-report-for-admin/', userAuth, getReportForAdmin)

export default router