import express from 'express'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()

//* ------------------------------ Bug Crud API ------------------------------ *//
//* List

app.get('/api/bug', async (req, res) => {
    try {
        const bugs = await bugService.query()
        res.send(bugs)
    } catch (err) {
        loggerService.error(`Couldn't get bugs`, err)
        res.status(400).send('Failed to get bugs')
    }
})

//* Create/Update
app.get('/api/bug/save', async (req, res) => {
    const bugToSave = {
        _id: req.query._id ,
        title: req.query.title,
        severity: +req.query.severity,
        createdAt: +Date.now()
    }
    try {
        const savedBug = await bugService.save(bugToSave)
        res.send(savedBug)
    } catch (err) {
        loggerService.error(`Failed to save bug ${bugToSave._id}`, err)
        res.status(400).send('Failed to save bug')
    }
})

//* Read
app.get('/api/bug/:bugId', async (req, res) => { 
    const { bugId } = req.params
    try {
        const bug = await bugService.getById(bugId)
        res.send(bug)
    } catch (err) {
        loggerService.error(`Couldn't get bug ${bugId}`, err)
        res.status(400).send('Failed to get bug')
    }
})

 //* Delete
app.get('/api/bug/:bugId/remove', async (req, res) => { 
    const { bugId } = req.params
    try {
        await bugService.remove(bugId)
        res.send('Bug removed')
    } catch (err) {
        loggerService.error(`Couldn't remove bug ${bugId}`, err)
        res.status(400).send('Failed to remove bug')
    }
})


const port = 3030
app.listen(port, () => {
     loggerService.info(`Server listening on port http://127.0.0.1:${port}`) 
})

app.get('/', (req, res) => {
    res.send(`<h1>Hello And Welcome!</h1>`)
})