import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Binder, BinderPage } from '../../types'

export default function BinderView() {
  const { id } = useParams()
  const [binder, setBinder] = useState<Binder | null>(null)
  const [pages, setPages] = useState<BinderPage[]>([])

  useEffect(() => {
    if (!id) return
    fetch(`/api/binders/${id}`).then(r => r.json()).then(setBinder)
    fetch(`/api/binderPages?binderId=${id}`).then(r => r.json()).then(setPages)
  }, [id])

  if (!id) return <div>Missing binder id</div>
  if (!binder) return <div>Loading…</div>

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-3">
          <Link to="/binder" className="btn btn-sm btn-outline-secondary"><i className="fa fa-arrow-left me-1"/>Back</Link>
          <h2 className="h5 mb-0">{binder.name} {binder.year ? `(${binder.year})` : ''}</h2>
        </div>
        <Link to={`/binder/${binder.id}/edit`} className="btn btn-sm btn-outline-primary"><i className="fa fa-pen me-1"/>Edit Binder</Link>
      </div>

      <div className="row row-cols-2 row-cols-md-4 row-cols-lg-5 g-2">
        {pages.map((p, i) => (
          <div className="col" key={p.id}>
            <Link to={`/binder/${binder.id}/pages/${p.id}`} className="text-decoration-none">
              <div className="border rounded text-center p-3 h-100">
                <div className="fw-semibold">Page {i + 1}</div>
                <div className="text-muted small">{p.type}</div>
                <div className="text-muted small">Slots: {p.slots.length}</div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
