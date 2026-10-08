import { useState, useRef, useEffect } from 'react'

export default function App() {
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! Upload a document on the left, then ask me anything about it.' },
  ])
  const [question, setQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const fileInput = useRef(null)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, asking])

  async function uploadFile(file) {
    if (!file) return
    setUploading(true)
    setUploadMsg(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/documents', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail || 'Upload failed')
      setDocs((d) => [...d, { name: data.filename, chunks: data.chunks }])
      setUploadMsg({ type: 'ok', text: `Indexed ${data.filename}` })
    } catch (e) {
      setUploadMsg({ type: 'err', text: e.message })
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  async function ask() {
    const q = question.trim()
    if (!q || asking) return
    setQuestion('')
    setMessages((m) => [...m, { role: 'user', text: q }])
    setAsking(true)
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail || 'Something went wrong')
      setMessages((m) => [...m, { role: 'bot', text: data.answer, sources: data.sources }])
    } catch (e) {
      setMessages((m) => [...m, { role: 'bot', text: e.message, error: true }])
    } finally {
      setAsking(false)
    }
  }

  return (
    <div className="app">
      <header>
        <h1 className="title">DocuMind</h1>
        <p className="subtitle">Ask questions about your documents, with cited answers</p>
      </header>

      <div className="layout">
        <aside className="panel">
          <h2>Documents</h2>
          <div
            className={`dropzone ${dragOver ? 'dragover' : ''}`}
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              uploadFile(e.dataTransfer.files[0])
            }}
          >
            <div className="drop-icon">☁</div>
            <p>{uploading ? 'Indexing…' : 'Drop a file here or click to browse'}</p>
            <small>PDF, TXT, DOCX, MD (max 10MB)</small>
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.txt,.docx,.md"
              hidden
              onChange={(e) => uploadFile(e.target.files[0])}
            />
          </div>

          {uploadMsg && <div className={`alert ${uploadMsg.type}`}>{uploadMsg.text}</div>}

          <ul className="doclist">
            {docs.map((d, i) => (
              <li key={i}>
                <span className="docname">{d.name}</span>
                <span className="badge">{d.chunks} chunks</span>
              </li>
            ))}
          </ul>
        </aside>

        <main className="panel chat">
          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role} ${m.error ? 'error' : ''}`}>
                <div className="text">{m.text}</div>
                {m.sources?.length > 0 && (
                  <details className="sources">
                    <summary>Sources ({m.sources.length})</summary>
                    {m.sources.map((s, j) => (
                      <div className="source" key={j}>
                        <strong>{s.filename}</strong>
                        <p>{s.snippet}</p>
                      </div>
                    ))}
                  </details>
                )}
              </div>
            ))}
            {asking && (
              <div className="msg bot">
                <div className="dots"><span /><span /><span /></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="inputbar">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ask()}
              placeholder="Ask a question about your documents…"
              disabled={asking}
            />
            <button onClick={ask} disabled={asking || !question.trim()}>Send</button>
          </div>
        </main>
      </div>
    </div>
  )
}