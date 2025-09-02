import React, { useEffect, useState } from 'react'

type Team = { id: string; name: string; code: string; city?: string; colorPrimary?: string; colorSecondary?: string; logoUrl?: string; conference?: string; division?: string }

export default function TeamsTab() {
  const empty: Team = { id: '', name: '', code: '' }
  const [teams, setTeams] = useState<Team[]>([])
  const [draft, setDraft] = useState<Team>(empty)

  const load = () => { fetch('/api/teams').then(r => r.json()).then(setTeams) }
  useEffect(() => { load() }, [])

  const save = async () => {
    const method = draft.id ? 'PUT' : 'POST'
    const url = draft.id ? `/api/teams/${draft.id}` : '/api/teams'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
    setDraft(empty); load()
  }
  const edit = (t: Team) => setDraft(t)
  const remove = async (id: string) => { await fetch(`/api/teams/${id}`, { method: 'DELETE' }); load() }

  return (
    <div className="row g-3">
      <div className="col-md-6">
        <div className="list-group">
          {teams.map(t => (
            <div key={t.id} className="list-group-item d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                {t.logoUrl && <img src={t.logoUrl} alt="" width={24} height={24} />}
                <strong>{t.city ? `${t.city} ` : ''}{t.name}</strong>
                <span className="badge bg-secondary">{t.code}</span>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary" onClick={() => edit(t)}><i className="fa fa-pen" /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remove(t.id)}><i className="fa fa-trash" /></button>
              </div>
            </div>
          ))}
          {teams.length === 0 && <div className="text-muted small">No teams yet.</div>}
        </div>
      </div>
      <div className="col-md-6">
        <div className="row g-2">
          <div className="col-8"><input className="form-control" placeholder="Name" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} /></div>
          <div className="col-4"><input className="form-control" placeholder="Code" value={draft.code} onChange={e=>setDraft({...draft,code:e.target.value.toUpperCase()})} /></div>
          <div className="col-6"><input className="form-control" placeholder="City" value={draft.city ?? ''} onChange={e=>setDraft({...draft,city:e.target.value})} /></div>
          <div className="col-6"><input className="form-control" placeholder="Logo URL" value={draft.logoUrl ?? ''} onChange={e=>setDraft({...draft,logoUrl:e.target.value})} /></div>
          <div className="col-6"><input type="color" className="form-control form-control-color" value={draft.colorPrimary ?? '#2b2b2b'} onChange={e=>setDraft({...draft,colorPrimary:e.target.value})} /></div>
          <div className="col-6"><input type="color" className="form-control form-control-color" value={draft.colorSecondary ?? '#cccccc'} onChange={e=>setDraft({...draft,colorSecondary:e.target.value})} /></div>
          <div className="col-6"><input className="form-control" placeholder="Conference" value={draft.conference ?? ''} onChange={e=>setDraft({...draft,conference:e.target.value})} /></div>
          <div className="col-6"><input className="form-control" placeholder="Division" value={draft.division ?? ''} onChange={e=>setDraft({...draft,division:e.target.value})} /></div>
          <div className="col-12 d-flex gap-2 mt-2">
            <button className="btn btn-primary" onClick={save}><i className="fa fa-save me-1"/>Save</button>
            <button className="btn btn-outline-secondary" onClick={()=>setDraft(empty)}>Reset</button>
          </div>
        </div>
      </div>
    </div>
  )
}
