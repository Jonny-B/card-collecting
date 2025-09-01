import React, { useRef, useState } from 'react'

export default function Settings() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
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
    </div>
  )
}
