import express from 'express'
const router = express.Router()
import hunter from './hunter.router.js'
import request from './request.router.js'
import admin from './admin.router.js'
import company from './company.router.js'
import program from './program.router.js'
import report from './report.router.js'

router.use('/', hunter)
router.use('/', request)
router.use('/', admin)
router.use('/', company)
router.use('/', program)
router.use('/', report)

export default router