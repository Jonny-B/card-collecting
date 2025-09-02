import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { BinderPage } from '../../types'

export default function BinderPageEditor() {
  const { id, pageId } = useParams()
  const [page, setPage] = useState<BinderPage | null>(null)

  useEffect(() => {
    if (id && pageId) {
      fetch(`/api/binderPages?binderId=${id}`).then(r => r.json()).then((pages: BinderPage[]) => {
        const p = pages.find(x => x.id === pageId) || null
        setPage(p)
      })
    }
  }, [id, pageId])

  const save = async () => {
    if (!page) return
    await fetch('/api/binderPages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(page) })
    // no redirect here; user can go back
  }

  if (!page) return <div>Loading…</div>

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 mb-0">Edit Page</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={save}><i className="fa fa-save me-2"/>Save</button>
          <Link to={`/binder/${id}/edit`} className="btn btn-secondary">Back</Link>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Type</label>
            <input className="form-control" value={page.type} onChange={e => setPage({ ...page, type: e.target.value })} />
          </div>
          <div className="row g-2">
            {page.slots.map((s, idx) => (
              <div className="col-6 col-md-4" key={idx}>
                <div className="border rounded p-2">
                  <div className="fw-semibold mb-1">Slot {s.index}</div>
                  <input className="form-control form-control-sm" placeholder="Note" value={s.note ?? ''} onChange={e => {
                    const copy = [...page.slots]
                    copy[idx] = { ...copy[idx], note: e.target.value }
                    setPage({ ...page, slots: copy })
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
