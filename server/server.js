require("dotenv").config()

const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const pdfRoutes = require("./routes/pdfRoutes")

const app = express()
const allowedOrigins = [
  "http://localhost:5173",
  "https://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean)

const PORT = process.env.PORT || 5000

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
            return
        }

        callback(new Error("Not allowed by CORS"))
    }
}))
app.use(bodyParser.json())

app.use("/api", pdfRoutes)

app.get("/health", (req, res) => {
    res.json({ status: "server running" })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
