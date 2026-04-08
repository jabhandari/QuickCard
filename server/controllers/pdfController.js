const puppeteer = require("puppeteer-core")
const chromium = require("@sparticuz/chromium")
const QRCode = require("qrcode")

// On local dev, fall back to a locally installed Chrome
const isLocal = !process.env.RENDER

function getQrTarget(profile = {}) {
    return (
        profile.linkedin ||
        profile.portfolio ||
        profile.gitHub ||
        profile.github ||
        "https://example.com"
    )
}

function buildHtml(profile, qrCodeDataUrl) {
    const skills = Array.isArray(profile.skills) ? profile.skills : []

    return `
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
                        inkSoft: "#1e293b",
                        muted: "#64748b",
                        panel: "#f8fafc",
                        panelSoft: "#f1f5f9",
                        panelWarm: "#fffdf7",
                        line: "#dbe4ee",
                        brand: "#2563eb",
                        accent: "#0f766e",
                        gold: "#f59e0b"
                    },
                    boxShadow: {
                        float: "0 24px 70px rgba(15, 23, 42, 0.10)",
                        soft: "0 18px 45px rgba(15, 23, 42, 0.08)"
                    }
                }
            }
        }
    </script>
</head>

<body class="m-0 bg-slate-100 text-ink">
    <main class="bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.13),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(245,158,11,0.10),_transparent_20%),linear-gradient(180deg,#f8fbff_0%,#eef3f8_100%)] px-6 py-6">
        <section class="mx-auto max-w-5xl rounded-[34px] border border-white/70 bg-white/90 shadow-float">
            <div class="relative overflow-hidden rounded-t-[34px] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_52%,#0f766e_100%)] px-8 py-8 text-white">
                <div class="absolute right-[-60px] top-[-60px] h-52 w-52 rounded-full bg-white/10 blur-2xl"></div>
                <div class="absolute bottom-[-90px] left-[35%] h-52 w-52 rounded-full bg-sky-300/10 blur-3xl"></div>

                <div class="relative flex items-start justify-between gap-8">
                    <div class="max-w-3xl">
                        <div class="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-100">
                            QuickCard Profile
                        </div>
                        <h1 class="mt-4 text-[42px] font-black tracking-[-0.06em] leading-tight">${profile.fullName || ""}</h1>
                        <p class="mt-3 max-w-2xl text-base leading-7 text-sky-50/90">${profile.headline || ""}</p>

                        <div class="mt-5 flex flex-wrap gap-2.5">
                            ${profile.linkedin ? `
                                <a href="${profile.linkedin}" target="_blank" rel="noreferrer" class="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white no-underline">
                                    LinkedIn
                                </a>
                            ` : ""}
                            ${profile.gitHub ? `
                                <a href="${profile.gitHub}" target="_blank" rel="noreferrer" class="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white no-underline">
                                    GitHub
                                </a>
                            ` : ""}
                            ${profile.Email ? `
                                <a href="mailto:${profile.Email}" class="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white no-underline">
                                    Email
                                </a>
                            ` : ""}
                            ${profile.Resume ? `
                                <a href="${profile.Resume}" target="_blank" rel="noreferrer" class="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white no-underline">
                                    Resume
                                </a>
                            ` : ""}
                        </div>
                    </div>

                    <div class="relative shrink-0 rounded-[28px] bg-white/95 p-4 text-center text-ink shadow-soft">
                        <div class="absolute inset-x-6 top-4 h-8 rounded-full bg-sky-100/80 blur-xl"></div>
                        <div class="relative rounded-[22px] bg-white p-3">
                            <img class="h-28 w-28 rounded-[16px]" src="${qrCodeDataUrl}" alt="QR Code" />
                        </div>
                        <div class="mt-4 text-[11px] font-bold uppercase tracking-[0.24em] text-muted">Scan to connect</div>
                    </div>
                </div>
            </div>

            <div class="grid gap-6 px-8 py-7 md:grid-cols-[1.55fr_0.95fr]">
                <div class="space-y-6">
                    <section class="break-inside-avoid rounded-[28px] border border-line bg-panel p-6">
                        <div class="mb-4 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="h-3 w-3 rounded-full bg-brand"></div>
                                <h2 class="text-sm font-bold uppercase tracking-[0.2em] text-muted">Summary</h2>
                            </div>
                            <div class="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
                                About
                            </div>
                        </div>
                        <p class="text-[14px] leading-7 text-inkSoft">${profile.summary || ""}</p>
                    </section>

                    <section class="break-inside-avoid rounded-[28px] border border-line bg-white p-6">
                        <div class="mb-4 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="h-3 w-3 rounded-full bg-accent"></div>
                                <h2 class="text-sm font-bold uppercase tracking-[0.2em] text-muted">Skills</h2>
                            </div>
                            <div class="rounded-full bg-panelSoft px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                                Core strengths
                            </div>
                        </div>
                        <div class="flex flex-wrap gap-3">
                            ${skills.map((skill) => `
                                <span class="rounded-full border border-line bg-panelSoft px-4 py-2 text-xs font-semibold text-slate-700">
                                    ${skill}
                                </span>
                            `).join("")}
                        </div>
                    </section>
                </div>

                <aside class="space-y-6">
                    <section class="break-inside-avoid rounded-[28px] border border-line bg-panel p-6">
                        <div class="flex items-center justify-between">
                            <div class="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">Contact</div>
                            <div class="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                                Reach out
                            </div>
                        </div>
                        <div class="mt-5 flex flex-wrap gap-3">
                            ${profile.linkedin ? `
                                <a
                                  href="${profile.linkedin}"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  class="inline-flex items-center rounded-full border border-white bg-white/80 px-4 py-2 text-sm font-medium text-inkSoft shadow-sm transition hover:bg-white"
                                >
                                  LinkedIn
                                </a>
                            ` : ""}

                            ${profile.gitHub ? `
                                <a
                                  href="${profile.gitHub}"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  class="inline-flex items-center rounded-full border border-white bg-white/80 px-4 py-2 text-sm font-medium text-inkSoft shadow-sm transition hover:bg-white"
                                >
                                  GitHub
                                </a>
                            ` : ""}

                            ${profile.Email ? `
                                <a
                                  href="mailto:${profile.Email}"
                                  class="inline-flex items-center rounded-full border border-white bg-white/80 px-4 py-2 text-sm font-medium text-inkSoft shadow-sm transition hover:bg-white"
                                >
                                  Email
                                </a>
                            ` : ""}

                            ${profile.Resume ? `
                                <a
                                  href="${profile.Resume}"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  class="inline-flex items-center rounded-full border border-white bg-white/80 px-4 py-2 text-sm font-medium text-inkSoft shadow-sm transition hover:bg-white"
                                >
                                  Resume
                                </a>
                            ` : ""}
                        </div>
                    </section>
                </aside>
            </div>
        </section>
    </main>
</body>
</html>
`
}

