import { loggerService } from "../../services/logger.service.js"
import { userService } from "./user.service.js"


// List
export async function getUsers(req, res) {
    const filterBy = {
        fullname: req.query.fullname,
        username: req.query.username,
        minScore: +req.query.minScore
    }
    const sortBy = {
        fullname: req.query.sortByFullname,
        username: req.query.sortByUsername,
        score: +req.query.sortByScore
    }

    try {
        const users = await userService.query(filterBy, sortBy)
        res.send(users)
    } catch (err) {
        loggerService.error(`Couldn't get users`, err)
        res.status(400).send('Failed to get users')
    }
}

// Read
export async function getUser(req, res) {
    const { userId } = req.params

    try {
        const user = await userService.getById(userId)
        res.send(user)
    } catch (err) {
        loggerService.error(`Couldn't get user ${userId}`, err)
        res.status(400).send('Failed to get user')
    }
}

// Update
export async function updateUser(req, res) {
    const userToSave = {
        _id: req.body._id,
        fullname: req.body.fullname,
        username: req.body.username,
        password: req.body.password,
        score: req.body.score !== undefined ? +req.body.score : undefined
    }
    
    // Remove undefined properties to ensure we only updating the filled keys
    Object.keys(userToSave).forEach(
        key => userToSave[key] === undefined && delete userToSave[key]
    )
    
    try {
        const user = await userService.getById(userToSave._id)
        const savedUser = await userService.save({...user, ...userToSave})
        res.send(savedUser)
    } catch (err) {
        loggerService.error(`Failed to save user`, err)
        res.status(400).send('Failed to save user')
    }
}

// Create
export async function addUser(req, res) {
    const userToSave = {
        fullname: req.body.fullname,
        username: req.body.username,
        password: req.body.password,
        score: +req.body.score
    }

    try {
        const savedUser = await userService.save(userToSave)
        res.send(savedUser)
    } catch (err) {
        loggerService.error(`Failed to save user`, err)
        res.status(400).send('Failed to save user')
    }
}

// Delete
export async function deleteUser(req, res) {
    const { userId } = req.params
    try {
        await userService.remove(userId)
        res.send('User removed')
    } catch (err) {
        loggerService.error(`Couldn't remove user ${userId}`, err)
        res.status(400).send('Failed to remove user')
    }
}

