import React, { useEffect, useRef, useState } from 'react'

type MetaTeam = { abbr: string; name: string; helmetUrl?: string }

export default function Settings() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [teams, setTeams] = useState<MetaTeam[]>([])

  useEffect(() => { fetch('/api/meta/teams').then(r => r.json()).then(setTeams) }, [])

  const exportJson = async () => {
    const [players, templates, sheets, binderPages] = await Promise.all([
      fetch('/api/players').then(r => r.json()),
      fetch('/api/templates').then(r => r.json()),
      fetch('/api/sheets').then(r => r.json()),
      fetch('/api/binderPages').then(r => r.json())
    ])
    const data = { players, templates, sheets, binderPages }
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
      const { players = [], templates = [], sheets = [], binderPages = [] } = data
      // naive import: POST each entity
      for (const t of templates) {
        await fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) })
      }
      for (const p of players) {
        await fetch('/api/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
      }
      for (const s of sheets) {
        await fetch('/api/sheets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
      }
      for (const b of binderPages) {
        await fetch('/api/binderPages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
      }
      setMsg('Import complete')
    } catch (e: any) {
      setMsg(e?.message || 'Import failed')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const uploadHelmet = async (abbr: string, file: File) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const image = String(reader.result)
      await fetch('/api/upload/teamHelmet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ abbr, image }) })
      const refreshed = await fetch('/api/meta/teams').then(r => r.json())
      setTeams(refreshed)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <h2 className="h5">Settings</h2>
      <div className="d-flex gap-2 align-items-center flex-wrap">
        <button className="btn btn-outline-primary" onClick={exportJson} disabled={busy}><i className="fa fa-file-export me-2"/>Export JSON</button>
        <input type="file" ref={fileRef} accept="application/json" onChange={e => e.target.files && importJson(e.target.files[0])} hidden />
        <button className="btn btn-outline-secondary" onClick={() => fileRef.current?.click()} disabled={busy}><i className="fa fa-file-import me-2"/>Import JSON</button>
        {busy && <span className="text-muted">Importing…</span>}
        {msg && <span className="text-muted">{msg}</span>}
      </div>

      <div className="mt-4">
        <h3 className="h6">Team Helmets</h3>
        <div className="row g-3">
          {teams.map(t => (
            <div className="col-md-4" key={t.abbr}>
              <div className="border rounded p-2 d-flex align-items-center gap-3">
                <div style={{ width: 48, height: 48, background: '#f3f3f3' }} className="d-flex align-items-center justify-content-center rounded overflow-hidden">
                  {t.helmetUrl ? <img src={t.helmetUrl} alt="helmet" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <span className="text-muted small">No image</span>}
                </div>
                <div className="flex-grow-1">
                  <div><strong>{t.abbr}</strong> — {t.name}</div>
                  <label className="btn btn-sm btn-outline-secondary mb-0 mt-2">
                    <i className="fa fa-upload me-2" />Upload Helmet
                    <input type="file" accept="image/*" hidden onChange={e => e.target.files && uploadHelmet(t.abbr, e.target.files[0])} />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
