import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type Player = {
  id: string; name: string; team: string; position: string; colleges: string[];
  draftYear?: number; draftPick?: number; isPlayer: boolean; isBrownsStarter: boolean; notes?: string; templateId?: string; photoUrl?: string;
}

type Template = { id: string; name: string; position: string; statLines: any[] }

const empty: Player = { id: '', name: '', team: 'CLE', position: 'WR', colleges: [], isPlayer: true, isBrownsStarter: false }

export default function RookieEditor() {
  const { id } = useParams()
  const isNew = id === 'new'
  const nav = useNavigate()
  const [p, setP] = useState<Player>(empty)
  const [templates, setTemplates] = useState<Template[]>([])
  const [teams, setTeams] = useState<{ abbr: string; name: string }[]>([])
  const [positions, setPositions] = useState<{ abbr: string; name: string }[]>([])

  useEffect(() => {
    if (!isNew && id) fetch(`/api/players/${id}`).then(r => r.json()).then(setP)
  }, [id, isNew])
  useEffect(() => { fetch('/api/templates').then(r => r.json()).then(setTemplates) }, [])
  useEffect(() => { fetch('/api/meta/teams').then(r => r.json()).then(setTeams) }, [])
  useEffect(() => { fetch('/api/meta/positions').then(r => r.json()).then(setPositions) }, [])

  const save = async () => {
    if (!p.name.trim()) return alert('Name required')
    const body = { ...p, id: p.id || crypto.randomUUID() }
    await fetch('/api/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    nav('/rookies')
  }

  const onUploadPhoto = async (file: File) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const image = String(reader.result)
      await fetch('/api/upload/playerPhoto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId: p.id || 'new-player', image }) })
      // if new player, we won’t have id yet; advise to save first
      if (!p.id) alert('Save player first to persist photo. Photo stored server-side once player is created.')
      else {
        const refreshed = await fetch(`/api/players/${p.id}`).then(r => r.json())
        setP(refreshed)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
  <h2 className="h5">{isNew ? 'New Player' : 'Edit Player'}</h2>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Name</label>
          <input className="form-control" value={p.name} onChange={e => setP({ ...p, name: e.target.value })} />
        </div>
        <div className="col-md-2">
          <label className="form-label">Team</label>
          <select className="form-select" value={p.team} onChange={e => setP({ ...p, team: e.target.value })}>
            {teams.map(t => <option key={t.abbr} value={t.abbr}>{t.abbr} — {t.name}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label">Position</label>
          <select className="form-select" value={p.position} onChange={e => setP({ ...p, position: e.target.value })}>
            {positions.map(pos => <option key={pos.abbr} value={pos.abbr}>{pos.abbr} — {pos.name}</option>)}
          </select>
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <div className="form-check">
            <input id="rookie" className="form-check-input" type="checkbox" checked={p.isPlayer} onChange={e => setP({ ...p, isPlayer: e.target.checked })} />
            <label className="form-check-label" htmlFor="rookie">Rookie</label>
          </div>
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <div className="form-check">
            <input id="starter" className="form-check-input" type="checkbox" checked={p.isBrownsStarter} onChange={e => setP({ ...p, isBrownsStarter: e.target.checked })} />
            <label className="form-check-label" htmlFor="starter">Browns Starter</label>
          </div>
        </div>
        <div className="col-12">
          <label className="form-label">Colleges (comma-separated)</label>
          <input className="form-control" value={p.colleges.join(', ')} onChange={e => setP({ ...p, colleges: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Draft Year</label>
          <input type="number" className="form-control" value={p.draftYear ?? ''} onChange={e => setP({ ...p, draftYear: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Draft Pick</label>
          <input type="number" className="form-control" value={p.draftPick ?? ''} onChange={e => setP({ ...p, draftPick: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
        <div className="col-12">
          <label className="form-label">Notes</label>
          <textarea className="form-control" rows={3} value={p.notes ?? ''} onChange={e => setP({ ...p, notes: e.target.value })} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Assigned Template</label>
          <select className="form-select" value={p.templateId ?? ''} onChange={e => setP({ ...p, templateId: e.target.value || undefined })}>
            <option value="">None</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div className="form-text">Pick a template now; you will fill stats when viewing the player each week.</div>
        </div>
        <div className="col-md-6">
          <label className="form-label">Player Photo</label>
          <div className="d-flex align-items-center gap-3">
            <div style={{ width: 80, height: 80, background: '#f3f3f3' }} className="d-flex align-items-center justify-content-center rounded overflow-hidden">
              {p.photoUrl ? <img src={p.photoUrl} alt="Player" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <span className="text-muted small">No photo</span>}
            </div>
            <label className="btn btn-outline-secondary mb-0">
              <i className="fa fa-upload me-2" />Upload
              <input type="file" accept="image/*" hidden onChange={e => e.target.files && onUploadPhoto(e.target.files[0])} />
            </label>
          </div>
          <div className="form-text">Upload a square image for best results.</div>
        </div>
      </div>
      <div className="mt-3 d-flex gap-2">
        <button className="btn btn-primary" onClick={save}><i className="fa fa-save me-2"/>Save</button>
      </div>
      <div className="text-muted mt-2">Saving a rookie will auto-create a binder page (max 32 rookies enforced).</div>

      {/* No per-week stat inputs here by design */}
    </div>
  )
}
