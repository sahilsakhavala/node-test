import express from 'express'
const router = express.Router()
import { createProgram, getProgramsForAdmin, getProgramsByIdForAdmin, getApprovedProgramForCompany, getClosedProgramForCompany, getProgramForHacker, updateProgramByAdmin, updateProgramByCompany, approveProgram, closeProgramByAdmin, closeProgramByCompany, reopenProgram } from '../controllers/programController.js';
import userAuth from '../middleware/auth.js';

router.post('/create-program', userAuth, createProgram);
router.get('/get-program-for-admin', userAuth, getProgramsForAdmin);
router.get('/get-program-for-admin/:program_id', userAuth, getProgramsByIdForAdmin);
router.get('/get-approved-program-for-company', userAuth, getApprovedProgramForCompany);
router.get('/get-closed-program-for-company', userAuth, getClosedProgramForCompany);
router.get('/get-program-for-hacker', userAuth, getProgramForHacker);
router.get('/get-program-for-hacker/:program_id', userAuth, getProgramForHacker);
router.put('/update-program-by-admin/:program_id', userAuth, updateProgramByAdmin);
router.post('/update-program-by-company/:program_id', userAuth, updateProgramByCompany);
router.post('/approve-program/', userAuth, approveProgram);
router.post('/close-program-by-admin/', userAuth, closeProgramByAdmin);
router.post('/close-program-by-company/', userAuth, closeProgramByCompany);
router.post('/reopen-program/', userAuth, reopenProgram);

export default router;