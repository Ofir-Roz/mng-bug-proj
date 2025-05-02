import express, { json } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

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

import { bugRoutes } from './api/bug/bug.routes.js'
app.use('/api/bug', bugRoutes)


app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

// Start the server and define a default route
const port = 3030
app.listen(port, () => {
     loggerService.info(`Server listening on port http://127.0.0.1:${port}`) 
})
app.get('/', (req, res) => {
    res.send(`<h1>Hello And Welcome!</h1>`)
})