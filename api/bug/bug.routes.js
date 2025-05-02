import express from 'express'
import { getBug, getBugs, deleteBug, updateBug, downloadBugs, addBug } from './bug.controller.js'

const router = express.Router()

router.get('/downloadBugs', downloadBugs)
router.get('/', getBugs)
router.get('/:bugId', getBug)
router.put('/:bugId', updateBug)
router.post('/', addBug)
router.delete('/:bugId', deleteBug)

export const bugRoutes = router