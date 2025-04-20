async function onGetBugs() {
    const elData = document.querySelector('pre')
    const res = await fetch('/api/bug')
    const bugs = await res.json()
    elData.innerText = JSON.stringify(bugs, null, 4)
}

async function onDownloadBugs() {
    const res = await fetch('/api/bug/downloadBugs')
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bugs.pdf'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
}