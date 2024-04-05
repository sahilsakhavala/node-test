import express from 'express'
const router = express.Router()
import hunter from './hunter.router.js'
import request from './request.router.js'
import admin from './admin.router.js'
import company from './company.router.js'
import program from './program.router.js'

router.use('/', hunter)
router.use('/', request)
router.use('/', admin)
router.use('/', company)
router.use('/', program)

export default router