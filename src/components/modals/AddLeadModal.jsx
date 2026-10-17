import { useState } from 'react'
import { Modal, ModalBody } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Field, FormRow, Input, Select } from '../ui/Form'
import { useCrm } from '../../hooks/useCrm'

export default function AddLeadModal() {
  const { projects, agents, addLead, closeModal } = useCrm()
  const [form, setForm] = useState({
    name: '', phone: '', email: '', budget: '',
    projectId: projects[0]?.id ?? '', agentId: agents[0].id,
    score: 'WARM', source: 'Google Ads',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    addLead(form)
    closeModal()
  }

  return (
    <Modal
      title="Add Inbound Prospective Lead"
      onClose={closeModal}
      onSubmit={submit}
      footer={
        <>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button type="submit">Create &amp; Assign Lead</Button>
        </>
      }
    >
      <ModalBody>
        <Field label="Client Full Name *">
          <Input required value={form.name} onChange={set('name')} placeholder="e.g. Jonathan Vance" />
        </Field>
        <FormRow>
          <Field label="Phone Number *">
            <Input required type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" />
          </Field>
          <Field label="Email Address">
            <Input type="email" value={form.email} onChange={set('email')} placeholder="client@company.com" />
          </Field>
        </FormRow>
        <FormRow>
          <Field label="Target Development / Project">
            <Select required value={form.projectId} onChange={set('projectId')}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.location})</option>
              ))}
            </Select>
          </Field>
          <Field label="Budget Range">
            <Input value={form.budget} onChange={set('budget')} placeholder="e.g. $1.5M - $2.5M" />
          </Field>
        </FormRow>
        <FormRow>
          <Field label="Intent Score">
            <Select value={form.score} onChange={set('score')}>
              <option value="HOT">Hot Lead (Ready to purchase &lt; 30 days)</option>
              <option value="WARM">Warm Lead (Exploring options)</option>
              <option value="COLD">Cold Lead (Long-term research)</option>
            </Select>
          </Field>
          <Field label="Lead Source">
            <Select value={form.source} onChange={set('source')}>
              <option value="Google Ads">Google Ads Campaign</option>
              <option value="Meta Ads">Meta / Instagram Ads</option>
              <option value="Direct Referral">Direct HNI Referral</option>
              <option value="Website Inbound">Website Form</option>
              <option value="Walk-in">Showroom Walk-in</option>
            </Select>
          </Field>
        </FormRow>
        <Field label="Assigned Broker / Agent">
          <Select value={form.agentId} onChange={set('agentId')}>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>
        </Field>
      </ModalBody>
    </Modal>
  )
}
