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
  <h2 className="h5">{isNew ? 'New Player' : 'Edit Player'}</h2>
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

      <TemplateSheets playerId={p.id} />
    </div>
  )
}

type StatLineDef = { key: string; label: string; type: 'number' | 'text' | 'calc'; formula?: string; perGame?: boolean; order: number; description?: string }
type Template = { id: string; name: string; position: string; statLines: StatLineDef[] }
type Sheet = { id: string; playerId: string; templateId: string; seasonYear: number; values: Record<string,string|number> }

function TemplateSheets({ playerId }: { playerId: string }) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [season, setSeason] = useState<number>(new Date().getFullYear())
  const [activeTmpl, setActiveTmpl] = useState<string>('')

  useEffect(() => { fetch('/api/templates').then(r => r.json()).then(setTemplates) }, [])
  useEffect(() => { if (playerId) fetch(`/api/players/${playerId}/sheets`).then(r => r.json()).then(setSheets) }, [playerId])

  const addSheet = async () => {
    if (!playerId) return alert('Save the player first')
    if (!activeTmpl) return alert('Choose a template')
    const id = crypto.randomUUID()
    const tmpl = templates.find(t => t.id === activeTmpl)!
    const values: Record<string,string|number> = {}
    tmpl.statLines.forEach(sl => { if (sl.type !== 'calc') values[sl.key] = '' })
    const sheet: Sheet = { id, playerId, templateId: tmpl.id, seasonYear: season, values }
    await fetch('/api/sheets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sheet) })
    setSheets(s => [...s, sheet])
  }

  const updateValue = (sheetId: string, key: string, val: string) => {
    setSheets(ss => ss.map(s => s.id === sheetId ? { ...s, values: { ...s.values, [key]: val } } : s))
  }

  const saveSheet = async (s: Sheet) => {
    await fetch('/api/sheets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })
  }

  const delSheet = async (id: string) => {
    await fetch(`/api/sheets/${id}`, { method: 'DELETE' })
    setSheets(ss => ss.filter(s => s.id !== id))
  }

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="h6 m-0">Templates & Stats</h3>
        <div className="d-flex gap-2">
          <select className="form-select form-select-sm" value={activeTmpl} onChange={e => setActiveTmpl(e.target.value)}>
            <option value="">Choose template…</option>
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input type="number" className="form-control form-control-sm" value={season} onChange={e => setSeason(Number(e.target.value))} />
          <button className="btn btn-sm btn-outline-primary" onClick={addSheet}><i className="fa fa-plus me-2"/>Add Sheet</button>
        </div>
      </div>

      {sheets.length === 0 && <div className="text-muted">No sheets yet. Select a template and season, then Add Sheet.</div>}

      {sheets.map(s => {
        const tmpl = templates.find(t => t.id === s.templateId)
        if (!tmpl) return null
        return (
          <div className="card mb-3" key={s.id}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <strong>{tmpl.name}</strong>
                <span className="ms-2 text-muted">Season {s.seasonYear}</span>
              </div>
              <div className="btn-group btn-group-sm">
                <button className="btn btn-outline-primary" onClick={() => saveSheet(s)}><i className="fa fa-save me-1"/>Save Sheet</button>
                <button className="btn btn-outline-danger" onClick={() => delSheet(s.id)}><i className="fa fa-trash me-1"/>Delete</button>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-2 text-muted small mb-1">
                <div className="col-5">Stat</div>
                <div className="col-7">Value</div>
              </div>
              {tmpl.statLines.sort((a,b) => a.order - b.order).map(sl => (
                <div className="row g-2 align-items-center mb-1" key={sl.key} title={sl.description ?? ''}>
                  <div className="col-5">
                    <label className="col-form-label col-form-label-sm">
                      {sl.label}
                      {sl.description ? <i className="fa fa-circle-info text-muted ms-1" title={sl.description} /> : null}
                    </label>
                  </div>
                  <div className="col-7">
                    {sl.type === 'number' && (
                      <input type="number" className="form-control form-control-sm" value={(s.values[sl.key] as any) ?? ''} onChange={e => updateValue(s.id, sl.key, e.target.value)} title={sl.description ?? ''} />
                    )}
                    {sl.type === 'text' && (
                      <input className="form-control form-control-sm" value={(s.values[sl.key] as any) ?? ''} onChange={e => updateValue(s.id, sl.key, e.target.value)} title={sl.description ?? ''} />
                    )}
                    {sl.type === 'calc' && (
                      <input className="form-control form-control-sm" value={String(s.values[sl.key] ?? '')} disabled title={sl.description ?? ''} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
