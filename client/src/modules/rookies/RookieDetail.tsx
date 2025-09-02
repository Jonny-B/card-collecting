import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Player, Template, Game, MetaTeam } from '../../types'

export default function RookieDetail() {
  const { id } = useParams()
  const [player, setPlayer] = useState<Player | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [teams, setTeams] = useState<MetaTeam[]>([])

  useEffect(() => { fetch('/api/templates').then(r => r.json()).then(setTemplates) }, [])
  useEffect(() => { fetch('/api/meta/teams').then(r => r.json()).then(setTeams) }, [])
  useEffect(() => {
    if (id) fetch(`/api/players/${id}`).then(r => r.json()).then(setPlayer)
    if (id) fetch(`/api/players/${id}/games`).then(r => r.json()).then(setGames)
  }, [id])

  const template = useMemo(() => templates.find(t => t.id === player?.templateId), [templates, player?.templateId])
  const team = teams.find(t => t.abbr === player?.team)

  if (!player) return <div>Loading…</div>
  return (
    <div className="print-page">
      <div className="d-flex justify-content-between align-items-center mb-3 no-print">
        <h2 className="h5 m-0">Player Detail: {player.name}</h2>
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
        <div className="print-title">Player Overview</div>
        <div className="print-subtitle">{player.name} • {player.team} • {player.position}</div>
        {team?.helmetUrl && <img src={team.helmetUrl} alt="Helmet" style={{ height: 32 }} />}
      </div>
      <div className="card mb-3">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 d-flex align-items-start gap-3">
              {player.photoUrl && <img src={player.photoUrl} alt="Player" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8 }} />}
              <div>
                <p><strong>College:</strong> {player.colleges?.join(', ')}</p>
                <p><strong>Draft:</strong> {player.draftYear ?? '—'} • Pick {player.draftPick ?? '—'}</p>
              </div>
            </div>
            <div className="col-md-6">
              <p><strong>Notes:</strong> {player.notes ?? '—'}</p>
              <p><strong>Template:</strong> {template ? template.name : 'None'}</p>
            </div>
          </div>
        </div>
      </div>

      <GamesSection
        player={player}
        template={template}
        games={games}
        onSaved={g => setGames(gs => {
          const ix = gs.findIndex(x => x.id === g.id)
          if (ix >= 0) { const next = [...gs]; next[ix] = g; return next }
          return [...gs, g]
        })}
        onDeleted={id => setGames(gs => gs.filter(g => g.id !== id))}
      />

      <div className="print-footer">
        <div>Legend: totals unless noted</div>
        <div>Page 1 of 1</div>
      </div>
    </div>
  )
}

