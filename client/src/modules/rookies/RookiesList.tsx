import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface Player {
  id: string
  name: string
  team: string
  position: string
  isPlayer: boolean
  isBrownsStarter?: boolean
}

export default function RookiesList() {
  const [players, setPlayers] = useState<Player[]>([])
  useEffect(() => {
    fetch('/api/players').then(r => r.json()).then(setPlayers)
  }, [])

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
  <h2 className="h5 m-0">Players</h2>
  <Link to="/rookies/new" className="btn btn-primary btn-sm"><i className="fa fa-plus me-2" />Add Player</Link>
      </div>
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr><th>Name</th><th>Team</th><th>Pos</th><th className="text-end">Actions</th></tr>
          </thead>
          <tbody>
            {players.filter(p => p.isPlayer).map(p => (
              <tr key={p.id}>
                <td>
                  <Link to={`/rookies/${p.id}`}>{p.name}</Link>
                  {p.isBrownsStarter && <i className="fa fa-star text-warning ms-2" title="Browns starter"/>}
                </td>
                <td>{p.team}</td>
                <td>{p.position}</td>
                <td className="text-end">
                  <div className="btn-group btn-group-sm">
                    <Link to={`/rookies/${p.id}/edit`} className="btn btn-outline-secondary"><i className="fa fa-pen"/></Link>
                    <button className="btn btn-outline-danger" onClick={() => del(p.id)} title="Delete"><i className="fa fa-trash"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  async function del(id: string) {
    if (!confirm('Delete this rookie?')) return
    await fetch(`/api/players/${id}`, { method: 'DELETE' })
    setPlayers(ps => ps.filter(p => p.id !== id))
  }
}
