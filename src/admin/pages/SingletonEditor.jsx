import { useEffect, useState } from 'react'
import { api } from '../api'
import Field from '../Fields'

export default function SingletonEditor({ schema }) {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.getSingleton(schema.key)
      .then((d) => setData(d || {}))
      .catch((e) => setError(e.message))
  }, [schema.key])

  const onChange = (name, value) => setData((d) => ({ ...d, [name]: value }))

  const save = async () => {
    setSaving(true); setMsg(''); setError('')
    try {
      await api.saveSingleton(schema.key, data)
      setMsg('Saved — live on next page load.')
      setTimeout(() => setMsg(''), 2500)
    } catch (e) {
      setError(e.message)
    } finally { setSaving(false) }
  }

  if (error && !data) return <p className="adm-err">{error}</p>
  if (!data) return <p className="adm-dim">Loading…</p>

  return (
    <div className="adm-page">
      <header className="adm-head">
        <h1><i>{schema.icon}</i>{schema.label}</h1>
        <div className="adm-head-actions">
          {msg && <span className="adm-ok">{msg}</span>}
          {error && <span className="adm-err">{error}</span>}
          <button className="adm-btn" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </header>
      <div className="adm-form">
        {schema.fields.map((f) => (
          <Field key={f.name} field={f} value={data[f.name]} onChange={onChange} />
        ))}
      </div>
    </div>
  )
}
