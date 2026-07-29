import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Donations() {
  const [rows, setRows] = useState(null)
  useEffect(() => { api.donations().then(setRows).catch(() => setRows([])) }, [])
  if (!rows) return <p className="adm-dim">Loading…</p>

  return (
    <div className="adm-page">
      <header className="adm-head"><h1><i>৳</i>Donations <span className="adm-count">{rows.length}</span></h1></header>
      <div className="adm-tablewrap">
        <table className="adm-table">
          <thead>
            <tr><th>Date</th><th>Reference</th><th>Donor</th><th>Purpose</th><th className="num">Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id}>
                <td>{new Date(d.created_at).toLocaleString()}</td>
                <td className="mono">{d.tx_ref}</td>
                <td>{[d.first_name, d.last_name].filter(Boolean).join(' ')}<br /><small>{d.email}</small></td>
                <td>{d.purpose}</td>
                <td className="num">{(+d.amount).toLocaleString()} {d.currency}</td>
                <td><span className={`adm-pill ${d.status}`}>{d.status}</span></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="6" className="adm-dim">No donations yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
