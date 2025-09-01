import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type Stats = { players: number; templates: number; binderPages: number }

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ players: 0, templates: 0, binderPages: 0 })
  useEffect(() => { fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {}) }, [])
  return (
    <div className="row g-3">
      <div className="col-12">
        <div className="alert alert-info d-flex justify-content-between align-items-center">
          <div>
            Welcome! Plan your binder, manage players, and print sheets.
          </div>
          <div className="d-flex gap-2">
            <Link to="/rookies/new" className="btn btn-primary btn-sm"><i className="fa fa-plus me-2"/>Add Player</Link>
            <Link to="/templates/new" className="btn btn-outline-primary btn-sm"><i className="fa fa-plus me-2"/>New Template</Link>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-4">
        <div className="card">
          <div className="card-body text-center">
            <div className="h1 m-0">{stats.players}</div>
            <div className="text-muted">Players</div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-4">
        <div className="card">
          <div className="card-body text-center">
            <div className="h1 m-0">{stats.templates}</div>
            <div className="text-muted">Templates</div>
          </div>
        </div>
      </div>
      <div className="col-12 col-md-4">
        <div className="card">
          <div className="card-body text-center">
            <div className="h1 m-0">{stats.binderPages}</div>
            <div className="text-muted">Binder Pages</div>
          </div>
        </div>
      </div>
    </div>
  )
}
