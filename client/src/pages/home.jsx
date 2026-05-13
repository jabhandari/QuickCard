import { useEffect, useState } from "react"
import { api } from "../api/api"

const initialForm = {
  fullName: "",
  headline: "",
  summary: "",
  skills: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  portfolio: "",
  resume: "",
  education: "",
  experience: "",
  projects: ""
}

function splitList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function splitLines(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseEducation(value) {
  return splitLines(value).map((line) => {
    const [institution = "", program = "", dates = ""] = line
      .split("|")
      .map((item) => item.trim())

    return { institution, program, dates }
  })
}

function parseExperience(value) {
  return splitLines(value).map((line) => {
    const [company = "", role = "", dates = "", details = ""] = line
      .split("|")
      .map((item) => item.trim())

    return {
      company,
      role,
      dates,
      description: details ? [details] : []
    }
  })
}

function parseProjects(value) {
  return splitLines(value).map((line) => {
    const [name = "", description = "", link = ""] = line
      .split("|")
      .map((item) => item.trim())

    return { name, description, link }
  })
}

function Home() {
  const [form, setForm] = useState(initialForm)
  const [cardData, setCardData] = useState(null)
  const [pdfUrl, setPdfUrl] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdfUrl])

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    setErrorMessage("")

    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
      setPdfUrl("")
    }

    const profile = {
      fullName: form.fullName,
      headline: form.headline,
      summary: form.summary,
      skills: splitList(form.skills),
      email: form.email,
      phone: form.phone,
      location: form.location,
      linkedin: form.linkedin,
      github: form.github,
      portfolio: form.portfolio,
      resume: form.resume,
      education: parseEducation(form.education),
      experience: parseExperience(form.experience),
      projects: parseProjects(form.projects)
    }

    try {
      const passResponse = await api.post("/pass-preview", profile)
      setCardData(passResponse.data)

      const pdfResponse = await api.post("/generate-pdf", profile, {
        responseType: "blob"
      })
      const blobUrl = URL.createObjectURL(pdfResponse.data)

      setPdfUrl(blobUrl)
    } catch (error) {
      console.error(error)
      setPdfUrl("")
      setErrorMessage(
        error.response?.data?.message || "Could not generate your PDF locally."
      )
    }
  }

  return (
    <div className="app-shell">
      <div className="app-backdrop" />
      <main className="app-container">
        <section className="hero-copy">
          <span className="hero-tag">Digital profile kit</span>
          <h1>QuickCard</h1>
          <p>
            Build a clean profile card and export a polished PDF version from the
            same details.
          </p>
        </section>

        <div className="workspace-grid">
          <form className="editor-panel" onSubmit={handleGenerate}>
            <div className="panel-header">
              <h2>Enter your details</h2>
              <p>This information will be presented on your QuickCard.</p>
            </div>

            <div className="form-grid">
              <div className="field full-span">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Alex Johnson"
                />
              </div>

              <div className="field full-span">
                <label htmlFor="headline">Headline</label>
                <input
                  id="headline"
                  type="text"
                  name="headline"
                  value={form.headline}
                  onChange={handleChange}
                  placeholder="Product designer and frontend developer"
                />
              </div>

              <div className="field full-span">
                <label htmlFor="summary">Summary</label>
                <textarea
                  id="summary"
                  name="summary"
                  rows="3"
                  value={form.summary}
                  onChange={handleChange}
                  placeholder="A short introduction about your work and strengths"
                />
              </div>

              <div className="field full-span">
                <label htmlFor="skills">Skills</label>
                <textarea
                  id="skills"
                  name="skills"
                  rows="3"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="React, UI Design, Node.js, Figma"
                />
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                />
              </div>

              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8901"
                />
              </div>

              <div className="field">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Toronto, ON"
                />
              </div>

              <div className="field">
                <label htmlFor="linkedin">LinkedIn</label>
                <input
                  id="linkedin"
                  type="url"
                  name="linkedin"
                  value={form.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>

              <div className="field">
                <label htmlFor="github">GitHub</label>
                <input
                  id="github"
                  type="url"
                  name="github"
                  value={form.github}
                  onChange={handleChange}
                  placeholder="https://github.com/your-profile"
                />
              </div>

              <div className="field">
                <label htmlFor="portfolio">Portfolio</label>
                <input
                  id="portfolio"
                  type="url"
                  name="portfolio"
                  value={form.portfolio}
                  onChange={handleChange}
                  placeholder="https://your-portfolio.com"
                />
              </div>

              <div className="field full-span">
                <label htmlFor="resume">Resume link</label>
                <input
                  id="resume"
                  type="url"
                  name="resume"
                  value={form.resume}
                  onChange={handleChange}
                  placeholder="https://resume-url"
                />
              </div>

              <div className="field full-span">
                <label htmlFor="education">Education</label>
                <textarea
                  id="education"
                  name="education"
                  rows="3"
                  value={form.education}
                  onChange={handleChange}
                  placeholder=" Example University | Example Degree | years attended | Additional details like GPA or honors"
                />
              </div>

              <div className="field full-span">
                <label htmlFor="experience">Experience</label>
                <textarea
                  id="experience"
                  name="experience"
                  rows="4"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder=" Example Company | Example Position | 2023-09 - 2025-04 | Description of responsibilities and achievements"
                />
              </div>

              <div className="field full-span">
                <label htmlFor="projects">Projects</label>
                <textarea
                  id="projects"
                  name="projects"
                  rows="3"
                  value={form.projects}
                  onChange={handleChange}
                  placeholder=" Example Project | Description | https://github.com/example/project"
                />
              </div>
            </div>

            <button className="primary-button" type="submit">
              Generate QuickCard
            </button>
          </form>

          <aside className="result-panel">
            <div className="result-header">
              <span className="result-badge">Preview</span>
              <h2>Result</h2>
              <p>Live output for your generated card and downloadable PDF.</p>
            </div>

            {!cardData && !pdfUrl && (
              <div className="empty-state">
                <div className="empty-state-orb" />
                <h3>No card yet</h3>
                <p>Submit the form to generate your QR card preview and PDF link.</p>
              </div>
            )}

            {cardData && (
              <div className="preview-card">
                <div className="preview-card-top">
                  <div>
                    <span className="preview-label">Profile</span>
                    <h3>{cardData.name}</h3>
                    <p>{cardData.title}</p>
                    {cardData.qrTarget && <small>{cardData.qrTarget}</small>}
                  </div>
                  <div className="preview-qr-wrap">
                    <img src={cardData.qrCode} alt="QR Code" width="144" />
                  </div>
                </div>
              </div>
            )}

            {pdfUrl && (
              <div className="pdf-panel">
                <div>
                  <span className="preview-label">Export</span>
                  <h3>Profile PDF ready</h3>
                  <p>Open the generated PDF in a new tab.</p>
                </div>
                <a className="pdf-link" href={pdfUrl} target="_blank" rel="noreferrer">
                  Open PDF
                </a>
              </div>
            )}

            {errorMessage && (
              <div className="pdf-panel">
                <div>
                  <span className="preview-label">Error</span>
                  <h3>Generation failed</h3>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}

export default Home
