import { useState, useMemo } from 'react'
import './Clients.css'

const STAGES = ['All', 'Lead', 'Contact', 'Proposal', 'Closed']

const STAGE_COLORS = {
  Lead: '#444',
  Contact: '#666',
  Proposal: '#999',
  Closed: '#fff',
}

export default function Clients({ clients, onAddClient, onSelectClient }) {
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('All')
  const [sort, setSort] = useState('recontact')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    let list = [...clients]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.reason?.toLowerCase().includes(q)
      )
    }

    if (stageFilter !== 'All') {
      list = list.filter(c => c.stage === stageFilter)
    }

    if (sort === 'recontact') {
      list.sort((a, b) => {
        const da = a.recontact ? new Date(a.recontact) : new Date('9999-01-01')
        const db = b.recontact ? new Date(b.recontact) : new Date('9999-01-01')
        return da - db
      })
    } else if (sort === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === 'stage') {
      const order = { Lead: 0, Contact: 1, Proposal: 2, Closed: 3 }
      list.sort((a, b) => (order[a.stage] ?? 4) - (order[b.stage] ?? 4))
    }

    return list
  }, [clients, search, stageFilter, sort])

  const selectedClient = clients.find(c => c.id === selected)

  return (
    <div className="clients-page">
      <div className={`clients-main ${selected ? 'clients-main-split' : ''}`}>
        <div className="clients-toolbar">
          <div className="clients-search-wrap">
            <span className="search-icon">◎</span>
            <input
              className="clients-search"
              type="text"
              placeholder="Search by name, company, phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          <div className="clients-filters">
            <div className="filter-group">
              {STAGES.map(s => (
                <button
                  key={s}
                  className={`filter-btn ${stageFilter === s ? 'filter-btn-active' : ''}`}
                  onClick={() => setStageFilter(s)}
                >
                  {s !== 'All' && (
                    <span className="filter-dot" style={{ background: STAGE_COLORS[s] }} />
                  )}
                  {s}
                </button>
              ))}
            </div>

            <select
              className="sort-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="recontact">Sort: Recontact</option>
              <option value="name">Sort: Name</option>
              <option value="stage">Sort: Stage</option>
            </select>
          </div>
        </div>

        <div className="clients-count">
          {filtered.length} client{filtered.length !== 1 ? 's' : ''}
          {stageFilter !== 'All' && ` · ${stageFilter}`}
          {search && ` · "${search}"`}
        </div>

        <div className="clients-table">
          <div className="table-header">
            <span className="col-client">Client</span>
            <span className="col-reason">Buy Reason</span>
            <span className="col-stage">Stage</span>
            <span className="col-recontact">Recontact</span>
            <span className="col-hint">Hint</span>
          </div>

          {filtered.length === 0 && (
            <div className="table-empty">
              No clients match your search.
            </div>
          )}

          {filtered.map(client => {
            const recontactStatus = getRecontactStatus(client.recontact)
            const isSelected = selected === client.id

            return (
              <div
                key={client.id}
                className={`table-row ${isSelected ? 'table-row-active' : ''}`}
                onClick={() => {
                  if (onSelectClient) { onSelectClient(client.id); return }
                  setSelected(isSelected ? null : client.id)
                }}
              >
                <div className="col-client">
                  <div className="row-avatar">{client.initials}</div>
                  <div className="row-info">
                    <div className="row-name">{client.name}</div>
                    <div className="row-meta">
                      {client.company && <span>{client.company}</span>}
                      {client.phone && <span>{client.phone}</span>}
                    </div>
                  </div>
                </div>

                <div className="col-reason">
                  <span className="row-reason">{client.reason || '—'}</span>
                </div>

                <div className="col-stage">
                  <span className="row-stage-pill" style={{ color: STAGE_COLORS[client.stage], borderColor: `${STAGE_COLORS[client.stage]}33` }}>
                    {client.stage}
                  </span>
                </div>

                <div className="col-recontact">
                  {recontactStatus ? (
                    <span className={`row-recontact-badge badge-${recontactStatus.type}`}>
                      {recontactStatus.label}
                    </span>
                  ) : (
                    <span className="row-recontact-date">
                      {client.recontact ? new Date(client.recontact).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' }) : '—'}
                    </span>
                  )}
                </div>

                <div className="col-hint">
                  <span className="row-hint">{client.hint || '—'}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selectedClient && (
        <div className="client-detail">
          <div className="detail-header">
            <div className="detail-avatar">{selectedClient.initials}</div>
            <div className="detail-title-wrap">
              <div className="detail-name">{selectedClient.name}</div>
              {selectedClient.company && <div className="detail-company">{selectedClient.company}</div>}
            </div>
            <button className="detail-close" onClick={() => setSelected(null)}>✕</button>
          </div>

          <div className="detail-body">
            <DetailRow label="Phone" value={selectedClient.phone} />
            <DetailRow label="Stage">
              <span className="row-stage-pill" style={{ color: STAGE_COLORS[selectedClient.stage], borderColor: `${STAGE_COLORS[selectedClient.stage]}33` }}>
                {selectedClient.stage}
              </span>
            </DetailRow>
            <DetailRow label="Buy Reason" value={selectedClient.reason} />
            <DetailRow label="Recontact Hint" value={selectedClient.hint} />
            <DetailRow label="Recontact Date" value={selectedClient.recontact ? new Date(selectedClient.recontact).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
            {selectedClient.referredBy && <DetailRow label="Referred By" value={selectedClient.hint?.replace('Referred by ', '') || '—'} />}
            {selectedClient.company && <DetailRow label="Company" value={selectedClient.company} />}
            {selectedClient.btw && <DetailRow label="BTW" value={selectedClient.btw} />}
            {selectedClient.address && <DetailRow label="Address" value={selectedClient.address} />}
            {selectedClient.tasks && <DetailRow label="Tasks" value={selectedClient.tasks} />}
            {selectedClient.goal && <DetailRow label="Goal" value={selectedClient.goal} />}
            {selectedClient.email && <DetailRow label="Email" value={selectedClient.email} />}
          </div>

          <div className="detail-actions">
            <button className="detail-action-btn detail-action-primary">Call →</button>
            <button className="detail-action-btn detail-action-ghost">Edit</button>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value, children }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{children || value || '—'}</span>
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
