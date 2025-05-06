import express from 'express'
import { getUser, getUsers, deleteUser, updateUser, addUser } from './user.controller.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/:userId', getUser)
router.put('/:userId', updateUser)
router.post('/', addUser)
router.delete('/:userId', deleteUser)

export const userRoutes = router