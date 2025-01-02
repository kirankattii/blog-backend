import express from 'express'
import 'dotenv/config'
import fileUpload from 'express-fileupload'
import helmet from 'helmet'
import cors from 'cors'
import { limiter } from './config/ratelimiter.js'
const app = express()
const PORT = process.env.PORT || 8000

app.get('/', (req, res) => {
  return res.json({ message: "Hello It;s working" })
})

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(fileUpload())
app.use(express.static('public'))
// app.use(helmet())
app.use(cors())
// app.use(limiter)


import apiRoutes from './routes/api.js'
app.use('/api', apiRoutes)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)
)
