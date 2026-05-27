import { useState } from 'react'
import { TEAM } from './teamData'
import './Leaderboard.css'

const METRICS = [
  { key: 'contactsThisWeek', label: 'Contacts', sub: 'This week' },
  { key: 'closedThisMonth', label: 'Closed', sub: 'This month' },
  { key: 'referrals', label: 'Referrals', sub: 'Total given' },
  { key: 'pipelineValue', label: 'Pipeline', sub: 'Total value', format: v => `€ ${(v / 1000).toFixed(0)}k` },
]

export default function Leaderboard() {
  const [activeMetric, setActiveMetric] = useState('contactsThisWeek')

  const metric = METRICS.find(m => m.key === activeMetric)
  const sorted = [...TEAM].sort((a, b) => b[activeMetric] - a[activeMetric])
  const max = sorted[0][activeMetric]

  const top = sorted[0]

  return (
    <div className="leaderboard-page">

      <div className="lb-metric-tabs">
        {METRICS.map(m => (
          <button
            key={m.key}
            className={`lb-tab ${activeMetric === m.key ? 'lb-tab-active' : ''}`}
            onClick={() => setActiveMetric(m.key)}
          >
            <span className="lb-tab-label">{m.label}</span>
            <span className="lb-tab-sub">{m.sub}</span>
          </button>
        ))}
      </div>

      <div className="lb-content">
        <div className="lb-left">
          <div className="lb-section-label">Ranking · {metric.label}</div>

          <div className="lb-list">
            {sorted.map((member, i) => {
              const val = member[activeMetric]
              const pct = max > 0 ? (val / max) * 100 : 0
              const isFirst = i === 0
              const format = metric.format || (v => v)

              return (
                <div key={member.id} className={`lb-row ${isFirst ? 'lb-row-first' : ''}`}>
                  <div className="lb-rank">
                    {i === 0 ? '◆' : i === 1 ? '◈' : i === 2 ? '◎' : <span className="lb-rank-num">{i + 1}</span>}
                  </div>

                  <div className="lb-member">
                    <div className="lb-avatar" style={isFirst ? { background: '#2a2a2a', color: '#fff' } : {}}>{member.initials}</div>
                    <div className="lb-member-info">
                      <div className="lb-member-name">{member.name}</div>
                      <div className="lb-member-role">{member.role}</div>
                    </div>
                  </div>

                  <div className="lb-bar-wrap">
                    <div className="lb-bar-track">
                      <div
                        className="lb-bar-fill"
                        style={{
                          width: `${pct}%`,
                          background: isFirst ? '#fff' : '#333',
                        }}
                      />
                    </div>
                  </div>

                  <div className={`lb-value ${isFirst ? 'lb-value-first' : ''}`}>
                    {format(val)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="lb-right">
          <div className="lb-section-label">This week's leader</div>

          <div className="lb-spotlight">
            <div className="lb-spot-avatar">{top.initials}</div>
            <div className="lb-spot-name">{top.name}</div>
            <div className="lb-spot-role">{top.role}</div>

            <div className="lb-spot-metric">
              <div className="lb-spot-val">{metric.format ? metric.format(top[activeMetric]) : top[activeMetric]}</div>
              <div className="lb-spot-label">{metric.label} · {metric.sub}</div>
            </div>

            <div className="lb-spot-stats">
              <div className="lb-spot-stat">
                <div className="lb-spot-stat-val">{top.clients}</div>
                <div className="lb-spot-stat-label">Clients</div>
              </div>
              <div className="lb-spot-stat">
                <div className="lb-spot-stat-val">{top.referrals}</div>
                <div className="lb-spot-stat-label">Referrals</div>
              </div>
              <div className="lb-spot-stat">
                <div className="lb-spot-stat-val">{top.closedThisMonth}</div>
                <div className="lb-spot-stat-label">Closed</div>
              </div>
            </div>
          </div>

          <div className="lb-section-label" style={{ marginTop: 24 }}>Team overview</div>
          <div className="lb-team-stats">
            <div className="lb-team-stat">
              <div className="lb-team-stat-val">{TEAM.reduce((s, m) => s + m.clients, 0)}</div>
              <div className="lb-team-stat-label">Total clients</div>
            </div>
            <div className="lb-team-stat">
              <div className="lb-team-stat-val">{TEAM.reduce((s, m) => s + m.closedThisMonth, 0)}</div>
              <div className="lb-team-stat-label">Closed this month</div>
            </div>
            <div className="lb-team-stat">
              <div className="lb-team-stat-val">€ {(TEAM.reduce((s, m) => s + m.pipelineValue, 0) / 1000).toFixed(0)}k</div>
              <div className="lb-team-stat-label">Team pipeline</div>
            </div>
            <div className="lb-team-stat">
              <div className="lb-team-stat-val">{TEAM.reduce((s, m) => s + m.referrals, 0)}</div>
              <div className="lb-team-stat-label">Referrals given</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
