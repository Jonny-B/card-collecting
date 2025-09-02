import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface Player {
  id: string
  name: string
  team: string
  position: string
  isPlayer: boolean
  isBrownsStarter?: boolean
  photoUrl?: string
}

interface MetaTeam { abbr: string; name: string; helmetUrl?: string }

export default function RookiesList() {
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<MetaTeam[]>([])
  useEffect(() => {
    fetch('/api/players').then(r => r.json()).then(setPlayers)
    fetch('/api/meta/teams').then(r => r.json()).then(setTeams)
  }, [])

  const teamFor = (abbr: string) => teams.find(t => t.abbr === abbr)

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
                  <div className="d-flex align-items-center gap-2">
                    {p.photoUrl && <img src={p.photoUrl} alt="" style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 4 }} />}
                    <Link to={`/rookies/${p.id}`}>{p.name}</Link>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    {teamFor(p.team)?.helmetUrl && <img src={teamFor(p.team)!.helmetUrl} alt="" style={{ width: 28, height: 18 }} />}
                    <span title={teamFor(p.team)?.name || p.team}>{p.team}</span>
                  </div>
                </td>
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
