
const puppeter = require("puppeteer")
const fs = require("fs")
const path = require("path")
const QRCode = require("qrcode")
const { error } = require("console")

exports.generatePDF = async (req, res) => {

    try{

    const profile = req.body

    const qrTarget=
    profile.linkedin ||
    profile.portfolio ||
    profile.github ||
    "https://example.com"
    const qrCodeDataUrl=await QRCode.toDataURL(qrTarget)

    const html = `
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        ink: "#0f172a",
                        slateMist: "#e2e8f0",
                        panel: "#f8fafc",
                        accent: "#0f766e"
                    },
                    boxShadow: {
                        card: "0 24px 80px rgba(15, 23, 42, 0.12)"
                    }
                }
            }
        }
    </script>
</head>

<body class="bg-slate-100 m-0 text-slate-800">
    <main class="min-h-screen px-10 py-12">
        <section class="mx-auto max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-card">
            <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-800 px-10 py-10 text-white">
                <div class="flex items-start justify-between gap-8">
                    <div class="max-w-2xl">
                        <div class="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-100">
                            Professional Profile
                        </div>
                        <h1 class="text-4xl font-black tracking-tight">${profile.fullName}</h1>
                        <p class="mt-3 text-lg text-slate-200">${profile.headline}</p>
                    </div>
                    <div class="rounded-3xl bg-white p-4 text-center text-slate-700 shadow-lg">
                        <img class="h-28 w-28 rounded-2xl" src="${qrCodeDataUrl}" alt="QR Code" />
                        <div class="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Quick Access</div>
                    </div>
                </div>
            </div>

            <div class="grid gap-8 px-10 py-10 md:grid-cols-[1.8fr_1fr]">
                <div class="space-y-8">
                    <section class="rounded-3xl border border-slate-200 bg-panel p-7">
                        <div class="mb-4 flex items-center gap-3">
                            <div class="h-2.5 w-2.5 rounded-full bg-accent"></div>
                            <h2 class="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Summary</h2>
                        </div>
                        <p class="text-[15px] leading-7 text-slate-700">${profile.summary}</p>
                    </section>

                    <section class="rounded-3xl border border-slate-200 bg-white p-7">
                        <div class="mb-5 flex items-center gap-3">
                            <div class="h-2.5 w-2.5 rounded-full bg-slate-900"></div>
                            <h2 class="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">Skills</h2>
                        </div>
                        <div class="flex flex-wrap gap-3">
                            ${profile.skills.map(skill => `
                                <span class="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                                    ${skill}
                                </span>
                            `).join("")}
                        </div>
                    </section>
                </div>
            </div>
        </section>
    </main>
</body>
</html>
`

    const filePath = path.join(__dirname, "../output/profile.pdf")
    const browser = await puppeter.launch()
    const page = await browser.newPage()
    await page.setContent(html)

    await page.pdf({
        path: filePath,
        format: "A4",
        printBackground:true
    })

    await browser.close()

    res.json({
        message:"PDF generated sucessfully",
        file:"/output/profile.pdf",
        qrTarget
    })
  
}catch(erro){
    console.error("PDF generation error: ",error)
    res.status(500),json({
        message:"Failed to generate PDF",
        error:error.message
    })
}
}

exports.passPreview = async (req, res) => {
    const profile = req.body
    const qr = await QRCode.toDataURL(profile.linkedin)
    const preview = {
        name: profile.fullName,
        title: profile.headline,
        quCode: qr
    }
    res.json(preview)
}
