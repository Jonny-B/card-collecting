import React, { useEffect, useState } from 'react'

type BinderPageTemplate = {
  id: string; name: string; description?: string; rows: number; cols: number;
  orientation: 'portrait'|'landscape'; unit: 'in'|'mm'; slotWidth: number; slotHeight: number;
  marginTop?: number; marginRight?: number; marginBottom?: number; marginLeft?: number;
  gutterX?: number; gutterY?: number;
}

export default function BinderPageTemplatesTab() {
  const empty: BinderPageTemplate = { id: '', name: '', rows: 3, cols: 3, orientation: 'portrait', unit: 'in', slotWidth: 2.5, slotHeight: 3.5, gutterX: 0.125, gutterY: 0.125 }
  const [items, setItems] = useState<BinderPageTemplate[]>([])
  const [draft, setDraft] = useState<BinderPageTemplate>(empty)

  const load = () => { fetch('/api/binderPageTemplates').then(r=>r.json()).then(setItems) }
  useEffect(() => { load() }, [])

  const save = async () => {
    const method = draft.id ? 'PUT' : 'POST'
    const url = draft.id ? `/api/binderPageTemplates/${draft.id}` : '/api/binderPageTemplates'
    await fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(draft) })
    setDraft(empty); load()
  }
  const edit = (b: BinderPageTemplate) => setDraft(b)
  const remove = async (id: string) => { await fetch(`/api/binderPageTemplates/${id}`, { method:'DELETE' }); load() }

  return (
    <div className="row g-3">
      <div className="col-md-6">
        <div className="list-group">
          {items.map(b=>(
            <div key={b.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{b.name}</strong> <span className="text-muted">({b.rows}×{b.cols}, {b.unit}, {b.orientation})</span>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary" onClick={()=>edit(b)}><i className="fa fa-pen" /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={()=>remove(b.id)}><i className="fa fa-trash" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-muted small">No binder page templates yet.</div>}
        </div>
      </div>
      <div className="col-md-6">
        <div className="row g-2">
          <div className="col-8"><input className="form-control" placeholder="Name" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} /></div>
          <div className="col-4">
            <select className="form-select" value={draft.orientation} onChange={e=>setDraft({...draft,orientation:e.target.value as any})}>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <div className="col-6"><input type="number" className="form-control" placeholder="Rows" value={draft.rows} onChange={e=>setDraft({...draft,rows:+e.target.value})} /></div>
          <div className="col-6"><input type="number" className="form-control" placeholder="Cols" value={draft.cols} onChange={e=>setDraft({...draft,cols:+e.target.value})} /></div>
          <div className="col-4">
            <select className="form-select" value={draft.unit} onChange={e=>setDraft({...draft,unit:e.target.value as any})}>
              <option value="in">Inches</option>
              <option value="mm">Millimeters</option>
            </select>
          </div>
          <div className="col-4"><input type="number" className="form-control" placeholder="Slot Width" value={draft.slotWidth} onChange={e=>setDraft({...draft,slotWidth:+e.target.value})} /></div>
          <div className="col-4"><input type="number" className="form-control" placeholder="Slot Height" value={draft.slotHeight} onChange={e=>setDraft({...draft,slotHeight:+e.target.value})} /></div>
          <div className="col-6"><input type="number" className="form-control" placeholder="Gutter X" value={draft.gutterX ?? 0} onChange={e=>setDraft({...draft,gutterX:+e.target.value})} /></div>
          <div className="col-6"><input type="number" className="form-control" placeholder="Gutter Y" value={draft.gutterY ?? 0} onChange={e=>setDraft({...draft,gutterY:+e.target.value})} /></div>
          <div className="col-12"><textarea className="form-control" rows={3} placeholder="Description" value={draft.description ?? ''} onChange={e=>setDraft({...draft,description:e.target.value})} /></div>
          <div className="col-12 d-flex gap-2 mt-2">
            <button className="btn btn-primary" onClick={save}><i className="fa fa-save me-1"/>Save</button>
            <button className="btn btn-outline-secondary" onClick={()=>setDraft(empty)}>Reset</button>
          </div>
        </div>
      </div>
    </div>
  )
}
