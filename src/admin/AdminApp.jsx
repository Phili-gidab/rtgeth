import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { SINGLETONS, COLLECTIONS } from './schemas'
import { api, getToken, setToken } from './api'

/* a JWT past its exp is dead weight — treat it as logged out instead of
   rendering the panel and failing on the first save */
function tokenValid() {
  const token = getToken()
  if (!token) return false
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (exp && exp * 1000 < Date.now()) { setToken(null); return false }
    return true
  } catch { return true } /* unreadable token: let the API be the judge */
}
import SingletonEditor from './pages/SingletonEditor'
import CollectionManager from './pages/CollectionManager'
import Dashboard from './pages/Dashboard'
import Donations from './pages/Donations'
import Submissions from './pages/Submissions'
import Account from './pages/Account'
import Media from './pages/Media'
import './admin.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  if (tokenValid()) return <Navigate to="/admin" replace />

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const { token } = await api.login(email, password)
      setToken(token)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally { setBusy(false) }
  }

  return (
    <div className="adm-login">
      <form onSubmit={submit}>
        <p className="adm-login-mark am" lang="am">ያ</p>
        <h1>RTG Admin</h1>
        <label><span>Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label>
        <label><span>Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
        {error && <p className="adm-err">{error}</p>}
        <button disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  )
}

function Protected({ children }) {
  if (!tokenValid()) return <Navigate to="/admin/login" replace />
  return children
}

function Layout() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.me().then(setUser).catch(() => {})
  }, [])

  const logout = () => { setToken(null); navigate('/admin/login') }

  /* GSTS-style declarative sidebar registry, driven by the schemas */
  const nav = [
    { section: 'Overview', items: [{ to: '/admin', label: 'Dashboard', icon: '◈', end: true }] },
    { section: 'Sections', items: SINGLETONS.map((s) => ({ to: `/admin/s/${s.key}`, label: s.label, icon: s.icon })) },
    { section: 'Collections', items: COLLECTIONS.map((c) => ({ to: `/admin/c/${c.key}`, label: c.label, icon: c.icon })) },
    { section: 'Inbox', items: [
      { to: '/admin/donations', label: 'Donations', icon: '৳' },
      { to: '/admin/submissions', label: 'Submissions', icon: '✉' },
    ]},
    { section: 'Library', items: [{ to: '/admin/media', label: 'Media library', icon: '▤' }] },
    { section: 'Account', items: [{ to: '/admin/account', label: 'Password', icon: '⚿' }] },
  ]

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand">
          <span className="am" lang="am">ያ</span>
          <div><b>RTG Admin</b><small>rtgeth.org</small></div>
        </div>
        <nav>
          {nav.map((group) => (
            <div className="adm-group" key={group.section}>
              <span className="adm-group-label">{group.section}</span>
              {group.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? 'on' : undefined)}>
                  <i>{item.icon}</i>{item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="adm-side-foot">
          <a href="/" target="_blank" rel="noreferrer">View site ↗</a>
          <button onClick={logout}>Sign out{user ? ` (${user.email})` : ''}</button>
        </div>
      </aside>
      <main className="adm-main"><Outlet /></main>
    </div>
  )
}

function SingletonRoute() {
  const { key } = useParams()
  const schema = SINGLETONS.find((s) => s.key === key)
  if (!schema) return <Navigate to="/admin" replace />
  return <SingletonEditor key={key} schema={schema} />
}

function CollectionRoute() {
  const { key } = useParams()
  const schema = COLLECTIONS.find((c) => c.key === key)
  if (!schema) return <Navigate to="/admin" replace />
  return <CollectionManager key={key} schema={schema} />
}

export default function AdminApp() {
  /* honor the theme chosen on the public site (Header persists it) */
  useEffect(() => {
    const theme = localStorage.getItem('rtg-theme')
    if (theme) document.documentElement.dataset.theme = theme
  }, [])

  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="s/:key" element={<SingletonRoute />} />
        <Route path="c/:key" element={<CollectionRoute />} />
        <Route path="donations" element={<Donations />} />
        <Route path="submissions" element={<Submissions />} />
        <Route path="account" element={<Account />} />
        <Route path="media" element={<Media />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
