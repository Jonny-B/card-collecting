import React, { useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

export default function Settings() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const loc = useLocation()
  const navigate = useNavigate()

  const exportJson = async () => {
    const [players, templates, sheets, binders, binderPages] = await Promise.all([
      fetch('/api/players').then(r => r.json()),
      fetch('/api/templates').then(r => r.json()),
      fetch('/api/sheets').then(r => r.json()),
      fetch('/api/binders').then(r => r.json()),
      fetch('/api/binderPages').then(r => r.json())
    ])
    const data = { players, templates, sheets, binders, binderPages }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'binder-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = async (file: File) => {
    try {
      setBusy(true)
      setMsg(null)
      const text = await file.text()
      const data = JSON.parse(text)
      if (!data || typeof data !== 'object') throw new Error('Invalid file')
      const { players = [], templates = [], sheets = [], binders = [], binderPages = [] } = data
      for (const b of binders) {
        await fetch('/api/binders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
      }
      for (const t of templates) {
        await fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) })
      }
      for (const p of players) {
        await fetch('/api/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
      }
      for (const s of sheets) {
        await fetch('/api/sheets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
      }
      for (const bp of binderPages) {
        await fetch('/api/binderPages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bp) })
      }
      setMsg('Import complete')
    } catch (e: any) {
      setMsg(e?.message || 'Import failed')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // Default to teams tab
  React.useEffect(() => {
    if (loc.pathname === '/settings') navigate('/settings/teams', { replace: true })
  }, [loc.pathname, navigate])

  return (
    <div>
      <h2 className="h5">Settings</h2>
      <div className="d-flex gap-2 align-items-center flex-wrap mb-3">
        <button className="btn btn-outline-primary" onClick={exportJson} disabled={busy}><i className="fa fa-file-export me-2"/>Export JSON</button>
        <input type="file" ref={fileRef} accept="application/json" onChange={e => e.target.files && importJson(e.target.files[0])} hidden />
        <button className="btn btn-outline-secondary" onClick={() => fileRef.current?.click()} disabled={busy}><i className="fa fa-file-import me-2"/>Import JSON</button>
        {busy && <span className="text-muted">Importing…</span>}
        {msg && <span className="text-muted">{msg}</span>}
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item"><NavLink to="/settings/teams" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>Teams</NavLink></li>
        <li className="nav-item"><NavLink to="/settings/position-templates" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>Position Templates</NavLink></li>
        <li className="nav-item"><NavLink to="/settings/binder-page-templates" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>Binder Page Templates</NavLink></li>
      </ul>

      <Outlet />
    </div>
  )
}
