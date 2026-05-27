import { useState } from 'react'
import './Settings.css'

const TABS = [
  { id: 'branding', label: 'Branding' },
  { id: 'profile', label: 'Profile' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'plan', label: 'Plan' },
]

export default function Settings({ settings, onSave }) {
  const [tab, setTab] = useState('branding')
  const [form, setForm] = useState(settings)
  const [saved, setSaved] = useState(false)

  function set(key, value) {
    setForm(f => ({ ...f, [key]: value }))
    setSaved(false)
  }

  function handleSave() {
    onSave(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="settings-page">
      <div className="settings-sidebar">
        <div className="settings-sidebar-title">Settings</div>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`settings-tab ${tab === t.id ? 'settings-tab-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {tab === 'branding' && (
          <BrandingTab form={form} set={set} />
        )}
        {tab === 'profile' && (
          <ProfileTab form={form} set={set} />
        )}
        {tab === 'preferences' && (
          <PreferencesTab form={form} set={set} />
        )}
        {tab === 'plan' && (
          <PlanTab />
        )}

        {tab !== 'plan' && (
          <div className="settings-footer">
            <button className="settings-save-btn" onClick={handleSave}>
              {saved ? '✓ Saved' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const MERIDIAN_DEFAULTS = {
  brandName: 'Meridian',
  brandTagline: 'Client Platform',
  logoLetter: 'M',
  companyName: '',
  website: '',
}

function BrandingTab({ form, set }) {
  const isCustom = form.brandingMode === 'custom'

  function setBrandingMode(mode) {
    set('brandingMode', mode)
    if (mode === 'meridian') {
      set('brandName', MERIDIAN_DEFAULTS.brandName)
      set('brandTagline', MERIDIAN_DEFAULTS.brandTagline)
      set('logoLetter', MERIDIAN_DEFAULTS.logoLetter)
    }
  }

  const previewName = form.brandName || 'Meridian'
  const previewTagline = form.brandTagline || 'Client Platform'
  const previewLetter = form.logoLetter || 'M'

  return (
    <div className="settings-section">
      <div className="settings-section-title">Branding</div>
      <div className="settings-section-desc">Use the Meridian brand or replace it with your own.</div>

      {/* Mode picker */}
      <div className="branding-mode-row">
        <button
          className={`branding-mode-card ${!isCustom ? 'branding-mode-active' : ''}`}
          onClick={() => setBrandingMode('meridian')}
        >
          <div className="branding-mode-preview">
            <div className="bm-logo-h">M</div>
            <div className="bm-logo-text">
              <div className="bm-logo-name">Meridian</div>
              <div className="bm-logo-sub">Client Platform</div>
            </div>
          </div>
          <div className="branding-mode-label">Keep Meridian</div>
          <div className="branding-mode-desc">Use the default Meridian brand — clean and ready to go.</div>
          {!isCustom && <div className="branding-mode-check">◆ Active</div>}
        </button>

        <button
          className={`branding-mode-card ${isCustom ? 'branding-mode-active' : ''}`}
          onClick={() => setBrandingMode('custom')}
        >
          <div className="branding-mode-preview">
            <div className="bm-logo-h bm-logo-custom">{previewLetter}</div>
            <div className="bm-logo-text">
              <div className="bm-logo-name">{isCustom ? previewName : 'Your Brand'}</div>
              <div className="bm-logo-sub">{isCustom ? previewTagline : 'Your Tagline'}</div>
            </div>
          </div>
          <div className="branding-mode-label">Custom Branding</div>
          <div className="branding-mode-desc">Replace with your own name, tagline, and logo letter.</div>
          {isCustom && <div className="branding-mode-check">◆ Active</div>}
        </button>
      </div>

      {/* Live preview */}
      <div className="brand-preview">
        <div className="brand-preview-label">Live Preview</div>
        <div className="brand-preview-card">
          <div className="preview-logo">
            <div className="preview-logo-h">{previewLetter}</div>
            <div className="preview-logo-text">
              <div className="preview-logo-name">{previewName}</div>
              <div className="preview-logo-sub">{previewTagline}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom fields — only shown in custom mode */}
      <div className={`settings-fields ${!isCustom ? 'settings-fields-disabled' : ''}`}>
        <SettingsField label="Brand Name" desc="Displayed in the sidebar and app header">
          <input
            className="settings-input"
            value={form.brandName || ''}
            onChange={e => set('brandName', e.target.value)}
            placeholder="Your brand name"
            maxLength={20}
            disabled={!isCustom}
          />
        </SettingsField>

        <SettingsField label="Tagline" desc="Short descriptor below your brand name">
          <input
            className="settings-input"
            value={form.brandTagline || ''}
            onChange={e => set('brandTagline', e.target.value)}
            placeholder="e.g. Sales Platform"
            maxLength={30}
            disabled={!isCustom}
          />
        </SettingsField>

        <SettingsField label="Logo Letter" desc="Single character shown in the logo mark">
          <input
            className="settings-input settings-input-sm"
            value={form.logoLetter || ''}
            onChange={e => set('logoLetter', e.target.value.slice(-1).toUpperCase())}
            placeholder="M"
            maxLength={1}
            disabled={!isCustom}
          />
        </SettingsField>

        <SettingsField label="Company Name" desc="Your full company name (shown in exports and reports)">
          <input
            className="settings-input"
            value={form.companyName || ''}
            onChange={e => set('companyName', e.target.value)}
            placeholder="e.g. Hanssens Group"
            disabled={!isCustom}
          />
        </SettingsField>

        <SettingsField label="Website" desc="Your company website">
          <input
            className="settings-input"
            value={form.website || ''}
            onChange={e => set('website', e.target.value)}
            placeholder="e.g. hanssensgroup.be"
            disabled={!isCustom}
          />
        </SettingsField>
      </div>
    </div>
  )
}

function ProfileTab({ form, set }) {
  return (
    <div className="settings-section">
      <div className="settings-section-title">Profile</div>
      <div className="settings-section-desc">Your personal details shown across Meridian.</div>

      <div className="profile-avatar-row">
        <div className="profile-avatar-big">
          {(form.firstName || 'H').slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div className="profile-avatar-name">{form.firstName || 'Hanssens'}</div>
          <div className="profile-avatar-role">{form.role || 'Leader'}</div>
        </div>
      </div>

      <div className="settings-fields">
        <SettingsField label="First Name">
          <input
            className="settings-input"
            value={form.firstName || ''}
            onChange={e => set('firstName', e.target.value)}
            placeholder="Hanssens"
          />
        </SettingsField>

        <SettingsField label="Role" desc="How you appear to your team">
          <select className="settings-select" value={form.role || 'Leader'} onChange={e => set('role', e.target.value)}>
            <option value="Leader">Leader</option>
            <option value="Sales Rep">Sales Rep</option>
            <option value="Broker">Broker</option>
            <option value="Manager">Manager</option>
            <option value="Owner">Owner</option>
          </select>
        </SettingsField>

        <SettingsField label="Phone">
          <input
            className="settings-input"
            value={form.phone || ''}
            onChange={e => set('phone', e.target.value)}
            placeholder="+32 478 ..."
          />
        </SettingsField>

        <SettingsField label="Email">
          <input
            className="settings-input"
            type="email"
            value={form.email || ''}
            onChange={e => set('email', e.target.value)}
            placeholder="you@hanssensgroup.be"
          />
        </SettingsField>
      </div>
    </div>
  )
}

function PreferencesTab({ form, set }) {
  return (
    <div className="settings-section">
      <div className="settings-section-title">Preferences</div>
      <div className="settings-section-desc">Control how Meridian behaves for you.</div>

      <div className="settings-fields">
        <SettingsField
          label="Default Recontact Period"
          desc="How many weeks until Meridian reminds you to contact a new client"
        >
          <div className="weeks-selector">
            {[1, 2, 3, 4, 6, 8].map(w => (
              <button
                key={w}
                className={`weeks-btn ${(form.recontactWeeks || 4) === w ? 'weeks-btn-active' : ''}`}
                onClick={() => set('recontactWeeks', w)}
              >
                {w}w
              </button>
            ))}
          </div>
        </SettingsField>

        <SettingsField
          label="Language"
          desc="Interface language"
        >
          <select className="settings-select" value={form.language || 'nl'} onChange={e => set('language', e.target.value)}>
            <option value="nl">Nederlands</option>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </SettingsField>

        <SettingsField
          label="Default Business Type"
          desc="Pre-selects this type when adding a new client"
        >
          <select className="settings-select" value={form.defaultBusinessType || 'sales'} onChange={e => set('defaultBusinessType', e.target.value)}>
            <option value="sales">Sales · Broker</option>
            <option value="contractor">Contractor</option>
            <option value="ecom">E-Commerce</option>
            <option value="coach">Coach · Consultant</option>
            <option value="other">Other</option>
          </select>
        </SettingsField>

        <SettingsField
          label="Campaign Week"
          desc="Default campaign shown on your dashboard"
        >
          <select className="settings-select" value={form.defaultCampaign || 'reference'} onChange={e => set('defaultCampaign', e.target.value)}>
            <option value="reference">Reference Week</option>
            <option value="launch">Product Launch</option>
            <option value="revenue">Revenue Week</option>
            <option value="reactivation">Reactivation</option>
          </select>
        </SettingsField>
      </div>
    </div>
  )
}

function PlanTab() {
  return (
    <div className="settings-section">
      <div className="settings-section-title">Plan</div>
      <div className="settings-section-desc">Your current Meridian plan and usage.</div>

      <div className="plan-card plan-free">
        <div className="plan-card-top">
          <div className="plan-badge">Free</div>
          <div className="plan-name">Meridian Free</div>
          <div className="plan-price">€ 0 / month</div>
        </div>
        <div className="plan-features">
          <PlanFeature active label="Unlimited client cards" />
          <PlanFeature active label="Pipeline view" />
          <PlanFeature active label="Campaign weeks" />
          <PlanFeature active label="Team view (up to 3 members)" />
          <PlanFeature active label="Referral tracking" />
          <PlanFeature label="Smart reminders & follow-up alerts" />
          <PlanFeature label="Email / message sending" />
          <PlanFeature label="Advanced filters & reporting" />
          <PlanFeature label="Unlimited team members" />
          <PlanFeature label="Priority support" />
        </div>
      </div>

      <div className="plan-card plan-pro">
        <div className="plan-card-top">
          <div className="plan-badge plan-badge-pro">Pro</div>
          <div className="plan-name">Meridian Pro</div>
          <div className="plan-price">€ 14 / month</div>
        </div>
        <div className="plan-upgrade-desc">
          Everything in Free, plus smart reminders, bulk messaging, advanced reporting, and unlimited team members.
        </div>
        <button className="plan-upgrade-btn">Upgrade to Pro →</button>
      </div>
    </div>
  )
}

function PlanFeature({ label, active }) {
  return (
    <div className="plan-feature">
      <span className={`plan-feature-icon ${active ? 'plan-feature-on' : 'plan-feature-off'}`}>
        {active ? '◆' : '◇'}
      </span>
      <span className={active ? 'plan-feature-label' : 'plan-feature-label plan-feature-muted'}>{label}</span>
    </div>
  )
}

function SettingsField({ label, desc, children }) {
  return (
    <div className="settings-field">
      <div className="settings-field-meta">
        <div className="settings-field-label">{label}</div>
        {desc && <div className="settings-field-desc">{desc}</div>}
      </div>
      <div className="settings-field-control">{children}</div>
    </div>
  )
}
