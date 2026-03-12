const express=require("express")
const router=express.Router()

const {generatePDF, passPreview}=require("../controllers/pdfController")

router.post("/generate-pdf",generatePDF)
router.post("/pass-preview",passPreview)

module.exports=router