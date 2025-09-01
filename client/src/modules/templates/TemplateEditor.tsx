import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type StatLineDef = { key: string; label: string; type: 'number' | 'text' | 'calc'; formula?: string; perGame?: boolean; order: number }
type Template = { id: string; name: string; position: string; statLines: StatLineDef[] }

export default function TemplateEditor() {
  const { id } = useParams()
  const isNew = id === 'new'
  const nav = useNavigate()
  const [tmpl, setTmpl] = useState<Template>({ id: '', name: '', position: 'Generic', statLines: [descLine()] })

  useEffect(() => {
    if (!isNew && id) fetch(`/api/templates/${id}`).then(r => r.json()).then((t: Template) => setTmpl(ensureDescription(t)))
  }, [id, isNew])

  const addLine = () => setTmpl(t => ({ ...t, statLines: [...t.statLines, { key: `STAT${t.statLines.length+1}`, label: 'Stat', type: 'number', order: t.statLines.length+1 }] }))
  const save = async () => {
    const body = { ...tmpl, id: tmpl.id || crypto.randomUUID() }
    await fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    nav('/templates')
  }
  const remove = async () => {
    if (!tmpl.id) return
    await fetch(`/api/templates/${tmpl.id}`, { method: 'DELETE' })
    nav('/templates')
  }

  return (
    <div>
      <h2 className="h5">{isNew ? 'New Template' : 'Edit Template'}</h2>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Name</label>
          <input className="form-control" value={tmpl.name} onChange={e => setTmpl({ ...tmpl, name: e.target.value })} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Position</label>
          <input className="form-control" value={tmpl.position} onChange={e => setTmpl({ ...tmpl, position: e.target.value })} />
        </div>
      </div>
      <div className="mt-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3 className="h6 m-0">Stat Lines</h3>
          <button className="btn btn-sm btn-outline-primary" onClick={addLine}><i className="fa fa-plus me-2"/>Add Line</button>
        </div>
        <div className="row g-2 text-muted small px-2 mb-1">
          <div className="col-2">Key</div>
          <div className="col-3">Label</div>
          <div className="col-2">Type</div>
          <div className="col-3">Formula</div>
          <div className="col-2">Order</div>
        </div>
        <div className="list-group">
          {tmpl.statLines.map((s, idx) => (
            <div className="list-group-item" key={idx}>
              <div className="row g-2">
                <div className="col-2"><input placeholder="KEY" className="form-control" value={s.key} onChange={e => updateLine(idx, { key: e.target.value })} /></div>
                <div className="col-3"><input placeholder="Label" className="form-control" value={s.label} onChange={e => updateLine(idx, { label: e.target.value })} /></div>
                <div className="col-2">
                  <select className="form-select" value={s.type} onChange={e => updateLine(idx, { type: e.target.value as any })}>
                    <option value="number">number</option>
                    <option value="text">text</option>
                    <option value="calc">calc</option>
                  </select>
                </div>
                <div className="col-3"><input placeholder="Formula" className="form-control" value={s.formula ?? ''} onChange={e => updateLine(idx, { formula: e.target.value })} /></div>
                <div className="col-2"><input type="number" className="form-control" value={s.order} onChange={e => updateLine(idx, { order: Number(e.target.value) })} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 d-flex gap-2">
        <button className="btn btn-primary" onClick={save}><i className="fa fa-save me-2"/>Save</button>
        {!isNew && <button className="btn btn-danger" onClick={remove}><i className="fa fa-trash me-2"/>Delete</button>}
      </div>
    </div>
  )

  function updateLine(index: number, patch: Partial<StatLineDef>) {
    setTmpl(t => ({ ...t, statLines: t.statLines.map((s, i) => i === index ? { ...s, ...patch } : s) }))
  }

  function descLine(): StatLineDef {
    return { key: 'DESC', label: 'Description', type: 'text', order: 0 }
  }

  function ensureDescription(t: Template): Template {
    const hasDesc = t.statLines.some(sl => sl.key.toUpperCase() === 'DESC' || sl.label.toLowerCase() === 'description')
    return hasDesc ? t : { ...t, statLines: [descLine(), ...t.statLines] }
  }
}
