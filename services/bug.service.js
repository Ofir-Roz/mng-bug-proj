import { makeId, readJsonFile, writeJsonFile } from "./utils.js"

export const bugService = {
    query,
    getById,
    save,
    remove,
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

// Private functions
function _saveBugsToFile() {
    return writeJsonFile('./data/bugs.json', bugs)
}
