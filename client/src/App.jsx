import { useState } from "react"
import { api } from "./api/api"

function App() {
  const [cardData, setCardData] = useState(null)
  const [pdfUrl, setPdfUrl] = useState("")

  const handleTest = async () => {
    const profile = {
      fullName: "Juhi Abhay Bhandari",
      headline: "Software Developer",
      summary: "Building QuickCard with React and Node.js",
      skills: ["React", "Node.js", "Express"],
      linkedin: "https://www.linkedin.com/"
    }

    try {
      const passResponse = await api.post("/pass-preview", profile)
      setCardData(passResponse.data)

      const pdfResponse = await api.post("/generate-pdf", profile)
      setPdfUrl(pdfResponse.data.file)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>QuickCard</h1>
      <button onClick={handleTest}>Test Connection</button>

      {cardData && (
        <div style={{ marginTop: "2rem" }}>
          <h2>{cardData.name}</h2>
          <p>{cardData.title}</p>
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
  )
}

export default App