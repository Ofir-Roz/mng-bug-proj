import PDFDocument from 'pdfkit'
import { makeId, readJsonFile, writeJsonFile } from '../../services/utils.js'

export const bugService = {
    query,
    getById,
    save,
    remove,
    generateBugsPdf
}

const PAGE_SIZE = 4

const bugs = readJsonFile('./data/bugs.json')

async function query(filterBy = {}, sortBy = {}) {
    let bugsToDisplay = bugs
    try {
        // Filtering
        if (filterBy.title) {
            const regExp = new RegExp(filterBy.title, 'i')
            bugsToDisplay = bugsToDisplay.filter(bug => regExp.test(bug.title))
        }

        if (filterBy.minSeverity) {
            bugsToDisplay = bugsToDisplay.filter(bug => bug.severity >= filterBy.minSeverity)
        }

        if (filterBy.labels && filterBy.labels.length) {
            bugsToDisplay = bugsToDisplay.filter(bug =>
                bug.labels && bug.labels.some(label => filterBy.labels.includes(label))
            )
        }

        // Sorting
        if (sortBy.title)
            bugsToDisplay.sort((a, b) => (a.title.localeCompare(b.title) * sortBy.title))

        if (sortBy.severity)
            bugsToDisplay.sort((a, b) => (a.severity - b.severity) * sortBy.severity)

        if (sortBy.createdAt)
            bugsToDisplay.sort((a, b) => (a.createdAt - b.createdAt) * sortBy.createdAt)

        // Prepare pagination data
        const totalBugs = bugsToDisplay.length
        const totalPages = Math.ceil(totalBugs / PAGE_SIZE)
        const pageIdx = filterBy.pageIdx !== undefined ? Math.min(filterBy.pageIdx, Math.max(0, totalPages - 1)) : 0

        // Get bugs for current page
        if (filterBy.pageIdx !== undefined && !isNaN(filterBy.pageIdx)) {
            const startIdx = pageIdx * PAGE_SIZE
            bugsToDisplay = bugsToDisplay.slice(startIdx, startIdx + PAGE_SIZE)
        }

        return {
            bugs: bugsToDisplay,
            pagination: {
                totalBugs,
                totalPages,
                currentPage: pageIdx,
                pageSize: PAGE_SIZE,
                hasNext: (pageIdx + 1) < totalPages,
                hasPrev: pageIdx > 0
            }
        }
    } catch (err) {
        throw err
    }
}

async function getById(bugId) {
    try {
        const bug = bugs.find(bug => bug._id === bugId)
        if (!bug) throw new Error('Bug not found')
        return bug
    } catch (err) {
        throw err
    }
}

async function remove(bugId) {
    try {
        const bugIdx = bugs.findIndex(bug => bug._id === bugId)
        if (bugIdx === -1) throw new Error('Bug not found')
        bugs.splice(bugIdx, 1)
        await _saveBugsToFile()
    } catch (err) {
        throw err
    }

}

async function save(bugToSave) {
    try {
        if (bugToSave._id) {
            const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
            if (bugIdx === -1) throw new Error('Bug not found')
            bugs[bugIdx] = bugToSave
        }
        else {
            bugToSave._id = makeId()
            bugToSave.createdAt = Date.now()
            bugs.unshift(bugToSave)
        }
        await _saveBugsToFile()
        
        // After saving, query the first page to ensure proper pagination
        const response = await query({ pageIdx: 0 })
        return bugToSave._id ? bugToSave : response.bugs[0]
    } catch (err) {
        throw err
    }
}

async function generateBugsPdf(req, res) {
    try {
        const doc = new PDFDocument()
        const bugs = await query()

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'attachment; filename="bugs.pdf"')

        // Pipe the PDF document to the response
        doc.pipe(res)

        // Add content to the PDF
        doc.fontSize(20).text('Bugs Report', { align: 'center' })
        doc.moveDown()

        bugs.forEach((bug, idx) => {
            doc.fontSize(14).text(`Bug #${idx + 1}`);
            doc.text(`ID: ${bug._id}`)
            doc.text(`Title: ${bug.title}`)
            doc.text(`Severity: ${bug.severity}`)
            doc.text(`Description: ${bug.description}`)
            if (bug.labels)
                doc.text(`Labels: ${bug.labels.join(', ')}`)
            doc.text(`Created At: ${new Date(bug.createdAt).toLocaleString()}`)
            doc.moveDown()
        })

        // Finalize the PDF and end the stream
        doc.end()
    } catch (err) {
        throw err
    }
}

// Private functions
function _saveBugsToFile() {
    return writeJsonFile('./data/bugs.json', bugs)
}


// const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// console.log(emailRegex.test("test@example.com")); // true