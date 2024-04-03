import express from 'express'
const router = express.Router()
import { get_request, handle_request, request } from '../controllers/requestController.js'
import userAuth from '../middleware/auth.js'

router.post('/request', request)
router.get('/get-request', userAuth, get_request)
router.post('/handle-request', userAuth, handle_request)

export default router