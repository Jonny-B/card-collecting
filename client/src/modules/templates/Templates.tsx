import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface StatLineDef {
  key: string
  label: string
  type: 'number' | 'text' | 'calc'
  formula?: string
  perGame?: boolean
  order: number
}

interface Template {
  id: string
  name: string
  position: string
  statLines: StatLineDef[]
}

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([])
  useEffect(() => { fetch('/api/templates').then(r => r.json()).then(setTemplates) }, [])

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 className="h5 m-0">Templates</h2>
        <Link to="/templates/new" className="btn btn-primary btn-sm"><i className="fa fa-plus me-2"/>New</Link>
      </div>
      <div className="list-group">
        {templates.map(t => (
          <Link to={`/templates/${t.id}/edit`} key={t.id} className="list-group-item list-group-item-action">
            <div className="d-flex justify-content-between">
              <strong>{t.name}</strong>
              <span className="badge bg-secondary">{t.position}</span>
            </div>
            <small className="text-muted">{t.statLines.length} stat lines</small>
          </Link>
        ))}
      </div>
    </div>
  )
}
