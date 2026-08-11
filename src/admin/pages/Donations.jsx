import { useEffect, useState } from 'react'
import { api } from '../api'
import { downloadCsv } from '../csv'

const CSV_COLUMNS = [
  { label: 'Date', value: (d) => d.created_at },
  { label: 'Reference', value: 'tx_ref' },
  { label: 'First name', value: 'first_name' },
  { label: 'Last name', value: 'last_name' },
  { label: 'Email', value: 'email' },
  { label: 'Purpose', value: 'purpose' },
  { label: 'Amount', value: 'amount' },
  { label: 'Currency', value: 'currency' },
  { label: 'Status', value: 'status' },
  { label: 'Verified at', value: 'verified_at' },
]

export default function Donations() {
  const [rows, setRows] = useState(null)
  useEffect(() => { api.donations().then(setRows).catch(() => setRows([])) }, [])
  if (!rows) return <p className="adm-dim">Loading…</p>

  const exportCsv = () => downloadCsv(`rtg-donations-${new Date().toISOString().slice(0, 10)}.csv`, CSV_COLUMNS, rows)

  return (
    <div className="adm-page">
      <header className="adm-head">
        <h1><i>৳</i>Donations <span className="adm-count">{rows.length}</span></h1>
        <div className="adm-head-actions">
          {rows.length > 0 && <button className="adm-btn ghost" onClick={exportCsv}>Export CSV</button>}
        </div>
      </header>
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
