import { useEffect, useMemo, useState } from 'react'
import type { Player } from '../../types'

export default function Browns() {
  const [players, setPlayers] = useState<Player[]>([])
  useEffect(() => { fetch('/api/players').then(r => r.json()).then(setPlayers) }, [])

  const starters = useMemo(() => players.filter(p => p.isBrownsStarter), [players])
  const byPos = useMemo(() => {
    const groups: Record<string, Player[]> = {}
    for (const p of starters) {
      const k = (p.position || 'Other').toUpperCase()
      groups[k] = groups[k] || []
      groups[k].push(p)
    }
    return Object.entries(groups).sort(([a],[b]) => a.localeCompare(b))
  }, [starters])

  return (
    <div className="print-page">
      <div className="d-flex justify-content-between align-items-center mb-3 no-print">
        <h2 className="h5 m-0">Cleveland Browns Lineup</h2>
        <div className="btn-group">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}><i className="fa fa-print me-2"/>Print</button>
        </div>
      </div>
      <div className="print-header">
        <div className="print-date float-end">{new Date().toLocaleDateString()}</div>
        <div className="print-title">Browns Lineup</div>
        <div className="print-subtitle">Starters</div>
      </div>
      <div className="row g-3">
        {byPos.length === 0 && (
          <div className="col-12"><div className="alert alert-info">No starters marked yet. Edit a player and check "Browns Starter".</div></div>
        )}
        {byPos.map(([pos, list]) => (
          <div className="col-md-6" key={pos}>
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <strong>{pos}</strong>
                <span className="badge bg-secondary">{list.length}</span>
              </div>
              <ul className="list-group list-group-flush">
                {list.map(p => (
                  <li className="list-group-item d-flex justify-content-between" key={p.id}>
                    <span>{p.name}</span>
                    <small className="text-muted">{p.team}</small>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <div className="print-footer">
        <div>Unofficial lineup</div>
        <div>Page 1 of 1</div>
      </div>
    </div>
  )
}
