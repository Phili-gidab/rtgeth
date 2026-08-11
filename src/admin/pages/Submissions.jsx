import { useEffect, useState } from 'react'
import { api } from '../api'
import { downloadCsv } from '../csv'

const KINDS = ['', 'volunteer', 'membership', 'contact']

const CSV_COLUMNS = [
  { label: 'Date', value: (s) => s.created_at },
  { label: 'Type', value: 'kind' },
  { label: 'Name', value: 'name' },
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
  { label: 'Message', value: 'message' },
  { label: 'Read', value: (s) => (s.is_read ? 'yes' : 'no') },
]

export default function Submissions() {
  const [rows, setRows] = useState(null)
  const [kind, setKind] = useState('')
  const [error, setError] = useState('')

  const load = (k) => api.submissions(k || undefined).then(setRows).catch(() => setRows([]))
  useEffect(() => { load(kind) }, [kind])

  const markRead = async (id) => {
    try {
      await api.markRead(id)
      setError('')
    } catch (e) { setError(`Could not mark as read: ${e.message}`) }
    load(kind)
  }

  if (!rows) return <p className="adm-dim">Loading…</p>

  return (
    <div className="adm-page">
      <header className="adm-head">
        <h1><i>✉</i>Submissions <span className="adm-count">{rows.length}</span></h1>
        <div className="adm-head-actions">
          {error && <span className="adm-err">{error}</span>}
          {rows.length > 0 && (
            <button className="adm-btn ghost" onClick={() => downloadCsv(`rtg-submissions-${new Date().toISOString().slice(0, 10)}.csv`, CSV_COLUMNS, rows)}>
              Export CSV
            </button>
          )}
          {KINDS.map((k) => (
            <button key={k || 'all'} className={`adm-btn ghost${kind === k ? ' on' : ''}`} onClick={() => setKind(k)}>
              {k || 'All'}
            </button>
          ))}
        </div>
      </header>
      <div className="adm-list">
        {rows.map((s) => (
          <div className={`adm-item${s.is_read ? ' off' : ''}`} key={s.id}>
            <div className="adm-item-body">
              <b>{s.name}</b> <span className="adm-pill">{s.kind}</span>
              <small> · {s.email}{s.phone ? ` · ${s.phone}` : ''} · {new Date(s.created_at).toLocaleString()}</small>
              {s.message && <p>{s.message}</p>}
            </div>
            <div className="adm-item-actions">
              <a href={`mailto:${s.email}`}>Reply</a>
              {!s.is_read && <button onClick={() => markRead(s.id)}>Mark read</button>}
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="adm-dim">Nothing here.</p>}
      </div>
    </div>
  )
}
