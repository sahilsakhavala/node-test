import express from 'express'
const router = express.Router()
import { createProgram, getProgramsForAdmin, getProgramForCompany, getProgramForHacker, updateProgramByAdmin, updateProgramByCompany, approveProgram } from '../controllers/programController.js';
import userAuth from '../middleware/auth.js';

router.post('/create-program', userAuth, createProgram);
router.get('/get-program-for-admin', userAuth, getProgramsForAdmin);
router.get('/get-program-for-admin/:program_id', userAuth, getProgramsForAdmin);
router.get('/get-program-for-company', userAuth, getProgramForCompany);
router.get('/get-program-for-hacker', userAuth, getProgramForHacker);
router.get('/get-program-for-hacker/:program_id', userAuth, getProgramForHacker);
router.put('/update-program-by-admin/:program_id', userAuth, updateProgramByAdmin);
router.post('/update-program-by-company/:program_id', userAuth, updateProgramByCompany);
router.post('/approve-program/', userAuth, approveProgram);

export default router;