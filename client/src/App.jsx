import { useState } from "react"
import { api } from "./api/api"

function App() {
  const [form, setForm] = useState({
    fullName: "",
    headline: "",
    summary: "",
    skills: "",
    linkedin: ""
  })

  const [cardData, setCardData] = useState(null)
  const [pdfUrl, setPdfUrl] = useState("")

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleGenerate = async (e) => {
    e.preventDefault()

    const profile = {
      fullName: form.fullName,
      headline: form.headline,
      summary: form.summary,
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== ""),
      linkedin: form.linkedin
    }

    try {
      const passResponse = await api.post("/pass-preview", profile)
console.log("pass preview response:", passResponse.data)
setCardData(passResponse.data)

      const pdfResponse = await api.post("/generate-pdf", profile)
      setPdfUrl(pdfResponse.data.file)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "Arial",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto"
        }}
      >
        <h1 style={{ textAlign: "center", marginTop: 0, marginBottom: "4rem" }}>
          QuickCard
        </h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.9fr)",
            gap: "3rem",
            alignItems: "start"
          }}
        >
          <form onSubmit={handleGenerate}>
            <div className="space-y-12">
              <div className="border-b border-gray-900/10 pb-12">
                <h2 className="text-base/7 font-semibold text-gray-900">
                  Enter your details
                </h2>
                <p className="mt-1 text-sm/6 text-gray-600">
                  This information will be presented on your QuickCard.
                </p>

                <p className="mt-1 text-sm/6 text-gray-600">Enter your full name.</p>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="abc"
                  className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                />

                <p className="mt-1 text-sm/6 text-gray-600">Enter headline.</p>
                <input
                  id="headline"
                  type="text"
                  name="headline"
                  value={form.headline}
                  onChange={handleChange}
                  placeholder="abc"
                  className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                />

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <p className="mt-1 text-sm/6 text-gray-600">
                      Quick summary about yourself.
                    </p>
                    <input
                      id="summary"
                      type="text"
                      name="summary"
                      value={form.summary}
                      onChange={handleChange}
                      placeholder="abc"
                      className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <p className="mt-1 text-sm/6 text-gray-600">Enter your skills.</p>
                    <div className="mt-2">
                      <textarea
                        id="skills"
                        name="skills"
                        rows="3"
                        value={form.skills}
                        onChange={handleChange}
                        placeholder="Separated with commas"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      ></textarea>
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <p className="mt-1 text-sm/6 text-gray-600">Enter LinkedIn URL.</p>
                    <input
                      id="linkedin"
                      type="text"
                      name="linkedin"
                      value={form.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/your-profile"
                      className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>
            </div>

            <br />
            <br />
            <button
              type="submit"
              style={{
                marginTop: "24px",
                background: "linear-gradient(to right, #4f46e5, #7c3aed)",
                color: "white",
                padding: "12px 24px",
                border: "none",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 10px 20px rgba(79, 70, 229, 0.25)"
              }}
            >
              Generate QuickCard
            </button>
          </form>

          <div
            style={{
              minHeight: "320px",
              padding: "1.5rem",
              borderRadius: "20px",
              backgroundColor: "rgba(255,255,255,0.7)",
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
              position: "sticky",
              top: "2rem"
            }}
          >
            <h2 style={{ marginTop: 0 }}>Result</h2>
            {!cardData && !pdfUrl && (
              <p style={{ color: "#475569" }}>
                Generate your QuickCard to see the preview here.
              </p>
            )}

            {cardData && (
              <div style={{ marginTop: "1rem" }}>
                <h3 style={{ marginBottom: "0.5rem" }}>{cardData.name}</h3>
                <p style={{ marginTop: 0 }}>{cardData.title}</p>
                <img src={cardData.qrCode} alt="QR Code" width="150" />
              </div>
            )}

            {pdfUrl && (
              <div style={{ marginTop: "1rem" }}>
                <a href={pdfUrl} target="_blank" rel="noreferrer">
                  Open PDF
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
