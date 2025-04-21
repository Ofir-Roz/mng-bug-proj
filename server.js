import express from 'express'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import cors from 'cors'


const app = express()

const corsOptions = {
    origin: [
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        'http://127.0.0.1:5174',
        'http://localhost:5174'
    ],
    credentials: true
}

app.use(express.static('public'))
app.use(cors(corsOptions))
app.use(express.json())

//* ------------------------------ Bug Crud API ------------------------------ *//
//* List
app.get('/api/bug', async (req, res) => {
    const filterBy = {
        title: req.query.title,
        minSeverity: +req.query.minSeverity 
    }
    try {
        const bugs = await bugService.query(filterBy)
        res.send(bugs)
    } catch (err) {
        loggerService.error(`Couldn't get bugs`, err)
        res.status(400).send('Failed to get bugs')
    }
})

//* Create
app.post('/api/bug', async (req, res) => {

    const bugToSave = {
        title: req.body.title,
        severity: +req.body.severity,
        description: req.body.description,
        createdAt: +Date.now()
    }
    
    try {
        const savedBug = await bugService.save(bugToSave)
        res.send(savedBug)
    } catch (err) {
        loggerService.error(`Failed to save bug`, err)
        res.status(400).send('Failed to save bug')
    }
})

//* Update
app.put('/api/bug/:bugId', async (req, res) => {

    const bugToSave = {
        _id: req.body._id ,
        title: req.body.title,
        severity: +req.body.severity,
        description: req.body.description,
        createdAt: +Date.now()
    }
    
    try {
        const savedBug = await bugService.save(bugToSave)
        res.send(savedBug)
    } catch (err) {
        loggerService.error(`Failed to save bug`, err)
        res.status(400).send('Failed to save bug')
    }
})

//* Download
app.get(`/api/bug/downloadBugs`, async (req, res) =>{
    try {
        await bugService.generateBugsPdf(res)
    } catch (err) {
        loggerService.error(`Failed to generate PDF`, err)
        res.status(500).send(`Failed to generate PDF`)
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
app.delete('/api/bug/:bugId', async (req, res) => { 
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