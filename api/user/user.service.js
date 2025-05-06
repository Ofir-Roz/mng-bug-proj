import { makeId, readJsonFile, writeJsonFile } from '../../services/utils.js'

export const userService = {
    query,
    getById,
    save,
    remove
}

const users = readJsonFile('./data/users.json')

async function query(filterBy = {}, sortBy = {}) {
    let usersToDisplay = users
    try {
        // Filtering
        if (filterBy.fullname) {
            const regExp = new RegExp(filterBy.fullname, 'i')
            usersToDisplay = usersToDisplay.filter(user => regExp.test(user.fullname))
        }

        if (filterBy.username) {
            const regExp = new RegExp(filterBy.username, 'i')
            usersToDisplay = usersToDisplay.filter(user => regExp.test(user.username))
        }

        if (filterBy.minScore) {
            usersToDisplay = usersToDisplay.filter(user => user.score >= filterBy.minScore)
        }

        // Sorting
        if (sortBy.fullname)
            usersToDisplay.sort((a, b) => (a.fullname.localeCompare(b.fullname) * sortBy.fullname))

        if (sortBy.username)
            usersToDisplay.sort((a, b) => (a.username.localeCompare(b.username) * sortBy.username))

        if (sortBy.score)
            usersToDisplay.sort((a, b) => (a.score - b.score) * sortBy.score)

        return usersToDisplay
    } catch (err) {
        throw err
    }
}

async function getById(userId) {
    try {
        const user = users.find(user => user._id === userId)
        if (!user) throw new Error('User not found')
        return user
    } catch (err) {
        throw err
    }
}

async function remove(userId) {
    try {
        const userIdx = users.findIndex(user => user._id === userId)
        if (userIdx === -1) throw new Error('User not found')
        users.splice(userIdx, 1)
        await _saveUsersToFile()
    } catch (err) {
        throw err
    }

}

async function save(userToSave) {
    try {
        if (userToSave._id) {
            const userIdx = users.findIndex(user => user._id === userToSave._id)
            if (userIdx === -1) throw new Error('User not found')
            users[userIdx] = userToSave
        }
        else {
            userToSave._id = makeId()
            users.unshift(userToSave)
        }
        await _saveUsersToFile()
        return userToSave
    } catch (err) {
        throw err
    }
}

// Private functions
function _saveUsersToFile() {
    return writeJsonFile('./data/users.json', users)
}
