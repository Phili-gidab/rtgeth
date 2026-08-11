import { useRef, useState } from 'react'
import { api } from './api'

/* Renders one schema field. Value shapes:
   text/textarea/number → string|number · toggle → bool · image → url string
   list → string[] · pairs → [label, value][] · rows → object[] */
export default function Field({ field, value, onChange }) {
  const { type, label, name } = field

  if (type === 'text' || type === 'number') {
    return (
      <label className="af">
        <span>{label}{field.required && ' *'}</span>
        <input
          type={type === 'number' ? 'number' : 'text'}
          value={value ?? ''}
          onChange={(e) => onChange(name, type === 'number' && e.target.value !== '' ? +e.target.value : e.target.value)}
        />
      </label>
    )
  }

  if (type === 'textarea') {
    return (
      <label className="af">
        <span>{label}{field.required && ' *'}</span>
        <textarea rows={4} value={value ?? ''} onChange={(e) => onChange(name, e.target.value)} />
      </label>
    )
  }

  if (type === 'toggle') {
    return (
      <label className="af af-toggle">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(name, e.target.checked)} />
        <span>{label}</span>
      </label>
    )
  }

  if (type === 'image') return <ImageField field={field} value={value} onChange={onChange} />

  if (type === 'list') {
    const list = Array.isArray(value) ? value : []
    return (
      <div className="af">
        <span>{label}</span>
        {list.map((item, i) => (
          <div className="af-row" key={i}>
            <input value={item} onChange={(e) => onChange(name, list.map((x, j) => (j === i ? e.target.value : x)))} />
            <button type="button" onClick={() => onChange(name, list.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <button type="button" className="af-add" onClick={() => onChange(name, [...list, ''])}>+ Add line</button>
      </div>
    )
  }

  if (type === 'pairs') {
    const pairs = Array.isArray(value) ? value : []
    return (
      <div className="af">
        <span>{label}</span>
        {pairs.map((pair, i) => (
          <div className="af-row" key={i}>
            <input placeholder="Label" value={pair[0] ?? ''} onChange={(e) => onChange(name, pairs.map((p, j) => (j === i ? [e.target.value, p[1]] : p)))} />
            <input placeholder="Value" value={pair[1] ?? ''} onChange={(e) => onChange(name, pairs.map((p, j) => (j === i ? [p[0], e.target.value] : p)))} />
            <button type="button" onClick={() => onChange(name, pairs.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <button type="button" className="af-add" onClick={() => onChange(name, [...pairs, ['', '']])}>+ Add row</button>
      </div>
    )
  }

  if (type === 'rows') {
    const rows = Array.isArray(value) ? value : []
    return (
      <div className="af">
        <span>{label}</span>
        {rows.map((row, i) => (
          <div className="af-row" key={i}>
            {field.columns.map((col) => (
              <input
                key={col.name}
                placeholder={col.label}
                value={row[col.name] ?? ''}
                onChange={(e) => onChange(name, rows.map((r, j) => (j === i ? { ...r, [col.name]: e.target.value } : r)))}
              />
            ))}
            <button type="button" onClick={() => onChange(name, rows.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <button type="button" className="af-add" onClick={() => onChange(name, [...rows, {}])}>+ Add row</button>
      </div>
    )
  }

  return null
}

function ImageField({ field, value, onChange }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [picker, setPicker] = useState(null) // null=closed, []=loading done, array=files
  const inputRef = useRef(null)

  const openPicker = async () => {
    setPicker([])
    try { setPicker(await api.listUploads()) } catch (e) { setError(e.message); setPicker(null) }
  }
  const pickExisting = (url) => { onChange(field.name, url); setPicker(null) }

  const pick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true); setError('')
    try {
      const { url } = await api.upload(file)
      /* replacing one upload with another: the old file has no other owner — clean it up */
      if (typeof value === 'string' && value.startsWith('/uploads/') && value !== url) {
        api.deleteUpload(value.slice('/uploads/'.length)).catch(() => {})
      }
      onChange(field.name, url)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const remove = () => {
    if (typeof value === 'string' && value.startsWith('/uploads/')) {
      if (!confirm('Remove this photo? The uploaded file will also be deleted from the server.')) return
      api.deleteUpload(value.slice('/uploads/'.length)).catch(() => {})
    }
    onChange(field.name, '')
  }

  const isBundled = typeof value === 'string' && value.startsWith('@')
  return (
    <div className="af">
      <span>{field.label}{field.required && ' *'}</span>
      <div className="af-img">
        {value ? (
          isBundled
            ? <em className="af-note">Built-in photo ({value}) — upload to replace</em>
            : <img src={`${import.meta.env.VITE_API_URL || ''}${value}`} alt="" />
        ) : <em className="af-note">No photo</em>}
        <div className="af-img-actions">
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? 'Uploading…' : 'Upload'}
          </button>
          <button type="button" onClick={openPicker}>Choose existing</button>
          {value && !isBundled && <button type="button" onClick={remove}>Remove</button>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={pick} />
      </div>
      {error && <em className="af-err">{error}</em>}
      {picker !== null && (
        <div className="adm-modal" onClick={(e) => e.target === e.currentTarget && setPicker(null)}>
          <div className="adm-modal-in">
            <h2>Choose a photo</h2>
            <div className="adm-media adm-media-pick">
              {picker.filter((f) => /\.(jpg|jpeg|png|webp|svg)$/i.test(f.name)).map((f) => (
                <button type="button" key={f.name} className="adm-media-item" onClick={() => pickExisting(f.url)}>
                  <img src={f.url} alt={f.name} loading="lazy" />
                </button>
              ))}
              {picker.length === 0 && <p className="adm-dim">Loading…</p>}
            </div>
            <div className="adm-modal-actions">
              <button type="button" className="adm-btn ghost" onClick={() => setPicker(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
