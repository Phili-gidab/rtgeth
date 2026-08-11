import { useEffect, useState } from 'react'
import { api } from '../api'

const fmtSize = (b) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`)

export default function Media() {
  const [files, setFiles] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  const load = () => api.listUploads().then(setFiles).catch((e) => { setError(e.message); setFiles([]) })
  useEffect(load, [])

  const copy = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(url); setTimeout(() => setCopied(''), 1500)
    } catch { /* ignore */ }
  }

  const remove = async (name) => {
    if (!confirm(`Delete "${name}"? Any section still using it will show a broken image.`)) return
    try {
      await api.deleteUpload(name)
      setError('')
    } catch (e) { setError(`Delete failed: ${e.message}`) }
    load()
  }

  if (!files) return <p className="adm-dim">Loading…</p>

  return (
    <div className="adm-page">
      <header className="adm-head">
        <h1><i>▤</i>Media library <span className="adm-count">{files.length}</span></h1>
        <div className="adm-head-actions">{error && <span className="adm-err">{error}</span>}</div>
      </header>
      <p className="adm-dim">
        Every photo uploaded through the CMS lives here. Upload new ones from any image field —
        they are resized for the web automatically.
      </p>
      <div className="adm-media">
        {files.map((f) => (
          <figure key={f.name} className="adm-media-item">
            {/\.(jpg|jpeg|png|webp|svg)$/i.test(f.name)
              ? <img src={f.url} alt={f.name} loading="lazy" />
              : <span className="adm-media-doc">PDF</span>}
            <figcaption>
              <small>{fmtSize(f.size)} · {new Date(f.mtime).toLocaleDateString()}</small>
              <div className="adm-media-actions">
                <button onClick={() => copy(f.url)}>{copied === f.url ? 'Copied ✓' : 'Copy URL'}</button>
                <button className="danger" onClick={() => remove(f.name)}>Delete</button>
              </div>
            </figcaption>
          </figure>
        ))}
        {files.length === 0 && <p className="adm-dim">No uploads yet — add photos from any image field.</p>}
      </div>
    </div>
  )
}
