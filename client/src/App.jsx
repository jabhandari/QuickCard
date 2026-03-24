import { useEffect, useState } from "react"
import { api } from "./api/api"

function App() {
  const [form, setForm] = useState({
    fullName: "",
    headline: "",
    summary: "",
    skills: "",
    linkedin: "",
    gitHub:"",
    Email:"",
    Resume:""
  })

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
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== ""),
      linkedin: form.linkedin,
      gitHub: form.gitHub,
      Email: form.Email,
      Resume:form.Resume
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
                <input
                  id="summary"
                  type="text"
                  name="summary"
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
                  rows="4"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="React, UI Design, Node.js, Figma"
                ></textarea>
              </div>

              <div className="field">
                <label htmlFor="linkedin">LinkedIn</label>
                <input
                  id="linkedin"
                  type="text"
                  name="linkedin"
                  value={form.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>

              <div className="field">
                <label htmlFor="gitHub">GitHub</label>
                <input
                  id="gitHub"
                  type="text"
                  name="gitHub"
                  value={form.gitHub}
                  onChange={handleChange}
                  placeholder="https://github.com/your-profile"
                />
              </div>

              <div className="field">
                <label htmlFor="Email">Email</label>
                <input
                  id="Email"
                  type="email"
                  name="Email"
                  value={form.Email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                />
              </div>

              <div className="field">
                <label htmlFor="Resume">Resume</label>
                <input
                  id="Resume"
                  type="text"
                  name="Resume"
                  value={form.Resume}
                  onChange={handleChange}
                  placeholder="https://resume-url"
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

export default App
