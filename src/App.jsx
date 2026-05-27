import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabase'
import AddClientPanel from './AddClientPanel'
import Pipeline from './Pipeline'
import Agenda from './Agenda'
import Clients from './Clients'
import TeamView from './TeamView'
import Leaderboard from './Leaderboard'
import ClientDetail from './ClientDetail'
import Settings from './Settings'

const today = new Date()
const daysFromNow = n => {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

const clients = [
  {
    id: 1,
    name: 'Thomas Declercq',
    company: 'Declercq BVBA',
    phone: '+32 478 12 34 56',
    reason: 'Switched energy contract — cost reduction',
    hint: 'Contract renews in 6 weeks',
    hintType: 'urgent',
    initials: 'TD',
    stage: 'Proposal',
    recontact: daysFromNow(-2),
  },
  {
    id: 2,
    name: 'Sophie Martens',
    company: 'SM Interiors',
    phone: '+32 496 55 78 22',
    reason: 'Solar panel advisory — new build project',
    hint: 'Mentioned expansion in spring',
    hintType: 'followup',
    initials: 'SM',
    stage: 'Closed',
    recontact: daysFromNow(1),
  },
  {
    id: 3,
    name: 'Kevin Van Acker',
    company: 'Van Acker & Zonen',
    phone: '+32 471 88 44 11',
    reason: 'Sales process optimization',
    hint: 'No contact in 45 days',
    hintType: 'cold',
    initials: 'KV',
    stage: 'Lead',
    recontact: daysFromNow(-7),
  },
  {
    id: 4,
    name: 'Nathalie Goossens',
    company: 'NG Consulting',
    phone: '+32 485 33 67 90',
    reason: 'Team sales training program',
    hint: 'Follow up after proposal sent',
    hintType: 'followup',
    initials: 'NG',
    stage: 'Proposal',
    recontact: daysFromNow(3),
  },
  {
    id: 5,
    name: 'Raf Pieters',
    company: 'Pieters Technics',
    phone: '+32 499 21 54 87',
    reason: 'Energy audit — production facility',
    hint: 'Ready for reference ask',
    hintType: 'urgent',
    initials: 'RP',
    stage: 'Contact',
    recontact: daysFromNow(0),
  },
]

const stages = [
  { name: 'Lead', count: 8, value: '€ 24.000', pct: 40, color: '#444' },
  { name: 'Contact', count: 5, value: '€ 18.500', pct: 30, color: '#666' },
  { name: 'Proposal', count: 3, value: '€ 31.200', pct: 55, color: '#888' },
  { name: 'Closed', count: 12, value: '€ 86.400', pct: 100, color: '#fff' },
]

const navItems = [
  { icon: '⬛', label: 'Dashboard', id: 'dashboard' },
  { icon: '◻', label: 'Clients', id: 'clients' },
  { icon: '◈', label: 'Pipeline', id: 'pipeline' },
  { icon: '◷', label: 'Agenda', id: 'agenda' },
]

const teamNav = [
  { icon: '◉', label: 'Team View', id: 'team' },
  { icon: '◎', label: 'Leaderboard', id: 'leaderboard' },
]

const bottomNav = [
  { icon: '◧', label: 'Settings', id: 'settings' },
]

export default function App({ session }) {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [showAddClient, setShowAddClient] = useState(false)
  const [clientList, setClientList] = useState(clients)
  const [dbLoading, setDbLoading] = useState(true)

  // Load clients from Supabase on mount
  useEffect(() => {
    if (!session) return
    supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setClientList(data.map(c => ({
            ...c,
            hintType: c.hint_type || 'followup',
            referredBy: c.referred_by,
            businessType: c.business_type,
          })))
        }
        setDbLoading(false)
      })
  }, [session])
  const [activeCampaign, setActiveCampaign] = useState('reference')
  const [appSettings, setAppSettings] = useState({
    brandingMode: 'meridian',
    brandName: 'Meridian',
    brandTagline: 'Client Platform',
    logoLetter: 'M',
    companyName: 'Hanssens Group',
    website: 'hanssensgroup.be',
    firstName: 'Hanssens',
    role: 'Leader',
    recontactWeeks: 4,
    language: 'nl',
    defaultBusinessType: 'sales',
    defaultCampaign: 'reference',
  })
  const [selectedClientId, setSelectedClientId] = useState(null)

  async function handleUpdateClient(id, updates) {
    setClientList(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    await supabase.from('clients').update(updates).eq('id', id)
  }

  async function handleAddClient(newClient) {
    const { data, error } = await supabase
      .from('clients')
      .insert([{
        user_id: session.user.id,
        name: newClient.name,
        phone: newClient.phone,
        company: newClient.company || null,
        reason: newClient.reason || null,
        hint: newClient.hint || null,
        stage: newClient.stage || 'Lead',
        recontact: newClient.recontact || null,
        initials: newClient.initials,
        hint_type: newClient.hintType || 'followup',
        business_type: newClient.businessType || null,
        btw: newClient.btw || null,
        email: newClient.email || null,
        address: newClient.address || null,
        tasks: newClient.tasks || null,
        goal: newClient.goal || null,
        social: newClient.social || null,
        product: newClient.product || null,
      }])
      .select()
      .single()

    if (!error && data) {
      setClientList(prev => [{ ...data, hintType: data.hint_type }, ...prev])
    }
  }

  async function handleUpdateStage(id, stage) {
    setClientList(prev => prev.map(c => c.id === id ? { ...c, stage } : c))
    await supabase.from('clients').update({ stage }).eq('id', id)
  }

  function handleAddReferral({ name, phone, referredBy }) {
    const referrer = clientList.find(c => c.id === referredBy)
    setClientList(prev => [{
      id: Date.now(),
      name,
      phone,
      initials: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      stage: 'Lead',
      hintType: 'followup',
      hint: `Referred by ${referrer?.name || 'client'}`,
      reason: `Referred by ${referrer?.name || 'client'}`,
      recontact: (() => { const d = new Date(); d.setDate(d.getDate() + 28); return d.toISOString().split('T')[0] })(),
      referredBy,
    }, ...prev])
  }

  const todayStr = new Date().toISOString().split('T')[0]

  function recontactStatus(dateStr) {
    if (!dateStr) return null
    const diff = Math.round((new Date(dateStr) - new Date(todayStr)) / 86400000)
    if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, type: 'overdue' }
    if (diff === 0) return { label: 'Today', type: 'today' }
    if (diff <= 7) return { label: `In ${diff}d`, type: 'soon' }
    return null
  }

  const dueClients = clientList
    .filter(c => recontactStatus(c.recontact))
    .sort((a, b) => new Date(a.recontact) - new Date(b.recontact))

  return (
    <div className="app">
      {showAddClient && (
        <AddClientPanel
          onClose={() => setShowAddClient(false)}
          onAdd={handleAddClient}
        />
      )}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-h">{appSettings.logoLetter || 'M'}</div>
            <span className="logo-name">{appSettings.brandName || 'Meridian'}</span>
          </div>
          <div className="logo-sub">{appSettings.brandTagline || 'Client Platform'}</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">Workspace</div>
            {navItems.map(item => (
              <div
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          <div className="nav-section">
            <div className="nav-label">Leadership</div>
            {teamNav.map(item => (
              <div
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          {bottomNav.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              style={{ marginBottom: 8 }}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
          <div className="user-pill">
            <div className="user-avatar">{(appSettings.firstName || session?.user?.email?.[0] || 'H').toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{appSettings.firstName || session?.user?.email?.split('@')[0] || 'User'}</div>
              <div className="user-role" style={{ cursor: 'pointer' }} onClick={() => supabase.auth.signOut()}>Sign out</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <h1>Good morning, Hanssens.</h1>
            <p>Monday, 26 May 2026 · Week 22</p>
          </div>
          <div className="topbar-right">
            <button className="btn btn-ghost">Filter</button>
            <button className="btn btn-primary" onClick={() => setShowAddClient(true)}>+ Add Client</button>
          </div>
        </div>

        {selectedClientId && (() => {
          const c = clientList.find(x => x.id === selectedClientId)
          return c ? (
            <ClientDetail
              client={c}
              clients={clientList}
              onBack={() => setSelectedClientId(null)}
              onUpdateStage={handleUpdateStage}
              onUpdateClient={handleUpdateClient}
            />
          ) : null
        })()}

        {!selectedClientId && activeNav === 'pipeline' && (
          <Pipeline clients={clientList} onUpdateStage={handleUpdateStage} onAddReferral={handleAddReferral} />
        )}

        {!selectedClientId && activeNav === 'agenda' && (
          <Agenda clients={clientList} activeCampaign={activeCampaign} onSetCampaign={setActiveCampaign} />
        )}

        {!selectedClientId && activeNav === 'clients' && (
          <Clients clients={clientList} onAddClient={() => setShowAddClient(true)} onSelectClient={setSelectedClientId} />
        )}

        {!selectedClientId && activeNav === 'team' && <TeamView />}
        {!selectedClientId && activeNav === 'leaderboard' && <Leaderboard />}
        {!selectedClientId && activeNav === 'settings' && (
          <Settings settings={appSettings} onSave={setAppSettings} />
        )}

        {!selectedClientId && activeNav !== 'pipeline' && activeNav !== 'agenda' && <div className="content">
          {(() => {
            const CAMPAIGN_META = {
              reference: { title: 'Reference Week', desc: 'Ask your best clients for a testimonial.' },
              launch:    { title: 'Product Launch', desc: 'Inform every active client about what\'s new.' },
              revenue:   { title: 'Revenue Week', desc: 'Follow up on open proposals and close deals.' },
              reactivation: { title: 'Reactivation', desc: 'Wake up cold contacts before they go cold for good.' },
            }
            const meta = CAMPAIGN_META[activeCampaign] || CAMPAIGN_META.reference
            const count = clientList.filter(c =>
              activeCampaign === 'reference' ? c.stage === 'Closed' :
              activeCampaign === 'launch' ? ['Lead','Contact','Proposal'].includes(c.stage) :
              activeCampaign === 'revenue' ? c.stage === 'Proposal' :
              (() => { const diff = Math.round((new Date(new Date().toISOString().split('T')[0]) - new Date(c.recontact || '9999')) / 86400000); return diff >= 0 })()
            ).length
            return (
              <div className="campaign-banner" style={{ cursor: 'pointer' }} onClick={() => setActiveNav('agenda')}>
                <div className="campaign-left">
                  <div>
                    <div className="campaign-week">This week's focus · click to manage</div>
                    <div className="campaign-title">{meta.title}</div>
                    <div className="campaign-desc">{meta.desc}</div>
                  </div>
                </div>
                <div className="campaign-badge">{count} client{count !== 1 ? 's' : ''} to contact</div>
              </div>
            )
          })()}


          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Total Clients</div>
              <div className="stat-value">28</div>
              <div className="stat-change up">+3 this month</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Open Deals</div>
              <div className="stat-value">16</div>
              <div className="stat-change">€ 73.700 pipeline</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Follow-ups Due</div>
              <div className="stat-value">7</div>
              <div className="stat-change down">2 overdue</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Closed This Month</div>
              <div className="stat-value">€ 12.400</div>
              <div className="stat-change up">+18% vs last month</div>
            </div>
          </div>

          {dueClients.length > 0 && (
            <div className="section" style={{ marginBottom: '20px' }}>
              <div className="section-header">
                <span className="section-title">Due for Recontact</span>
                <span className="section-action">{dueClients.length} client{dueClients.length > 1 ? 's' : ''}</span>
              </div>
              <div className="recontact-row">
                {dueClients.map(client => {
                  const status = recontactStatus(client.recontact)
                  return (
                    <div key={client.id} className="recontact-card">
                      <div className="recontact-card-top">
                        <div className="client-avatar" style={{ width: 28, height: 28, fontSize: 10 }}>{client.initials}</div>
                        <span className={`recontact-badge ${status.type}`}>{status.label}</span>
                      </div>
                      <div className="recontact-name">{client.name}</div>
                      <div className="recontact-reason">{client.reason}</div>
                      <div className="recontact-phone">{client.phone}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="two-col">
            <div>
              <div className="section">
                <div className="section-header">
                  <span className="section-title">Clients · Recontact Priority</span>
                  <span className="section-action">View all →</span>
                </div>
                <div className="client-list">
                  {clientList.map(client => (
                    <div key={client.id} className="client-row">
                      <div className="client-avatar">{client.initials}</div>
                      <div className="client-info">
                        <div className="client-name">{client.name} <span style={{ color: 'var(--text-dim)', fontWeight: 400, fontSize: '11px' }}>· {client.company}</span></div>
                        <div className="client-reason">{client.reason}</div>
                      </div>
                      <div className="client-meta">
                        <span className="client-phone">{client.phone}</span>
                        <span className={`hint-tag ${client.hintType}`}>{client.hint}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="section">
                <div className="section-header">
                  <span className="section-title">Pipeline</span>
                  <span className="section-action">Details →</span>
                </div>
                <div className="pipeline-list">
                  {stages.map(stage => (
                    <div key={stage.name} className="pipeline-stage">
                      <div className="stage-left">
                        <div className="stage-dot" style={{ background: stage.color }} />
                        <div>
                          <div className="stage-name">{stage.name}</div>
                          <div className="stage-count">{stage.count} clients</div>
                        </div>
                      </div>
                      <div className="stage-bar-wrap">
                        <div className="stage-bar" style={{ width: `${stage.pct}%`, background: stage.color }} />
                      </div>
                      <div className="stage-value">{stage.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section">
                <div className="section-header">
                  <span className="section-title">Week Agenda</span>
                </div>
                <div className="agenda-list">
                  <div className="agenda-item">
                    <div className="agenda-dot done" />
                    <div>
                      <div className="agenda-text">Call Thomas Declercq</div>
                      <div className="agenda-sub">Contract renewal · Mon</div>
                    </div>
                  </div>
                  <div className="agenda-item">
                    <div className="agenda-dot active" />
                    <div>
                      <div className="agenda-text">Send proposal — NG Consulting</div>
                      <div className="agenda-sub">Team training program · Today</div>
                    </div>
                  </div>
                  <div className="agenda-item">
                    <div className="agenda-dot pending" />
                    <div>
                      <div className="agenda-text">Reference ask — 5 clients</div>
                      <div className="agenda-sub">Reference Week campaign · This week</div>
                    </div>
                  </div>
                  <div className="agenda-item">
                    <div className="agenda-dot pending" />
                    <div>
                      <div className="agenda-text">Reactivate cold contacts</div>
                      <div className="agenda-sub">3 clients · No contact 45+ days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>}
      </main>

      <nav className="mobile-nav">
        {[
          { icon: '⬛', label: 'Home', id: 'dashboard' },
          { icon: '◻', label: 'Clients', id: 'clients' },
          { icon: '◈', label: 'Pipeline', id: 'pipeline' },
          { icon: '◷', label: 'Agenda', id: 'agenda' },
          { icon: '◧', label: 'Settings', id: 'settings' },
        ].map(item => (
          <div
            key={item.id}
            className={`mobile-nav-item ${activeNav === item.id ? 'active' : ''}`}
            onClick={() => { setActiveNav(item.id); setSelectedClientId(null) }}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  )
}
