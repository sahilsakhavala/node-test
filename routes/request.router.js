import express from 'express'
const router = express.Router()
import { get_request, handle_request, request } from '../controllers/requestController.js'

router.post('/request', request)
router.get('/get-request', get_request)
router.post('/handle-request', handle_request)

export default router