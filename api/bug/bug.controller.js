import { loggerService } from "../../services/logger.service.js"
import { bugService } from "./bug.service.js"


// Download
export async function downloadBugs(req, res) {
    try {
        await bugService.generateBugsPdf(req, res)
    } catch (err) {
        loggerService.error(`Failed to generate PDF`, err)
        res.status(500).send(`Failed to generate PDF`)
    }
}

// List
export async function getBugs(req, res) {
    const filterBy = {
        title: req.query.title,
        minSeverity: +req.query.minSeverity,
        labels: req.query.labels,
        pageIdx: req.query.pageIdx
    }
    const sortBy = {
        title: +req.query.sortByTitle,
        severity: +req.query.sortBySeverity,
        createdAt: +req.query.sortByDate
    }

    try {
        const response = await bugService.query(filterBy, sortBy)
        res.send(response)
    } catch (err) {
        loggerService.error(`Couldn't get bugs`, err)
        res.status(400).send('Failed to get bugs')
    }
}

/* Read
 - Limits the user to viewing a maximum of 3 bugs within a 10-second time window
 - Tracks visited bugs using cookies */
export async function getBug(req, res) {

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
}

// Update
export async function updateBug(req, res) {
    const bugToSave = {
        _id: req.body._id,
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
}

// Create
export async function addBug(req, res) {

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
}

// Delete
export async function deleteBug(req, res) {
    const { bugId } = req.params
    try {
        await bugService.remove(bugId)
        res.send('Bug removed')
    } catch (err) {
        loggerService.error(`Couldn't remove bug ${bugId}`, err)
        res.status(400).send('Failed to remove bug')
    }
}

