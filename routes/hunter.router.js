import express from 'express'
const router = express.Router()
import { get_profile, register, update_profile, verifyEmail } from '../controllers/hackerController.js'
import userAuth from '../middleware/auth.js'

router.post('/hunter-register', register);
router.get('/get-hunter-profile', userAuth, get_profile);
router.post('/update-hunter-profile', userAuth, update_profile);
router.post('/verify-email', verifyEmail);

export default router;