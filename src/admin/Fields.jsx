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
          onChange={(e) => onChange(name, type === 'number' ? +e.target.value : e.target.value)}
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
  const inputRef = useRef(null)

  const pick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true); setError('')
    try {
      const { url } = await api.upload(file)
      onChange(field.name, url)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
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
          {value && !isBundled && <button type="button" onClick={() => onChange(field.name, '')}>Remove</button>}
        </div>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={pick} />
      </div>
      {error && <em className="af-err">{error}</em>}
    </div>
  )
}
