import PDFDocument from 'pdfkit'
import { makeId, readJsonFile, writeJsonFile } from "./utils.js"

export const bugService = {
    query,
    getById,
    save,
    remove,
    generateBugsPdf
}

const bugs = readJsonFile('./data/bugs.json')

async function query() {
    try {
        return bugs
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
            bugs.unshift(bugToSave)
        }
        await _saveBugsToFile()
        return bugToSave
    } catch (err) {
        throw err
    }
}

async function generateBugsPdf(res) {
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
            doc.text(`Created At: ${new Date(bug.createdAt).toLocaleString()}`)
            doc.moveDown()
        })

        // Finalize the PDF and end the stream
        doc.end()
    } catch (err) {
        console.error('Error generating PDF:', err);
        res.status(500).send('Failed to generate PDF');
    }
}

// Private functions
function _saveBugsToFile() {
    return writeJsonFile('./data/bugs.json', bugs)
}
