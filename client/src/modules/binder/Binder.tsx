import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Binder } from '../../types'

export default function Binder() {
  const [binders, setBinders] = useState<Binder[]>([])
  const navigate = useNavigate()

  useEffect(() => { fetch('/api/binders').then(r => r.json()).then(setBinders) }, [])

  const createBinder = async () => {
    const id = `binder-${Date.now()}`
    const b: Binder = { id, name: 'New Binder', pageSize: 9 }
    await fetch('/api/binders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
    setBinders(v => [b, ...v])
    navigate(`/binder/${id}/edit`)
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="h5 mb-0">Binders</h2>
        <button className="btn btn-primary" onClick={createBinder}><i className="fa fa-plus me-2"/>New Binder</button>
      </div>
      {binders.length === 0 && <div className="text-muted">No binders yet.</div>}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
        {binders.map(b => (
          <div className="col" key={b.id}>
            <div className="card h-100">
              {b.coverUrl ? (
                <img src={b.coverUrl} className="card-img-top" style={{ objectFit: 'cover', height: 140 }} />
              ) : (
                <div className="card-img-top d-flex align-items-center justify-content-center bg-light" style={{ height: 140 }}>
                  <span className="text-muted">No cover</span>
                </div>
              )}
              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-bold">{b.name}</div>
                    <div className="text-muted small">{b.year ?? 'Year —'}</div>
                  </div>
                </div>
                <div className="mt-auto d-flex gap-2">
                  <Link to={`/binder/${b.id}/edit`} className="btn btn-sm btn-outline-primary">
                    <i className="fa fa-pen me-1"/>Edit
                  </Link>
                  <Link to={`/binder/${b.id}`} className="btn btn-sm btn-outline-secondary">
                    <i className="fa fa-book me-1"/>Open
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
