import { useState } from 'react'
import { Modal, ModalBody } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Field, FormRow, Input, Select, Textarea } from '../ui/Form'
import { useCrm } from '../../hooks/useCrm'
import { todayISO } from '../../utils/format'

export default function BookAppointmentModal() {
  const { leads, projects, modal, addAppointment, closeModal } = useCrm()
  const initialLead = modal.payload?.leadId ?? leads[0]?.id ?? ''
  const initialProject = leads.find((l) => l.id === initialLead)?.projectId ?? projects[0]?.id ?? ''

  const [form, setForm] = useState({
    leadId: initialLead,
    projectId: initialProject,
    date: todayISO(),
    time: '10:00 AM',
    type: 'VIP Show Villa Tour',
    pickup: false,
    notes: '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    addAppointment(form)
    closeModal()
  }

  return (
    <Modal
      title="Schedule Property Site Visit / Tour"
      onClose={closeModal}
      onSubmit={submit}
      footer={
        <>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button type="submit">Confirm Appointment</Button>
        </>
      }
    >
      <ModalBody>
        <Field label="Select Prospective Lead">
          <Select required value={form.leadId} onChange={set('leadId')}>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>{l.name} - {l.projectName} ({l.phone})</option>
            ))}
          </Select>
        </Field>
        <Field label="Development / Location">
          <Select required value={form.projectId} onChange={set('projectId')}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.location})</option>
            ))}
          </Select>
        </Field>
        <FormRow>
          <Field label="Tour Date">
            <Input required type="date" value={form.date} onChange={set('date')} />
          </Field>
          <Field label="Time Slot">
            <Select value={form.time} onChange={set('time')}>
              <option value="10:00 AM">10:00 AM (Morning Slot)</option>
              <option value="11:30 AM">11:30 AM</option>
              <option value="02:00 PM">02:00 PM (Afternoon)</option>
              <option value="03:30 PM">03:30 PM</option>
              <option value="05:00 PM">05:00 PM (Sunset Tour)</option>
            </Select>
          </Field>
        </FormRow>
        <Field label="Tour Type">
          <Select value={form.type} onChange={set('type')}>
            <option value="VIP Show Villa Tour">VIP Show Villa Tour</option>
            <option value="Site Construction Walkthrough">Site Construction Walkthrough</option>
            <option value="In-Office Contract Meeting">In-Office Contract Meeting</option>
            <option value="Virtual Video Consultation">Virtual Video Consultation</option>
          </Select>
        </Field>
        <Field>
          <label className="flex cursor-pointer items-center gap-2 text-[0.85rem]">
            <input
              type="checkbox"
              className="size-4 accent-accent"
              checked={form.pickup}
              onChange={(e) => setForm((f) => ({ ...f, pickup: e.target.checked }))}
            />
            <span>Request VIP Chauffeur Pickup for Client</span>
          </label>
        </Field>
        <Field label="Specific Client Interests & Instructions">
          <Textarea
            rows={2}
            value={form.notes}
            onChange={set('notes')}
            placeholder="e.g. Focus on high-floor 3BHK penthouse with sea views, prepare coffee & financial breakdown."
          />
        </Field>
      </ModalBody>
    </Modal>
  )
}
