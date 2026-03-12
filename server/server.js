const express= require("express");
const cors= require("cors");
const bodyParser=require("body-parser");
const path=require("path")

const pdfRoutes=require("./routes/pdfRoutes");

const app=express()

app.use(cors())
app.use(bodyParser.json())

app.use("/output",express.static(path.join(__dirname,"output")))
app.use("/api",pdfRoutes)

app.get("/health",(req,res)=>{
    res.json({status:"server running"})
})

const PORT=5000

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})
