
const puppeter=require("puppeteer")
const fs=require("fs")
const path=require("path")
const QRCode=require("qrcode")

exports.generatePDF=async(req,res)=>{

    const profile=req.body

    const html=`
    <html>
        <body>
            <h1>${profile.fullName}</h1>
            <h3>${profile.headline}</h3>
            <p>${profile.fullName}</p>
            <h2>Skills</h2>
            <ul>
                ${profile.skills.map(
                    skill=>
                        `<li>${skill}</li>`
                ).join("")}
            </ul>
        </body>
    </html>
`
    const browser=await puppeter.launch()
    const page=await browser.newPage()
    await page.setContent(html)
    const filePath=path.join(__dirname,"../output/profile.pdf")

    await page.pdf({
        path:filePath,
        format:"A4"
    })

    await browser.close()

    res.json({
        message:"PDF Generated",
        file:'/output/profile.pdf'
    })

}

exports.passPreview=async (req,res)=>{
    const profile=req.body
    const qr=await QRCode.toDataURL(profile.linkedin)
    const preview={
        name:profile.fullName,
        title:profile.headline,
        quCode:qr
    }
    res.json(preview)
}
