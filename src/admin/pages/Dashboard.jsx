import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { SINGLETONS, COLLECTIONS } from '../schemas'

export default function Dashboard() {
  const [donations, setDonations] = useState([])
  const [subs, setSubs] = useState([])

  useEffect(() => {
    api.donations().then(setDonations).catch(() => {})
    api.submissions().then(setSubs).catch(() => {})
  }, [])

  const successful = donations.filter((d) => d.status === 'success')
  const totalETB = successful.filter((d) => d.currency === 'ETB').reduce((s, d) => s + +d.amount, 0)
  const unread = subs.filter((s) => !s.is_read).length

  return (
    <div className="adm-page">
      <header className="adm-head"><h1><i>◈</i>Dashboard</h1></header>
      <div className="adm-tiles">
        <Link to="/admin/donations" className="adm-tile">
          <b>{successful.length}</b><span>successful donations</span>
        </Link>
        <Link to="/admin/donations" className="adm-tile">
          <b>{totalETB.toLocaleString()}</b><span>birr raised online</span>
        </Link>
        <Link to="/admin/submissions" className="adm-tile">
          <b>{unread}</b><span>unread submissions</span>
        </Link>
      </div>
      <h2 className="adm-sub">Edit the site</h2>
      <div className="adm-tiles small">
        {SINGLETONS.map((s) => (
          <Link key={s.key} to={`/admin/s/${s.key}`} className="adm-tile"><b>{s.icon}</b><span>{s.label}</span></Link>
        ))}
        {COLLECTIONS.map((c) => (
          <Link key={c.key} to={`/admin/c/${c.key}`} className="adm-tile"><b>{c.icon}</b><span>{c.label}</span></Link>
        ))}
      </div>
    </div>
  )
}
