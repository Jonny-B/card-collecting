import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type TemplateSummary = { id: string; name: string; position: string }

export default function PositionTemplatesTab() {
  const [items, setItems] = useState<TemplateSummary[]>([])
  const navigate = useNavigate()

  useEffect(() => { fetch('/api/templates').then(r=>r.json()).then(setItems) }, [])

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="h6 m-0">Position Templates</h3>
        <button className="btn btn-sm btn-primary" onClick={() => navigate('/settings/position-templates/new')}><i className="fa fa-plus me-1"/>New Template</button>
      </div>
      <div className="list-group">
        {items.map(t => (
          <Link key={t.id} to={`/settings/position-templates/${t.id}/edit`} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
            <span>{t.name} <span className="text-muted">({t.position})</span></span>
            <i className="fa fa-chevron-right text-muted"/>
          </Link>
        ))}
        {items.length === 0 && <div className="text-muted small">No templates yet.</div>}
      </div>
    </div>
  )
}