function getDownloadFileName(profile = {}) {
    const baseName = (profile.fullName || "quickcard-profile")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")

    return `${baseName || "quickcard-profile"}.pdf`
}

async function launchBrowser() {
  if (isLocal) {
    // Use the full puppeteer package's bundled Chrome for local dev
    const localPuppeteer = require("puppeteer")
    return localPuppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    })
  }

  // Cloud/Render: use @sparticuz/chromium
  return puppeteer.launch({
    headless: chromium.headless,
    executablePath: await chromium.executablePath(),
    args: chromium.args
  })
}
exports.generatePDF = async (req, res) => {
    try {
        const profile = req.body
        const qrTarget = getQrTarget(profile)
        const qrCodeDataUrl = await QRCode.toDataURL(qrTarget)
        const html = buildHtml(profile, qrCodeDataUrl)
        const fileName = getDownloadFileName(profile)
        const browser = await launchBrowser()

        try {
            const page = await browser.newPage()
            await page.setContent(html, { waitUntil: "networkidle0" })
            const pdfBuffer = await page.pdf({
                format: "A4",
                printBackground: true
            })

            res.setHeader("Content-Type", "application/pdf")
            res.setHeader("Content-Disposition", `inline; filename="${fileName}"`)
            res.setHeader("X-QuickCard-QR-Target", qrTarget)
            res.send(pdfBuffer)
        } finally {
            await browser.close()
        }
    } catch (error) {
        console.error("PDF generation error:", error)
        res.status(500).json({
            message: "Failed to generate PDF",
            error: error.message
        })
    }
}

exports.passPreview = async (req, res) => {
    try {
        const profile = req.body
        const qrTarget = getQrTarget(profile)
        const qrCode = await QRCode.toDataURL(qrTarget)

        res.json({
            name: profile.fullName,
            title: profile.headline,
            qrCode,
            qrTarget
        })
    } catch (error) {
        console.error("Pass preview error:", error)
        res.status(500).json({
            message: "Failed to generate pass preview",
            error: error.message
        })
    }
}
