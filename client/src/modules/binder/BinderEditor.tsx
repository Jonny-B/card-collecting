import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Binder, BinderPage } from '../../types'

export default function BinderEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [binder, setBinder] = useState<Binder | null>(null)
  const [pages, setPages] = useState<BinderPage[]>([])
  const isNew = useMemo(() => id === 'new' || !id, [id])

  useEffect(() => {
    if (id && id !== 'new') {
      fetch(`/api/binders/${id}`).then(r => r.json()).then(setBinder)
      fetch(`/api/binderPages?binderId=${id}`).then(r => r.json()).then(setPages)
    } else {
      setBinder({ id: `binder-${Date.now()}`, name: 'New Binder', pageSize: 9 })
      setPages([])
    }
  }, [id])

  const save = async () => {
    if (!binder) return
    await fetch('/api/binders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(binder) })
    navigate('/binder')
  }

  const addPage = async () => {
    if (!binder) return
    const pid = `page-${Date.now()}`
    const page: BinderPage = {
      id: pid,
      binderId: binder.id,
      type: 'Extra',
      slots: Array.from({ length: binder.pageSize ?? 9 }, (_, i) => ({ index: i + 1 }))
    }
    await fetch('/api/binderPages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(page) })
    setPages(v => [...v, page])
  }

  const removePage = async (pid: string) => {
  await fetch(`/api/binderPages/${pid}`, { method: 'DELETE' })
  setPages(v => v.filter(p => p.id !== pid))
  }

  if (!binder) return <div>Loading…</div>

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="h5 mb-0">Edit Binder</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={save}><i className="fa fa-save me-2"/>Save</button>
          <Link to="/binder" className="btn btn-secondary">Back</Link>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input className="form-control" value={binder.name} onChange={e => setBinder({ ...binder, name: e.target.value })} />
              </div>
              <div className="mb-3">
                <label className="form-label">Cover Image</label>
                <div className="d-flex align-items-center gap-3">
                  <div style={{ width: 120, height: 80 }} className="bg-light rounded d-flex align-items-center justify-content-center overflow-hidden">
                    {binder.coverUrl ? <img src={binder.coverUrl} style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <span className="text-muted small">No cover</span>}
                  </div>
                  <label className="btn btn-sm btn-outline-secondary mb-0">
                    <i className="fa fa-upload me-2"/>Upload
                    <input type="file" accept="image/*" hidden onChange={e => {
                      const f = e.target.files?.[0]
                      if (!f) return
                      const reader = new FileReader()
                      reader.onload = async () => {
                        const image = String(reader.result)
                        const resp = await fetch('/api/upload/binderCover', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ binderId: binder.id, image }) })
                        const data = await resp.json()
                        if (data?.url) setBinder({ ...binder, coverUrl: data.url })
                      }
                      reader.readAsDataURL(f)
                    }} />
                  </label>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Year</label>
                  <input type="number" className="form-control" value={binder.year ?? ''} onChange={e => setBinder({ ...binder, year: e.target.value ? Number(e.target.value) : undefined })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Page Size</label>
                  <input type="number" className="form-control" value={binder.pageSize ?? 9} onChange={e => setBinder({ ...binder, pageSize: Number(e.target.value) })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Page Count</label>
                  <input type="number" className="form-control" value={binder.pageCount ?? ''} onChange={e => setBinder({ ...binder, pageCount: e.target.value ? Number(e.target.value) : undefined })} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h3 className="h6 mb-0">Pages</h3>
                <button className="btn btn-sm btn-outline-primary" onClick={addPage}><i className="fa fa-plus me-1"/>Add Page</button>
              </div>
              {pages.length === 0 && <div className="text-muted">No pages yet.</div>}
              <div className="list-group small">
                {pages.map(p => (
                  <div className="list-group-item d-flex justify-content-between align-items-center" key={p.id}>
                    <div>
                      <div className="fw-semibold">{p.type}</div>
                      <div className="text-muted">Slots: {p.slots.length}</div>
                    </div>
                    <div className="d-flex gap-2">
                      <Link to={`/binder/${binder.id}/pages/${p.id}`} className="btn btn-sm btn-outline-secondary">
                        <i className="fa fa-pen me-1"/>Edit Page
                      </Link>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removePage(p.id)}>
                        <i className="fa fa-trash me-1"/>Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
