import { useState } from 'react'
import './AddClientPanel.css'

const BUSINESS_TYPES = [
  { id: 'sales', label: 'Sales · Broker', desc: 'Products, services, B2B deals', icon: '◈' },
  { id: 'contractor', label: 'Contractor', desc: 'Jobs, addresses, tasks on site', icon: '◻' },
  { id: 'ecom', label: 'E-Commerce', desc: 'Online store, orders, campaigns', icon: '◎' },
  { id: 'coach', label: 'Coach · Consultant', desc: 'Sessions, goals, progress', icon: '◉' },
  { id: 'other', label: 'Other', desc: 'Define your own fields', icon: '＋' },
]

const ADAPTIVE_FIELDS = {
  sales: [
    { key: 'company', label: 'Company Name', placeholder: 'Declercq BVBA', type: 'text' },
    { key: 'btw', label: 'BTW Number', placeholder: 'BE 0123.456.789', type: 'text' },
    { key: 'product', label: 'Product / Service Sold', placeholder: 'Energy contract · solar advisory', type: 'text' },
    { key: 'renewal', label: 'Contract Renewal Date', placeholder: '', type: 'date' },
  ],
  contractor: [
    { key: 'address', label: 'Job Address', placeholder: 'Kerkstraat 12, 9000 Gent', type: 'text' },
    { key: 'tasks', label: 'Tasks Still To Do', placeholder: 'Install flooring, paint ceiling...', type: 'textarea' },
    { key: 'potential', label: 'Potential Extra Services', placeholder: 'Bathroom renovation, insulation...', type: 'text' },
  ],
  ecom: [
    { key: 'email', label: 'Email Address', placeholder: 'client@example.com', type: 'email' },
    { key: 'social', label: 'Social Handle', placeholder: '@username', type: 'text' },
    { key: 'product', label: 'Product Purchased', placeholder: 'Running shoes — Nike Air Max', type: 'text' },
    { key: 'channel', label: 'Preferred Recontact Channel', placeholder: 'Email / Instagram / WhatsApp', type: 'text' },
  ],
  coach: [
    { key: 'goal', label: 'Client Goal', placeholder: 'Scale to €10k/month by Q3', type: 'text' },
    { key: 'sessions', label: 'Sessions Completed', placeholder: '0', type: 'number' },
    { key: 'next_session', label: 'Next Session Date', placeholder: '', type: 'date' },
    { key: 'referral', label: 'Referral Potential', placeholder: 'High / Medium / Low', type: 'text' },
  ],
  other: [],
}

function defaultRecontactDate() {
  const d = new Date()
  d.setDate(d.getDate() + 28)
  return d.toISOString().split('T')[0]
}

export default function AddClientPanel({ onClose, onAdd }) {
  const [step, setStep] = useState(1)
  const [businessType, setBusinessType] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', reason: '', hint: '', recontact: defaultRecontactDate() })
  const [customFields, setCustomFields] = useState([])
  const [newFieldLabel, setNewFieldLabel] = useState('')

  function handleTypeSelect(type) {
    setBusinessType(type)
    setStep(2)
  }

  function handleChange(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function addCustomField() {
    const label = newFieldLabel.trim()
    if (!label) return
    const key = `custom_${Date.now()}`
    setCustomFields(f => [...f, { key, label, value: '' }])
    setNewFieldLabel('')
  }

  function updateCustomField(key, value) {
    setCustomFields(f => f.map(cf => cf.key === key ? { ...cf, value } : cf))
  }

  function removeCustomField(key) {
    setCustomFields(f => f.filter(cf => cf.key !== key))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.phone) return
    const customData = {}
    customFields.forEach(cf => { customData[cf.key] = cf.value })
    onAdd({
      ...form,
      ...customData,
      id: Date.now(),
      initials: form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      hintType: 'followup',
      stage: 'Lead',
      businessType,
      customFields: businessType === 'other' ? customFields : [],
    })
    onClose()
  }

  const adaptiveFields = businessType ? ADAPTIVE_FIELDS[businessType] : []

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Add Client</div>
            <div className="panel-step">Step {step} of 2</div>
          </div>
          <button className="panel-close" onClick={onClose}>✕</button>
        </div>

        {step === 1 && (
          <div className="panel-body">
            <div className="panel-section-label">What type of business are you in?</div>
            <div className="type-grid">
              {BUSINESS_TYPES.map(type => (
                <button
                  key={type.id}
                  className={`type-card ${type.id === 'other' ? 'type-card-other' : ''}`}
                  onClick={() => handleTypeSelect(type.id)}
                >
                  <span className="type-icon">{type.icon}</span>
                  <span className="type-label">{type.label}</span>
                  <span className="type-desc">{type.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <form className="panel-body" onSubmit={handleSubmit}>
            <div className="panel-section-label">Core Info</div>

            <div className="field-group">
              <label className="field-label">Full Name *</label>
              <input
                className="field-input"
                type="text"
                placeholder="Thomas Declercq"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                autoFocus
              />
            </div>

            <div className="field-group">
              <label className="field-label">Phone Number *</label>
              <input
                className="field-input"
                type="tel"
                placeholder="+32 478 12 34 56"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Main Reason They Work With You</label>
              <input
                className="field-input"
                type="text"
                placeholder="Switched energy contract — cost reduction"
                value={form.reason}
                onChange={e => handleChange('reason', e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Recontact Hint</label>
              <input
                className="field-input"
                type="text"
                placeholder="Contract renews in 6 weeks"
                value={form.hint}
                onChange={e => handleChange('hint', e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">
                Recontact Date
                <span className="field-label-note">— default 4 weeks</span>
              </label>
              <input
                className="field-input"
                type="date"
                value={form.recontact}
                onChange={e => handleChange('recontact', e.target.value)}
              />
            </div>

            {adaptiveFields.length > 0 && (
              <>
                <div className="panel-divider" />
                <div className="panel-section-label">
                  {BUSINESS_TYPES.find(t => t.id === businessType)?.label} Details
                </div>
                {adaptiveFields.map(field => (
                  <div key={field.key} className="field-group">
                    <label className="field-label">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="field-input field-textarea"
                        placeholder={field.placeholder}
                        value={form[field.key] || ''}
                        onChange={e => handleChange(field.key, e.target.value)}
                      />
                    ) : (
                      <input
                        className="field-input"
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.key] || ''}
                        onChange={e => handleChange(field.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </>
            )}

            {businessType === 'other' && (
              <>
                <div className="panel-divider" />
                <div className="panel-section-label">Custom Fields</div>

                {customFields.map(cf => (
                  <div key={cf.key} className="field-group custom-field-row">
                    <label className="field-label">{cf.label}</label>
                    <div className="custom-input-wrap">
                      <input
                        className="field-input"
                        type="text"
                        placeholder={`Enter ${cf.label.toLowerCase()}...`}
                        value={cf.value}
                        onChange={e => updateCustomField(cf.key, e.target.value)}
                      />
                      <button
                        type="button"
                        className="remove-field-btn"
                        onClick={() => removeCustomField(cf.key)}
                      >✕</button>
                    </div>
                  </div>
                ))}

                <div className="add-field-row">
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Field name (e.g. Budget, Location, Notes...)"
                    value={newFieldLabel}
                    onChange={e => setNewFieldLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomField())}
                  />
                  <button
                    type="button"
                    className="add-field-btn"
                    onClick={addCustomField}
                  >+ Add Field</button>
                </div>
              </>
            )}

            <div className="panel-footer">
              <button type="button" className="btn-panel-back" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button type="submit" className="btn-panel-submit">
                Add Client →
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}
