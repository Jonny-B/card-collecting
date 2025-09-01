import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Player } from '../../types'

export default function RookieDetail() {
  const { id } = useParams()
  const [player, setPlayer] = useState<Player | null>(null)
  useEffect(() => {
    if (id) fetch(`/api/players/${id}`).then(r => r.json()).then(setPlayer)
  }, [id])
  if (!player) return <div>Loading…</div>
  return (
    <div className="print-page">
      <div className="d-flex justify-content-between align-items-center mb-3 no-print">
        <h2 className="h5 m-0">Rookie Detail: {player.name}</h2>
        <div className="btn-group">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>
            <i className="fa fa-print me-2"/>Print Overview
          </button>
          <Link to={`/rookies/${player.id}/edit`} className="btn btn-outline-secondary btn-sm"><i className="fa fa-pen me-2"/>Edit</Link>
          <Link to="/rookies" className="btn btn-outline-secondary btn-sm">Back</Link>
        </div>
      </div>
      <div className="print-header">
        <div className="print-date float-end">{new Date().toLocaleDateString()}</div>
        <div className="print-title">Rookie Overview</div>
        <div className="print-subtitle">{player.name} • {player.team} • {player.position}</div>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>College:</strong> {player.colleges?.join(', ')}</p>
              <p><strong>Draft:</strong> {player.draftYear ?? '—'} • Pick {player.draftPick ?? '—'}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Notes:</strong> {player.notes ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="print-footer">
        <div>Legend: totals unless noted</div>
        <div>Page 1 of 1</div>
      </div>
    </div>
  )
}
