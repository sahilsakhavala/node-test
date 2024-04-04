import express from 'express'
const router = express.Router()
import userAuth from '../middleware/auth.js'
import { get_profile, update_profile, addCompany } from '../controllers/companyController.js'

router.get('/get-company-profile', userAuth, get_profile)
router.post('/update-company-profile', userAuth, update_profile)
router.post('/add-company', userAuth, addCompany)

export default router