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
        if (!origin) {
            callback(null, true)
            return
        }

        if (allowedOrigins.includes(origin)) {
            callback(null, true)
            return
        }

        // Allow any Vercel preview deployment URL for this project
        if (origin.endsWith(".vercel.app")) {
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

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`)
})

process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err)
    process.exit(1)
})

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason)
    process.exit(1)
})
