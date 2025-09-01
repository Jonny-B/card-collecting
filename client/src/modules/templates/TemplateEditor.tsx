import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

type StatLineDef = { key: string; label: string; type: 'number' | 'text' | 'calc'; formula?: string; perGame?: boolean; order: number; description?: string }
type Template = { id: string; name: string; position: string; statLines: StatLineDef[] }

export default function TemplateEditor() {
  const { id } = useParams()
  const isNew = id === 'new'
  const nav = useNavigate()
  const [tmpl, setTmpl] = useState<Template>({ id: '', name: '', position: 'Generic', statLines: [] })
  const [descOpen, setDescOpen] = useState(false)
  const [descIndex, setDescIndex] = useState<number | null>(null)
  const [descDraft, setDescDraft] = useState('')

  useEffect(() => {
    if (!isNew && id) fetch(`/api/templates/${id}`).then(r => r.json()).then((t: Template) => setTmpl(t))
  }, [id, isNew])

  const addLine = () => setTmpl(t => ({ ...t, statLines: [...t.statLines, { key: `STAT${t.statLines.length+1}`, label: 'Stat', type: 'number', order: t.statLines.length+1 }] }))
  const save = async () => {
    // Re-sequence orders by current list position
    const ordered = tmpl.statLines.map((s, i) => ({ ...s, order: i + 1 }))
    const body = { ...tmpl, id: tmpl.id || crypto.randomUUID(), statLines: ordered }
    await fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    nav('/templates')
  }
  const remove = async () => {
    if (!tmpl.id) return
    await fetch(`/api/templates/${tmpl.id}`, { method: 'DELETE' })
    nav('/templates')
  }

  function moveUp(index: number) {
    if (index <= 0) return
    setTmpl(t => {
      const next = [...t.statLines]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return { ...t, statLines: next }
    })
  }
  function moveDown(index: number) {
    setTmpl(t => {
      if (index >= t.statLines.length - 1) return t
      const next = [...t.statLines]
      ;[next[index + 1], next[index]] = [next[index], next[index + 1]]
      return { ...t, statLines: next }
    })
  }

  function openDesc(index: number) {
    setDescIndex(index)
    setDescDraft(tmpl.statLines[index]?.description ?? '')
    setDescOpen(true)
  }
  function saveDesc() {
    if (descIndex == null) return setDescOpen(false)
    setTmpl(t => {
      const next = [...t.statLines]
      next[descIndex] = { ...next[descIndex], description: descDraft || undefined }
      return { ...t, statLines: next }
    })
    setDescOpen(false)
  }
  function removeLine(index: number) {
    setTmpl(t => ({ ...t, statLines: t.statLines.filter((_, i) => i !== index) }))
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
          <div className="col-2">Formula</div>
          <div className="col-2">Description</div>
          <div className="col-1 text-end">Order</div>
        </div>
        <div className="list-group">
          {tmpl.statLines.map((s, idx) => (
            <div className="list-group-item" key={idx} title={s.description ?? ''}>
              <div className="row g-2 align-items-center">
                <div className="col-2"><input placeholder="KEY" className="form-control" value={s.key} onChange={e => updateLine(idx, { key: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })} /></div>
                <div className="col-3 d-flex align-items-center gap-2">
                  <input placeholder="Label" className="form-control" value={s.label} onChange={e => updateLine(idx, { label: e.target.value })} />
                  {s.description ? <i className="fa fa-circle-info text-muted" title={s.description} /> : null}
                </div>
                <div className="col-2">
                  <select className="form-select" value={s.type} onChange={e => updateLine(idx, { type: e.target.value as any })}>
                    <option value="number">number</option>
                    <option value="text">text</option>
                    <option value="calc">calc</option>
                  </select>
                </div>
                <div className="col-2">
                  <input
                    className={`form-control ${s.type !== 'calc' ? 'bg-light' : ''}`}
                    placeholder={s.type !== 'calc' ? 'Set Type to Calculated' : 'e.g. REC / TGT * 100'}
                    value={s.formula ?? ''}
                    onChange={e => updateLine(idx, { formula: e.target.value })}
                    readOnly={s.type !== 'calc'}
                    title={s.type !== 'calc' ? 'Formula is only editable when Type is Calculated' : 'Enter a formula using other stat keys'}
                    onClick={() => { if (s.type !== 'calc') alert('To edit Formula, change Type to Calculated.'); }}
                    style={s.type !== 'calc' ? { cursor: 'not-allowed' } as React.CSSProperties : undefined}
                  />
                </div>
                <div className="col-2">
                  <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => openDesc(idx)} title={s.description ? 'Edit description' : 'Add description'}>
                    <i className={"fa " + (s.description ? 'fa-file-lines me-2' : 'fa-file-circle-plus me-2')} />
                    {s.description ? 'Edit' : 'Add'}
                  </button>
                </div>
                <div className="col-1 d-flex justify-content-end gap-1">
                  <button className="btn btn-sm btn-light" onClick={() => moveUp(idx)} disabled={idx === 0} title="Move up"><i className="fa fa-arrow-up"/></button>
                  <button className="btn btn-sm btn-light" onClick={() => moveDown(idx)} disabled={idx === tmpl.statLines.length - 1} title="Move down"><i className="fa fa-arrow-down"/></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removeLine(idx)} title="Remove"><i className="fa fa-trash"/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 d-flex gap-2">
        <button className="btn btn-primary" onClick={save}><i className="fa fa-save me-2"/>Save</button>
        {!isNew && <button className="btn btn-danger" onClick={remove}><i className="fa fa-trash me-2"/>Delete</button>}
      </div>

      {descOpen && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          style={{ zIndex: 1055 }}
          onClick={(e) => {
            // Only close if clicking the modal overlay itself, not the dialog
            if (e.target === e.currentTarget) {
              setDescOpen(false)
            }
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Stat Line Description</h5>
                <button type="button" className="btn-close" onClick={() => setDescOpen(false)} />
              </div>
              <div className="modal-body">
                <textarea className="form-control" rows={6} placeholder="Enter a detailed description for this stat line" value={descDraft} onChange={e => setDescDraft(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setDescOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveDesc}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  function updateLine(index: number, patch: Partial<StatLineDef>) {
    setTmpl(t => ({ ...t, statLines: t.statLines.map((s, i) => i === index ? { ...s, ...patch } : s) }))
  }
}
