import { useState } from 'react'
import { api } from '../api'

export default function Account() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setMsg(''); setError('')
    if (form.next.length < 10) return setError('New password must be at least 10 characters.')
    if (form.next !== form.confirm) return setError("The two new passwords don't match.")
    setBusy(true)
    try {
      await api.changePassword(form.current, form.next)
      setForm({ current: '', next: '', confirm: '' })
      setMsg('Password changed. Use the new one next time you sign in.')
    } catch (err) {
      setError(err.message)
    } finally { setBusy(false) }
  }

  return (
    <div className="adm-page">
      <header className="adm-head">
        <h1><i>⚿</i>Account</h1>
      </header>
      <form className="adm-form adm-account" onSubmit={submit}>
        <label className="af">
          <span>Current password</span>
          <input type="password" autoComplete="current-password" value={form.current} onChange={set('current')} required />
        </label>
        <label className="af">
          <span>New password (10+ characters)</span>
          <input type="password" autoComplete="new-password" value={form.next} onChange={set('next')} required minLength={10} />
        </label>
        <label className="af">
          <span>Repeat new password</span>
          <input type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} required />
        </label>
        {msg && <p className="adm-ok">{msg}</p>}
        {error && <p className="adm-err">{error}</p>}
        <div>
          <button className="adm-btn" disabled={busy}>{busy ? 'Changing…' : 'Change password'}</button>
        </div>
      </form>
    </div>
  )
}
