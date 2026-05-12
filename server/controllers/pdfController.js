const puppeteer = require("puppeteer")
const QRCode = require("qrcode")

function escapeHtml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

function normalizeProfile(profile = {}) {
    return {
        ...profile,
        github: profile.github || profile.gitHub || "",
        email: profile.email || profile.Email || "",
        resume: profile.resume || profile.Resume || "",
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        education: Array.isArray(profile.education) ? profile.education : [],
        experience: Array.isArray(profile.experience) ? profile.experience : [],
        projects: Array.isArray(profile.projects) ? profile.projects : []
    }
}

function getQrTarget(profile = {}) {
    return (
        profile.resume ||
        profile.linkedin ||
        profile.portfolio ||
        profile.github ||
        "https://example.com"
    )
}

function renderLink(url, label, classes) {
    if (!url) {
        return ""
    }

    return `
        <a href="${escapeHtml(url)}" target="_blank" rel="noreferrer" class="${classes}">
            ${escapeHtml(label)}
        </a>
    `
}

function renderContactItem(value, label, href = value) {
    if (!value) {
        return ""
    }

    const link = href
        ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="text-inkSoft no-underline">${escapeHtml(value)}</a>`
        : escapeHtml(value)

    return `
        <div class="qc-contact-card rounded-[18px] border border-white bg-white/80 px-4 py-3 shadow-sm">
            <div class="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">${escapeHtml(label)}</div>
            <div class="mt-1 text-sm font-semibold text-inkSoft">${link}</div>
        </div>
    `
}

function renderSection(title, badge, dotColor, body) {
    if (!body) {
        return ""
    }

    return `
        <section class="break-inside-avoid rounded-[28px] border border-line bg-white p-6">
            <div class="qc-section-title mb-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="h-3 w-3 rounded-full ${dotColor}"></div>
                    <h2 class="text-sm font-bold uppercase tracking-[0.2em] text-muted">${escapeHtml(title)}</h2>
                </div>
                <div class="rounded-full bg-panelSoft px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                    ${escapeHtml(badge)}
                </div>
            </div>
            ${body}
        </section>
    `
}

function renderEducation(education) {
    if (!education.length) {
        return ""
    }

    return education.map((item) => {
        const title = [item.institution, item.program].filter(Boolean).join(" - ")
        const dates = item.dates || [item.startDate, item.endDate].filter(Boolean).join(" - ")

        return `
            <div class="not-last:mb-4">
                <div class="text-sm font-bold text-inkSoft">${escapeHtml(title)}</div>
                ${dates ? `<div class="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted">${escapeHtml(dates)}</div>` : ""}
            </div>
        `
    }).join("")
}

function renderExperience(experience) {
    if (!experience.length) {
        return ""
    }

    return experience.map((item) => {
        const title = [item.role, item.company].filter(Boolean).join(" at ")
        const dates = item.dates || [item.startDate, item.endDate].filter(Boolean).join(" - ")
        const details = Array.isArray(item.description) ? item.description : [item.description].filter(Boolean)

        return `
            <div class="not-last:mb-5">
                <div class="text-sm font-bold text-inkSoft">${escapeHtml(title)}</div>
                ${dates ? `<div class="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted">${escapeHtml(dates)}</div>` : ""}
                ${details.length ? `
                    <ul class="mt-3 list-disc space-y-1 pl-5 text-[13px] leading-6 text-inkSoft">
                        ${details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}
                    </ul>
                ` : ""}
            </div>
        `
    }).join("")
}

function renderProjects(projects) {
    if (!projects.length) {
        return ""
    }

    return projects.map((item) => `
        <div class="not-last:mb-5">
            <div class="text-sm font-bold text-inkSoft">${escapeHtml(item.name || "")}</div>
            ${item.description ? `<p class="mt-2 text-[13px] leading-6 text-inkSoft">${escapeHtml(item.description)}</p>` : ""}
            ${item.link ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer" class="mt-2 inline-block text-xs font-bold text-brand no-underline">${escapeHtml(item.link)}</a>` : ""}
        </div>
    `).join("")
}

function buildHtml(profile, qrCodeDataUrl) {
    const skills = Array.isArray(profile.skills) ? profile.skills : []
    const chipClass = "rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white no-underline"
    const contactBody = [
        renderContactItem(profile.email, "Email", profile.email ? `mailto:${profile.email}` : ""),
        renderContactItem(profile.phone, "Phone", ""),
        renderContactItem(profile.location, "Location", ""),
        renderContactItem(profile.linkedin, "LinkedIn"),
        renderContactItem(profile.github, "GitHub"),
        renderContactItem(profile.portfolio, "Portfolio"),
        renderContactItem(profile.resume, "Resume")
    ].join("")

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
    <style>
        @page {
            size: A4;
            margin: 8mm;
        }

        * {
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0;
            width: 210mm;
            min-height: 297mm;
            background: #eef3f8;
        }

        .qc-page {
            min-height: 281mm;
            padding: 0;
        }

        .qc-shell {
            width: 100%;
            max-width: none;
            overflow: hidden;
            border-radius: 18px;
        }

        .qc-hero {
            border-radius: 18px 18px 0 0;
            padding: 20px 24px;
        }

        .qc-hero h1 {
            margin-top: 12px;
            font-size: 30px;
            letter-spacing: -0.03em;
            line-height: 1.05;
        }

        .qc-hero p {
            margin-top: 8px;
            font-size: 12px;
            line-height: 1.55;
        }

        .qc-qr-card {
            border-radius: 18px;
            padding: 10px;
        }

        .qc-qr-card img {
            width: 88px;
            height: 88px;
        }

        .qc-body {
            display: grid;
            grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.95fr);
            gap: 12px;
            padding: 14px 16px 16px;
            break-before: avoid;
            page-break-before: avoid;
        }

        .qc-body .space-y-6 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 12px;
        }

        .qc-body section {
            border-radius: 15px;
            padding: 12px;
            break-inside: avoid;
            page-break-inside: avoid;
        }

        .qc-section-title {
            margin-bottom: 10px;
        }

        .qc-body h2 {
            font-size: 10px;
        }

        .qc-body p,
        .qc-body li,
        .qc-body a,
        .qc-body span,
        .qc-body small {
            font-size: 10px;
            line-height: 1.45;
        }

        .qc-contact-card {
            border-radius: 12px;
            padding: 8px 10px;
        }

        .qc-contact-grid {
            gap: 8px;
            margin-top: 10px;
        }

        @media print {
            .qc-shell,
            .qc-body {
                transform: none;
            }
        }
    </style>
</head>

<body class="m-0 bg-slate-100 text-ink">
    <main class="qc-page bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.13),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(245,158,11,0.10),_transparent_20%),linear-gradient(180deg,#f8fbff_0%,#eef3f8_100%)] px-6 py-6">
        <section class="qc-shell mx-auto max-w-5xl rounded-[34px] border border-white/70 bg-white/90 shadow-float">
            <div class="qc-hero relative overflow-hidden rounded-t-[34px] bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_52%,#0f766e_100%)] px-8 py-8 text-white">
                <div class="absolute right-[-60px] top-[-60px] h-52 w-52 rounded-full bg-white/10 blur-2xl"></div>
                <div class="absolute bottom-[-90px] left-[35%] h-52 w-52 rounded-full bg-sky-300/10 blur-3xl"></div>

                <div class="relative flex items-start justify-between gap-8">
                    <div class="max-w-3xl">
                        <div class="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-100">
                            QuickCard Profile
                        </div>
                        <h1 class="mt-4 text-[42px] font-black tracking-[-0.06em] leading-tight">${escapeHtml(profile.fullName || "")}</h1>
                        <p class="mt-3 max-w-2xl text-base leading-7 text-sky-50/90">${escapeHtml(profile.headline || "")}</p>

                        <div class="mt-5 flex flex-wrap gap-2.5">
                            ${renderLink(profile.linkedin, "LinkedIn", chipClass)}
                            ${renderLink(profile.github, "GitHub", chipClass)}
                            ${renderLink(profile.portfolio, "Portfolio", chipClass)}
                            ${profile.email ? `<a href="mailto:${escapeHtml(profile.email)}" class="${chipClass}">Email</a>` : ""}
                            ${renderLink(profile.resume, "Resume", chipClass)}
                        </div>
                    </div>

                    <div class="qc-qr-card relative shrink-0 rounded-[28px] bg-white/95 p-4 text-center text-ink shadow-soft">
                        <div class="absolute inset-x-6 top-4 h-8 rounded-full bg-sky-100/80 blur-xl"></div>
                        <div class="relative rounded-[22px] bg-white p-3">
                            <img class="h-28 w-28 rounded-[16px]" src="${qrCodeDataUrl}" alt="QR Code" />
                        </div>
                        <div class="mt-4 text-[11px] font-bold uppercase tracking-[0.24em] text-muted">Scan to connect</div>
                    </div>
                </div>
            </div>

            <div class="qc-body grid gap-6 px-8 py-7 md:grid-cols-[1.55fr_0.95fr]">
                <div class="space-y-6">
                    <section class="break-inside-avoid rounded-[28px] border border-line bg-panel p-6">
                        <div class="qc-section-title mb-4 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="h-3 w-3 rounded-full bg-brand"></div>
                                <h2 class="text-sm font-bold uppercase tracking-[0.2em] text-muted">Summary</h2>
                            </div>
                            <div class="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
                                About
                            </div>
                        </div>
                        <p class="text-[14px] leading-7 text-inkSoft">${escapeHtml(profile.summary || "")}</p>
                    </section>

                    ${renderSection("Experience", "Work history", "bg-gold", renderExperience(profile.experience))}

                    ${renderSection("Projects", "Selected work", "bg-brand", renderProjects(profile.projects))}

                    <section class="break-inside-avoid rounded-[28px] border border-line bg-white p-6">
                        <div class="qc-section-title mb-4 flex items-center justify-between">
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
                                    ${escapeHtml(skill)}
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
                        <div class="qc-contact-grid mt-5 grid gap-3">
                            ${contactBody}
                        </div>
                    </section>

                    ${renderSection("Education", "Learning", "bg-accent", renderEducation(profile.education))}
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
  const execPath = puppeteer.executablePath()
  console.log("Launching Chrome from:", execPath)
  return puppeteer.launch({
    headless: "new",
    executablePath: execPath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions"
    ]
  })
}
exports.generatePDF = async (req, res) => {
    try {
        const profile = normalizeProfile(req.body)
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
                printBackground: true,
                preferCSSPageSize: true,
                margin: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }
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
        const profile = normalizeProfile(req.body)
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
