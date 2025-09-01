import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type Player = {
  id: string; name: string; team: string; position: string; colleges: string[];
  draftYear?: number; draftPick?: number; isRookie: boolean; isBrownsStarter: boolean; notes?: string;
}

const empty: Player = { id: '', name: '', team: 'CLE', position: 'WR', colleges: [], isRookie: true, isBrownsStarter: false }

export default function RookieEditor() {
  const { id } = useParams()
  const isNew = id === 'new'
  const nav = useNavigate()
  const [p, setP] = useState<Player>(empty)

  useEffect(() => {
    if (!isNew && id) fetch(`/api/players/${id}`).then(r => r.json()).then(setP)
  }, [id, isNew])

  const save = async () => {
    if (!p.name.trim()) return alert('Name required')
    const body = { ...p, id: p.id || crypto.randomUUID() }
    await fetch('/api/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    nav('/rookies')
  }

  return (
    <div>
      <h2 className="h5">{isNew ? 'New Rookie' : 'Edit Rookie'}</h2>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Name</label>
          <input className="form-control" value={p.name} onChange={e => setP({ ...p, name: e.target.value })} />
        </div>
        <div className="col-md-2">
          <label className="form-label">Team</label>
          <input className="form-control" value={p.team} onChange={e => setP({ ...p, team: e.target.value })} />
        </div>
        <div className="col-md-2">
          <label className="form-label">Position</label>
          <input className="form-control" value={p.position} onChange={e => setP({ ...p, position: e.target.value })} />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <div className="form-check">
            <input id="rookie" className="form-check-input" type="checkbox" checked={p.isRookie} onChange={e => setP({ ...p, isRookie: e.target.checked })} />
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
      </div>
      <div className="mt-3 d-flex gap-2">
        <button className="btn btn-primary" onClick={save}><i className="fa fa-save me-2"/>Save</button>
      </div>
      <div className="text-muted mt-2">Saving a rookie will auto-create a binder page (max 32 rookies enforced).</div>
    </div>
  )
}
