import { Router } from 'express'
const router = Router()
import { get_profile, register, update_profile, verifyEmail } from '../controllers/hackerController.js'
import userAuth from '../middleware/auth.js'

router.post('/hunter-register', register);
router.get('/get-hunter-profile', userAuth, get_profile);
router.post('/update-hunter-profile', userAuth, update_profile);
router.get('/verify-email', verifyEmail);

export default router;