import { useState } from 'react'
import './Agenda.css'

const CAMPAIGNS = [
  {
    id: 'reference',
    title: 'Reference Week',
    subtitle: 'Ask your best clients for a testimonial',
    desc: 'Closed clients who are satisfied are your most powerful sales tool. This week — reach out and ask.',
    icon: '★',
    filter: (clients) => clients.filter(c => c.stage === 'Closed'),
    action: 'Ask for reference',
    tip: 'Keep it short. "Would you be willing to say a few words about our work together?" is enough.',
  },
  {
    id: 'launch',
    title: 'Product Launch',
    subtitle: 'Inform every active client about something new',
    desc: 'A new service, a new offer, a new insight. Every client in your pipeline deserves to hear it first.',
    icon: '◈',
    filter: (clients) => clients.filter(c => ['Lead', 'Contact', 'Proposal'].includes(c.stage)),
    action: 'Share the news',
    tip: 'Lead with value, not the product. Start with what changes for them.',
  },
  {
    id: 'revenue',
    title: 'Revenue Week',
    subtitle: 'Push open proposals to a decision',
    desc: 'You have open proposals sitting. This week is about following up with intent and closing what\'s ready.',
    icon: '◎',
    filter: (clients) => clients.filter(c => c.stage === 'Proposal'),
    action: 'Follow up',
    tip: 'Don\'t ask "did you have a chance to look?" — ask "what questions do you still have?"',
  },
  {
    id: 'reactivation',
    title: 'Reactivation',
    subtitle: 'Wake up contacts you haven\'t spoken to in a while',
    desc: 'Cold doesn\'t mean lost. A simple check-in often re-opens a conversation you thought was over.',
    icon: '◷',
    filter: (clients) => {
      const today = new Date().toISOString().split('T')[0]
      return clients.filter(c => {
        if (!c.recontact) return false
        const diff = Math.round((new Date(today) - new Date(c.recontact)) / 86400000)
        return diff >= 0
      })
    },
    action: 'Reactivate',
    tip: 'Reference something specific from your last conversation. It shows you were paying attention.',
  },
]

export default function Agenda({ clients, activeCampaign, onSetCampaign }) {
  const [selected, setSelected] = useState(activeCampaign || null)

  const campaign = CAMPAIGNS.find(c => c.id === selected)
  const focusClients = campaign ? campaign.filter(clients) : []

  function handleSelect(id) {
    setSelected(id)
    onSetCampaign(id)
  }

  return (
    <div className="agenda-page">
      <div className="agenda-left">
        <div className="agenda-section-label">Choose this week's focus</div>

        <div className="campaign-cards">
          {CAMPAIGNS.map(c => (
            <button
              key={c.id}
              className={`campaign-card ${selected === c.id ? 'campaign-card-active' : ''}`}
              onClick={() => handleSelect(c.id)}
            >
              <div className="campaign-card-top">
                <span className="campaign-card-icon">{c.icon}</span>
                <div className="campaign-card-titles">
                  <div className="campaign-card-title">{c.title}</div>
                  <div className="campaign-card-sub">{c.subtitle}</div>
                </div>
                {selected === c.id && <span className="campaign-card-check">◆</span>}
              </div>
              <div className="campaign-card-desc">{c.desc}</div>
              <div className="campaign-card-count">
                {c.filter(clients).length} client{c.filter(clients).length !== 1 ? 's' : ''} to contact
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="agenda-right">
        {!campaign && (
          <div className="agenda-empty">
            <div className="agenda-empty-icon">◈</div>
            <div className="agenda-empty-title">No campaign selected</div>
            <div className="agenda-empty-desc">Pick a focus on the left to see which clients to contact this week.</div>
          </div>
        )}

        {campaign && (
          <>
            <div className="focus-header">
              <div className="focus-header-top">
                <span className="focus-icon">{campaign.icon}</span>
                <div>
                  <div className="focus-title">{campaign.title}</div>
                  <div className="focus-sub">{campaign.subtitle}</div>
                </div>
              </div>
              <div className="focus-tip">
                <span className="focus-tip-label">Meridian tip</span>
                <span className="focus-tip-text">{campaign.tip}</span>
              </div>
            </div>

            <div className="focus-list-header">
              <span className="focus-list-label">
                {focusClients.length > 0
                  ? `${focusClients.length} client${focusClients.length !== 1 ? 's' : ''} — contact them this week`
                  : 'No clients match this campaign right now'}
              </span>
            </div>

            <div className="focus-list">
              {focusClients.length === 0 && (
                <div className="focus-empty">Nothing to do here this week.</div>
              )}

              {focusClients.map((client, i) => (
                <div key={client.id} className="focus-client">
                  <div className="focus-client-left">
                    <span className="focus-client-num">{i + 1}</span>
                    <div className="focus-client-avatar">{client.initials}</div>
                    <div className="focus-client-info">
                      <div className="focus-client-name">{client.name}
                        {client.company && <span className="focus-client-co"> · {client.company}</span>}
                      </div>
                      <div className="focus-client-reason">{client.reason}</div>
                    </div>
                  </div>
                  <div className="focus-client-right">
                    <span className="focus-client-phone">{client.phone}</span>
                    <StagePill stage={client.stage} />
                    <button className="focus-action-btn">{campaign.action} →</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StagePill({ stage }) {
  const colors = {
    Lead: '#444',
    Contact: '#666',
    Proposal: '#999',
    Closed: '#fff',
  }
  return (
    <span className="stage-pill" style={{ color: colors[stage] || '#555', borderColor: colors[stage] ? `${colors[stage]}33` : '#2a2a2a' }}>
      {stage}
    </span>
  )
}
