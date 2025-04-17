async function onGetBugs() {
    const elData = document.querySelector('pre')
    const res = await fetch('/api/bug')
    const bugs = await res.json()
    elData.innerText = JSON.stringify(bugs, null, 4)
}