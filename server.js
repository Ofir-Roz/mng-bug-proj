import express from 'express'
import { bugService } from './services/bug.service.js'

const app = express()

app.get('/', (req, res) => { res.send('Hello there!') })
app.listen(3030, () => { console.log('Server ready at port 3030') })


//* ------------------------------ Bug Crud API ------------------------------ *//
//* List

app.get('/api/bug', async (req, res) => {
    try {
        const bugs = await bugService.query()
        res.send(bugs)
    } catch (err) {
        console.log('err:', err)
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
        console.log('err:', err)
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
        console.log('err:', err)
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
        console.log('err:', err)
        res.status(400).send('Failed to remove bug')
    }
})