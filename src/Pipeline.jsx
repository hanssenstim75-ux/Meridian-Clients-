import { useState, useRef, useEffect } from 'react'
import './Pipeline.css'

const STAGES = ['Lead', 'Contact', 'Proposal', 'Closed']

const STAGE_META = {
  Lead:     { color: '#444444' },
  Contact:  { color: '#666666' },
  Proposal: { color: '#999999' },
  Closed:   { color: '#ffffff' },
}

export default function Pipeline({ clients, onUpdateStage, onAddReferral }) {
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [referralModal, setReferralModal] = useState(null)
  const [lines, setLines] = useState([])
  const stageRefs = useRef({})
  const cardRefs = useRef({})
  const boardRef = useRef(null)
  const dragItem = useRef(null)

  const grouped = STAGES.reduce((acc, s) => {
    acc[s] = clients.filter(c => c.stage === s)
    return acc
  }, {})

  useEffect(() => {
    drawLines()
  }, [clients, dragging])

  useEffect(() => {
    window.addEventListener('resize', drawLines)
    return () => window.removeEventListener('resize', drawLines)
  }, [clients])

  function drawLines() {
    if (!boardRef.current) return
    const boardRect = boardRef.current.getBoundingClientRect()
    const newLines = []

    STAGES.forEach(stage => {
      const stageEl = stageRefs.current[stage]
      if (!stageEl) return
      const stageRect = stageEl.getBoundingClientRect()
      const stageX = stageRect.left - boardRect.left + stageRect.width / 2
      const stageY = stageRect.bottom - boardRect.top

      grouped[stage].forEach(client => {
        const cardEl = cardRefs.current[client.id]
        if (!cardEl) return
        const cardRect = cardEl.getBoundingClientRect()
        const cardX = cardRect.left - boardRect.left + cardRect.width / 2
        const cardY = cardRect.top - boardRect.top

        newLines.push({
          id: `${stage}-${client.id}`,
          x1: stageX, y1: stageY,
          x2: cardX, y2: cardY,
          color: STAGE_META[stage].color,
          active: dragging === client.id,
        })
      })
    })

    setLines(newLines)
  }

  function handleDragStart(e, client) {
    dragItem.current = client
    setDragging(client.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragEnd() {
    setDragging(null)
    setDragOver(null)
    dragItem.current = null
  }

  function handleDrop(e, stage) {
    e.preventDefault()
    if (dragItem.current && dragItem.current.stage !== stage) {
      onUpdateStage(dragItem.current.id, stage)
    }
    setDragging(null)
    setDragOver(null)
    dragItem.current = null
  }

  return (
    <div className="pipeline-page">
      <div className="mindmap-board" ref={boardRef}>

        <svg className="mindmap-svg" aria-hidden="true">
          {/* Spine connecting all stage nodes */}
          {STAGES.map((stage, i) => {
            if (i === STAGES.length - 1) return null
            const a = stageRefs.current[stage]
            const b = stageRefs.current[STAGES[i + 1]]
            if (!a || !b || !boardRef.current) return null
            const br = boardRef.current.getBoundingClientRect()
            const ar = a.getBoundingClientRect()
            const bRect = b.getBoundingClientRect()
            return (
              <line
                key={`spine-${stage}`}
                x1={ar.left - br.left + ar.width / 2}
                y1={ar.top - br.top + ar.height / 2}
                x2={bRect.left - br.left + bRect.width / 2}
                y2={bRect.top - br.top + bRect.height / 2}
                stroke="#2a2a2a"
                strokeWidth="1"
              />
            )
          })}

          {/* Lines from stage nodes to client cards */}
          {lines.map(l => {
            const midY = l.y1 + (l.y2 - l.y1) * 0.45
            const path = `M ${l.x1} ${l.y1} C ${l.x1} ${midY}, ${l.x2} ${midY}, ${l.x2} ${l.y2}`
            return (
              <path
                key={l.id}
                d={path}
                stroke={l.active ? '#555' : '#2a2a2a'}
                strokeWidth={l.active ? '1.5' : '1'}
                fill="none"
                strokeDasharray={l.active ? '4 3' : 'none'}
              />
            )
          })}
        </svg>

        {/* Stage nodes */}
        <div className="stage-nodes">
          {STAGES.map(stage => {
            const meta = STAGE_META[stage]
            const col = grouped[stage]
            const isOver = dragOver === stage

            return (
              <div
                key={stage}
                className={`stage-node-wrap ${isOver ? 'node-over' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(stage) }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => handleDrop(e, stage)}
              >
                <div
                  className="stage-node"
                  ref={el => stageRefs.current[stage] = el}
                  style={{ '--node-color': meta.color }}
                >
                  <div className="node-dot" style={{ background: meta.color }} />
                  <span className="node-name">{stage}</span>
                  <span className="node-count">{col.length}</span>
                </div>

                <div className="node-cards">
                  {col.map(client => {
                    const referredBy = client.referredBy
                      ? clients.find(c => c.id === client.referredBy)
                      : null
                    const referralCount = clients.filter(c => c.referredBy === client.id).length

                    return (
                      <div
                        key={client.id}
                        ref={el => cardRefs.current[client.id] = el}
                        className={`map-card ${dragging === client.id ? 'map-card-dragging' : ''}`}
                        draggable
                        onDragStart={e => handleDragStart(e, client)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="map-card-header">
                          <div className="map-avatar" style={referralCount > 0 ? { outline: '1px solid #3a3a3a', outlineOffset: '2px' } : {}}>{client.initials}</div>
                          <div className="map-card-info">
                            <div className="map-card-name">{client.name}</div>
                            {client.company && <div className="map-card-company">{client.company}</div>}
                          </div>
                          <button
                            className="ref-btn"
                            title="Log reference"
                            onClick={e => { e.stopPropagation(); setReferralModal(client) }}
                          >＋ ref</button>
                        </div>

                        {referredBy && (
                          <div className="ref-source">
                            <span className="ref-dot" />
                            Referred by {referredBy.name.split(' ')[0]}
                          </div>
                        )}

                        {referralCount > 0 && (
                          <div className="ref-gave">
                            <span className="ref-star">★</span>
                            {referralCount} referral{referralCount > 1 ? 's' : ''} given
                          </div>
                        )}

                        {client.reason && (
                          <div className="map-card-reason">{client.reason}</div>
                        )}
                        <div className="map-card-footer">
                          <span className="map-card-phone">{client.phone}</span>
                          {client.recontact && <RecontactChip date={client.recontact} />}
                        </div>
                      </div>
                    )
                  })}

                  {col.length === 0 && (
                    <div className={`node-empty ${isOver ? 'node-empty-over' : ''}`}>
                      {isOver ? 'Drop here' : 'Empty'}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {referralModal && (
        <ReferralModal
          from={referralModal}
          onClose={() => setReferralModal(null)}
          onSubmit={(name, phone) => {
            onAddReferral({ name, phone, referredBy: referralModal.id })
            setReferralModal(null)
          }}
        />
      )}
    </div>
  )
}

function ReferralModal({ from, onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim(), phone.trim())
  }

  return (
    <>
      <div className="ref-overlay" onClick={onClose} />
      <div className="ref-modal">
        <div className="ref-modal-header">
          <div>
            <div className="ref-modal-title">Log Reference</div>
            <div className="ref-modal-sub">From {from.name}</div>
          </div>
          <button className="ref-modal-close" onClick={onClose}>✕</button>
        </div>
        <form className="ref-modal-body" onSubmit={handleSubmit}>
          <div className="ref-chain">
            <div className="ref-chain-node ref-chain-from">
              <div className="ref-chain-avatar">{from.initials}</div>
              <span>{from.name}</span>
            </div>
            <div className="ref-chain-arrow">→</div>
            <div className="ref-chain-node ref-chain-new">
              <div className="ref-chain-avatar ref-chain-avatar-new">?</div>
              <span>{name || 'New Lead'}</span>
            </div>
          </div>
          <div className="ref-field">
            <label className="ref-label">Referred Person's Name *</label>
            <input
              className="ref-input"
              type="text"
              placeholder="Jan De Smedt"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="ref-field">
            <label className="ref-label">Phone Number</label>
            <input
              className="ref-input"
              type="tel"
              placeholder="+32 478 ..."
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          <div className="ref-modal-footer">
            <button type="button" className="ref-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="ref-submit">Create Lead →</button>
          </div>
        </form>
      </div>
    </>
  )
}

function RecontactChip({ date }) {
  const today = new Date().toISOString().split('T')[0]
  const diff = Math.round((new Date(date) - new Date(today)) / 86400000)
  if (diff < 0) return <span className="chip chip-overdue">{Math.abs(diff)}d overdue</span>
  if (diff === 0) return <span className="chip chip-today">Today</span>
  if (diff <= 7) return <span className="chip chip-soon">In {diff}d</span>
  return <span className="chip chip-default">{new Date(date).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}</span>
}