function GamesSection({ player, template, games, onSaved, onDeleted }: { player: Player, template?: Template, games: Game[], onSaved: (g: Game) => void, onDeleted: (id: string) => void }) {
  const [draft, setDraft] = useState<Game | null>(null)
  const [teams, setTeams] = useState<MetaTeam[]>([])
  useEffect(() => { fetch('/api/meta/teams').then(r => r.json()).then(setTeams) }, [])

  const startAdd = (isBye: boolean) => {
    if (!template) return alert('Assign a template to this player first (Edit Player).')
    const id = crypto.randomUUID()
    const initial: Game = { id, playerId: player.id, templateId: template.id, isBye, date: undefined, opponentAbbr: undefined, teamScore: undefined, oppScore: undefined, values: {} }
    if (!isBye) {
      template.statLines.forEach(sl => { if (sl.type !== 'calc') initial.values[sl.key] = '' })
    }
    setDraft(initial)
  }

  const save = async () => {
    if (!draft) return
    await fetch('/api/games', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
    onSaved(draft)
    setDraft(null)
  }

  const del = async (id: string) => {
    await fetch(`/api/games/${id}`, { method: 'DELETE' })
    onDeleted(id)
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div className="h6 m-0">Weekly Games</div>
        <div className="btn-group btn-group-sm">
          <button className="btn btn-outline-primary" onClick={() => startAdd(false)}><i className="fa fa-plus me-2" />Add Game</button>
          <button className="btn btn-outline-secondary" onClick={() => startAdd(true)}><i className="fa fa-bed me-2" />Bye Week</button>
        </div>
      </div>
      <div className="card-body">
        {games.length === 0 && <div className="text-muted">No games yet. Add one to start tracking weekly stats.</div>}
        {games.map(g => (
          <div className="border rounded p-2 mb-2" key={g.id}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{g.date || 'No date'}</strong>
                {g.isBye ? <span className="badge bg-secondary ms-2">BYE</span> : null}
                {g.opponentAbbr && <span className="ms-2" title={teams.find(t => t.abbr === g.opponentAbbr)?.name}>vs {g.opponentAbbr}</span>}
                {(g.teamScore != null && g.oppScore != null) && <span className="ms-2">{g.teamScore}-{g.oppScore}</span>}
              </div>
              <button className="btn btn-sm btn-outline-danger" onClick={() => del(g.id)} title="Delete"><i className="fa fa-trash"/></button>
            </div>
            {!g.isBye && template && (
              <div className="row g-2 text-muted small mt-2">
                {template.statLines.map(sl => (
                  <div className="col-6 col-md-3" key={sl.key}>
                    <div className="d-flex flex-column">
                      <span>{sl.label}</span>
                      <span className="text-dark">{String(g.values[sl.key] ?? '—')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {draft && (
          <div className="border rounded p-2">
            <div className="row g-2 align-items-end">
              <div className="col-md-3">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" value={draft.date ?? ''} onChange={e => setDraft({ ...draft, date: e.target.value || undefined })} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Opponent</label>
                <select className="form-select" value={draft.opponentAbbr ?? ''} onChange={e => setDraft({ ...draft, opponentAbbr: e.target.value || undefined })} disabled={draft.isBye}>
                  <option value="">Select team…</option>
                  {teams.map(t => <option key={t.abbr} value={t.abbr}>{t.abbr} — {t.name}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Final Score</label>
                <div className="input-group">
                  <input type="number" className="form-control" placeholder="Us" value={draft.teamScore ?? ''} onChange={e => setDraft({ ...draft, teamScore: e.target.value === '' ? undefined : Number(e.target.value) })} disabled={draft.isBye} />
                  <span className="input-group-text">-</span>
                  <input type="number" className="form-control" placeholder="Them" value={draft.oppScore ?? ''} onChange={e => setDraft({ ...draft, oppScore: e.target.value === '' ? undefined : Number(e.target.value) })} disabled={draft.isBye} />
                </div>
              </div>
              <div className="col-md-3 d-flex align-items-end gap-2">
                <div className="form-check">
                  <input id="isbye" className="form-check-input" type="checkbox" checked={draft.isBye} onChange={e => setDraft({ ...draft, isBye: e.target.checked })} />
                  <label htmlFor="isbye" className="form-check-label">Bye Week</label>
                </div>
                <button className="btn btn-primary ms-auto" onClick={save}><i className="fa fa-save me-2"/>Save</button>
                <button className="btn btn-outline-secondary" onClick={() => setDraft(null)}>Cancel</button>
              </div>
            </div>
            {!draft.isBye && template && (
              <div className="row g-2 mt-2">
                {template.statLines.map(sl => (
                  <div className="col-6 col-md-3" key={sl.key}>
                    <label className="form-label">{sl.label}</label>
                    {sl.type === 'number' && (
                      <input type="number" className="form-control" value={(draft.values[sl.key] as any) ?? ''} onChange={e => setDraft({ ...draft, values: { ...draft.values, [sl.key]: e.target.value } })} />
                    )}
                    {sl.type === 'text' && (
                      <input className="form-control" value={(draft.values[sl.key] as any) ?? ''} onChange={e => setDraft({ ...draft, values: { ...draft.values, [sl.key]: e.target.value } })} />
                    )}
                    {sl.type === 'calc' && (
                      <input className="form-control" value={String(draft.values[sl.key] ?? '')} disabled />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
