import express, { json } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

const corsOptions = {
    origin: [
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        'http://127.0.0.1:5174',
        'http://localhost:5174'
    ],
    credentials: true
}

const app = express()

//* Express Config:
app.use(express.static('public'))
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())


//* ------------------------------ Bug Crud API ------------------------------ *//

// Download
app.get(`/api/bug/downloadBugs`, async (req, res) =>{
    try {
        await bugService.generateBugsPdf(req, res)
    } catch (err) {
        loggerService.error(`Failed to generate PDF`, err)
        res.status(500).send(`Failed to generate PDF`)
    }
})

// List
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


/* Read
 - Limits the user to viewing a maximum of 3 bugs within a 10-second time window
 - Tracks visited bugs using cookies */
app.get('/api/bug/:bugId', async (req, res) => { 

    const { bugId } = req.params
    const visitedBugs = req.cookies.visitedBugs ? JSON.parse(req.cookies.visitedBugs) : []

    if (!visitedBugs.includes(bugId))
        visitedBugs.push(bugId)
    
    try {
        const bug = await bugService.getById(bugId)
        
        if (visitedBugs.length <= 3) {
            console.log('User visited the following bugs:', visitedBugs)

            res.cookie(`visitedBugs`, JSON.stringify(visitedBugs), { maxAge: 1000 * 10 })
            res.send(bug)
        } else {
            loggerService.info(`Limits the user from seeing more than 3 different bugs`, visitedBugs)
            res.status(401).send({
                error: 'Too many requests',
                message: 'You have viewed the maximum of 3 bugs. Please wait 10 seconds before trying again.',
                visitedBugs
            })
        }
    } catch (err) {
        loggerService.error(`Couldn't get bug ${bugId}`, err)
        res.status(400).send('Failed to get bug')
    }
})

// Update
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

// Create
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

 // Delete
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


// Start the server and define a default route
const port = 3030
app.listen(port, () => {
     loggerService.info(`Server listening on port http://127.0.0.1:${port}`) 
})
app.get('/', (req, res) => {
    res.send(`<h1>Hello And Welcome!</h1>`)
})