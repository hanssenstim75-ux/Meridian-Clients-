import { useState } from 'react'
import { TEAM } from './teamData'
import './TeamView.css'

const METRICS = [
  { key: 'contactsThisWeek', label: 'Contacts This Week', max: 20 },
  { key: 'closedThisMonth', label: 'Closed This Month', max: 8 },
  { key: 'followUpsDue', label: 'Follow-ups Due', max: 10, invert: true },
  { key: 'referrals', label: 'Referrals Given', max: 6 },
]

export default function TeamView() {
  const [selected, setSelected] = useState(null)
  const member = TEAM.find(m => m.id === selected)

  return (
    <div className="team-page">
      <div className="team-grid">
        {TEAM.map((m, i) => {
          const isLeader = m.role === 'Leader'
          const isSelected = selected === m.id

          return (
            <div
              key={m.id}
              className={`team-card ${isSelected ? 'team-card-active' : ''} ${isLeader ? 'team-card-leader' : ''}`}
              onClick={() => setSelected(isSelected ? null : m.id)}
            >
              <div className="team-card-header">
                <div className="team-avatar">{m.initials}</div>
                <div className="team-card-info">
                  <div className="team-name">{m.name}</div>
                  <div className="team-role">{m.role}</div>
                </div>
                <div className="team-activity">{m.lastActivity}</div>
              </div>

              <div className="team-stats-row">
                <div className="team-stat">
                  <div className="team-stat-val">{m.clients}</div>
                  <div className="team-stat-label">Clients</div>
                </div>
                <div className="team-stat">
                  <div className="team-stat-val">{m.closedThisMonth}</div>
                  <div className="team-stat-label">Closed</div>
                </div>
                <div className="team-stat">
                  <div className="team-stat-val">€ {(m.pipelineValue / 1000).toFixed(0)}k</div>
                  <div className="team-stat-label">Pipeline</div>
                </div>
                <div className={`team-stat ${m.followUpsDue > 5 ? 'team-stat-warn' : ''}`}>
                  <div className="team-stat-val">{m.followUpsDue}</div>
                  <div className="team-stat-label">Due</div>
                </div>
              </div>

              <div className="team-bars">
                {METRICS.map(metric => {
                  const val = m[metric.key]
                  const pct = Math.min((val / metric.max) * 100, 100)
                  const warn = metric.invert && val > 6

                  return (
                    <div key={metric.key} className="team-bar-row">
                      <span className="team-bar-label">{metric.label}</span>
                      <div className="team-bar-track">
                        <div
                          className={`team-bar-fill ${warn ? 'team-bar-warn' : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={`team-bar-val ${warn ? 'team-bar-val-warn' : ''}`}>{val}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {member && (
        <div className="team-detail">
          <div className="team-detail-header">
            <div className="team-detail-avatar">{member.initials}</div>
            <div>
              <div className="team-detail-name">{member.name}</div>
              <div className="team-detail-role">{member.role}</div>
            </div>
            <button className="team-detail-close" onClick={() => setSelected(null)}>✕</button>
          </div>

          <div className="team-detail-body">
            <div className="team-detail-section-label">Performance</div>
            {METRICS.map(metric => {
              const val = member[metric.key]
              const pct = Math.min((val / metric.max) * 100, 100)
              const warn = metric.invert && val > 6
              return (
                <div key={metric.key} className="detail-metric-row">
                  <div className="detail-metric-top">
                    <span className="detail-metric-label">{metric.label}</span>
                    <span className={`detail-metric-val ${warn ? 'detail-metric-warn' : ''}`}>{val}</span>
                  </div>
                  <div className="detail-metric-track">
                    <div
                      className={`detail-metric-fill ${warn ? 'detail-metric-fill-warn' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}

            <div className="team-detail-section-label" style={{ marginTop: 20 }}>Pipeline</div>
            <div className="detail-big-stat">
              <div className="detail-big-val">€ {member.pipelineValue.toLocaleString('nl-BE')}</div>
              <div className="detail-big-label">Total pipeline value</div>
            </div>

            <div className="team-detail-section-label" style={{ marginTop: 20 }}>Week Focus</div>
            <div className="detail-note">
              {member.followUpsDue > 5
                ? `⚠ ${member.followUpsDue} follow-ups overdue — needs attention this week.`
                : `${member.followUpsDue} follow-ups due — on track.`}
            </div>
          </div>

          <div className="team-detail-footer">
            <button className="detail-action-btn detail-action-primary">Assign Client →</button>
          </div>
        </div>
      )}
    </div>
  )
}
