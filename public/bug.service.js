
// add axios + cookies
import Axios from 'axios'
const axios = Axios.create({
    withCredentials: true,
})

const BASE_URL = 'http://127.0.0.1:3030/api/bug/'

export const bugService = {
    query,
    getById,
    save,
    remove,
    download,
    getDefaultFilter
}


async function query(filterBy = {}) {
    filterBy = { ...filterBy }
    try {
        const { data: bugs } = await axios.get(BASE_URL, { params: filterBy })
        return bugs
    } catch (err) {
        console.log(`err:`, err)
        throw err
    }
}

async function getById(bugId) {
    try {
        const { data: bug } = await axios.get(BASE_URL + bugId, {
            withCredentials: true, // Include cookies in the request
        })
        return bug
    } catch (err) {
        console.log(`err:`, err)
        throw err
    }
}

function remove(bugId) {
    try {
        return axios.delete(BASE_URL + bugId)
    } catch (err) {
        console.log(`err:`, err)
        throw err
    }
}


async function save(bug) {

    const method = bug._id ? 'put' : 'post'

    try {
        const { data: savedBug } = await axios[method](BASE_URL + (bug._id || ''), bug)
        return savedBug
    } catch (err) {
        console.log(`err:`, err)
        throw err
    }
}

async function download() {
    try {
        const res = await axios.get(BASE_URL + `downloadBugs`, {
            responseType: 'blob', // Important: Set response type to 'blob' to handle binary data
        });

        // Create a Blob from the response data
        const blob = new Blob([res.data], { type: 'application/pdf' });

        // Create a URL for the Blob and return it
        return window.URL.createObjectURL(blob);
    } catch (err) {
        console.log('err:', err)
        throw err
    }
}

function getDefaultFilter() {
    return { title: '', minSeverity: '' }
}
