import { useState, useEffect } from 'react'
import './ClientDetail.css'

const STAGES = ['Lead', 'Contact', 'Proposal', 'Closed']
const STAGE_COLORS = { Lead: '#444', Contact: '#666', Proposal: '#999', Closed: '#fff' }

export default function ClientDetail({ client, clients, onBack, onUpdateStage, onUpdateClient }) {
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState(client.notes || [])
  const [stage, setStage] = useState(client.stage)
  const [editingHint, setEditingHint] = useState(false)
  const [hint, setHint] = useState(client.hint || '')

  // Sync state when switching between clients
  useEffect(() => {
    setStage(client.stage)
    setNotes(client.notes || [])
    setHint(client.hint || '')
    setEditingHint(false)
    setNote('')
  }, [client.id])

  const referredBy = client.referredBy ? clients.find(c => c.id === client.referredBy) : null
  const referrals = clients.filter(c => c.referredBy === client.id)

  function addNote(e) {
    e.preventDefault()
    if (!note.trim()) return
    const newNote = {
      id: Date.now(),
      text: note.trim(),
      date: new Date().toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' }),
    }
    const updatedNotes = [newNote, ...notes]
    setNotes(updatedNotes)
    setNote('')
    onUpdateClient(client.id, { notes: updatedNotes })
  }

  function changeStage(newStage) {
    setStage(newStage)
    onUpdateStage(client.id, newStage)
  }

  function saveHint() {
    setEditingHint(false)
    onUpdateClient(client.id, { hint })
  }

  const recontactStatus = getRecontactStatus(client.recontact)

  return (
    <div className="detail-page">
      <div className="detail-topbar">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div className="detail-topbar-center">
          <div className="detail-topbar-name">{client.name}</div>
          {client.company && <div className="detail-topbar-co">{client.company}</div>}
        </div>
        <div className="detail-topbar-right">
          <a className="detail-call-btn" href={`tel:${client.phone?.replace(/\s/g, '')}`}>Call {client.phone} →</a>
        </div>
      </div>

      <div className="detail-layout">
        {/* Left — client info */}
        <div className="detail-left">
          <div className="detail-card">
            <div className="detail-card-avatar-wrap">
              <div className="detail-big-avatar">{client.initials}</div>
              <div className="detail-card-name">{client.name}</div>
              {client.company && <div className="detail-card-company">{client.company}</div>}
            </div>

            <div className="detail-info-rows">
              <InfoRow label="Phone" value={client.phone} />
              <InfoRow label="Buy Reason" value={client.reason} />
              {client.btw && <InfoRow label="BTW" value={client.btw} />}
              {client.email && <InfoRow label="Email" value={client.email} />}
              {client.address && <InfoRow label="Address" value={client.address} />}
              {client.tasks && <InfoRow label="Tasks" value={client.tasks} />}
              {client.goal && <InfoRow label="Goal" value={client.goal} />}
              {client.social && <InfoRow label="Social" value={client.social} />}
              {client.product && <InfoRow label="Product / Service" value={client.product} />}
              {client.renewal && <InfoRow label="Contract Renewal" value={new Date(client.renewal).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })} />}
            </div>
          </div>

          {/* Stage */}
          <div className="detail-section">
            <div className="detail-section-label">Pipeline Stage</div>
            <div className="stage-selector">
              {STAGES.map(s => (
                <button
                  key={s}
                  className={`stage-sel-btn ${stage === s ? 'stage-sel-active' : ''}`}
                  style={stage === s ? { color: STAGE_COLORS[s], borderColor: `${STAGE_COLORS[s]}55` } : {}}
                  onClick={() => changeStage(s)}
                >
                  <span className="stage-sel-dot" style={{ background: STAGE_COLORS[s] }} />
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Recontact */}
          <div className="detail-section">
            <div className="detail-section-label">Recontact</div>
            <div className="recontact-detail-row">
              <div>
                <div className="recontact-detail-date">
                  {client.recontact
                    ? new Date(client.recontact).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })
                    : 'Not set'}
                </div>
                {recontactStatus && (
                  <span className={`rc-badge rc-${recontactStatus.type}`}>{recontactStatus.label}</span>
                )}
              </div>
            </div>

            <div className="hint-row">
              {editingHint ? (
                <div className="hint-edit-wrap">
                  <input
                    className="hint-edit-input"
                    value={hint}
                    onChange={e => setHint(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveHint()}
                    autoFocus
                  />
                  <button className="hint-save-btn" onClick={saveHint}>Save</button>
                </div>
              ) : (
                <div className="hint-display" onClick={() => setEditingHint(true)}>
                  <span className="hint-text">{hint || 'Add a recontact hint...'}</span>
                  <span className="hint-edit-icon">✎</span>
                </div>
              )}
            </div>
          </div>

          {/* Referral chain */}
          {(referredBy || referrals.length > 0) && (
            <div className="detail-section">
              <div className="detail-section-label">Referral Chain</div>
              {referredBy && (
                <div className="ref-chain-row">
                  <div className="ref-chain-label">Referred by</div>
                  <div className="ref-chain-client">
                    <div className="ref-mini-avatar">{referredBy.initials}</div>
                    <span>{referredBy.name}</span>
                  </div>
                </div>
              )}
              {referrals.length > 0 && (
                <div className="ref-chain-row">
                  <div className="ref-chain-label">Referred {referrals.length} client{referrals.length > 1 ? 's' : ''}</div>
                  <div className="ref-chain-list">
                    {referrals.map(r => (
                      <div key={r.id} className="ref-chain-client">
                        <div className="ref-mini-avatar">{r.initials}</div>
                        <span>{r.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — activity + notes */}
        <div className="detail-right">
          <div className="detail-section">
            <div className="detail-section-label">Add Note</div>
            <form className="note-form" onSubmit={addNote}>
              <textarea
                className="note-input"
                placeholder="Log a call, a meeting, a next step..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) addNote(e) }}
              />
              <div className="note-form-footer">
                <span className="note-hint">⌘ Enter to save</span>
                <button className="note-submit" type="submit">Log Note →</button>
              </div>
            </form>
          </div>

          <div className="detail-section" style={{ flex: 1 }}>
            <div className="detail-section-label">Activity</div>
            <div className="activity-feed">
              {notes.map(n => (
                <div key={n.id} className="activity-item activity-note">
                  <div className="activity-dot activity-dot-note" />
                  <div className="activity-body">
                    <div className="activity-text">{n.text}</div>
                    <div className="activity-meta">{n.date} · {n.time}</div>
                  </div>
                </div>
              ))}

              <div className="activity-item">
                <div className="activity-dot activity-dot-stage" />
                <div className="activity-body">
                  <div className="activity-text">Stage set to <strong>{stage}</strong></div>
                  <div className="activity-meta">Current</div>
                </div>
              </div>

              {referredBy && (
                <div className="activity-item">
                  <div className="activity-dot activity-dot-ref" />
                  <div className="activity-body">
                    <div className="activity-text">Referred by <strong>{referredBy.name}</strong></div>
                    <div className="activity-meta">On creation</div>
                  </div>
                </div>
              )}

              <div className="activity-item activity-last">
                <div className="activity-dot activity-dot-created" />
                <div className="activity-body">
                  <div className="activity-text">Client added to Meridian</div>
                  <div className="activity-meta">Start of record</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  )
}

function getRecontactStatus(dateStr) {
  if (!dateStr) return null
  const today = new Date().toISOString().split('T')[0]
  const diff = Math.round((new Date(dateStr) - new Date(today)) / 86400000)
  if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, type: 'overdue' }
  if (diff === 0) return { label: 'Today', type: 'today' }
  if (diff <= 7) return { label: `In ${diff}d`, type: 'soon' }
  return null
}
