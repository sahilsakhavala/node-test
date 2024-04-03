import express from 'express'
const router = express.Router()
import { get_profile, login, logout, update_profile } from '../controllers/adminController.js'
import userAuth from '../middleware/auth.js'

router.post('/login', login)
router.get('/get-admin-profile', userAuth, get_profile)
router.post('/update-admin-profile', userAuth, update_profile)
router.post('/logout', userAuth, logout)

export default router