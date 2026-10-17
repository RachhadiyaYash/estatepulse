import { useState } from 'react'
import { Modal, ModalBody } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Field, FormRow, Input, Select, Textarea } from '../ui/Form'
import { useCrm } from '../../hooks/useCrm'

export default function AddProjectModal() {
  const { addProject, closeModal } = useCrm()
  const [form, setForm] = useState({
    name: '', location: '', type: 'Luxury Apartments', price: '', units: '', completion: '', description: '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    addProject(form)
    closeModal()
  }

  return (
    <Modal
      title="Register New Real Estate Development"
      onClose={closeModal}
      onSubmit={submit}
      footer={
        <>
          <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          <Button type="submit">Save Development</Button>
        </>
      }
    >
      <ModalBody>
        <Field label="Development Name *">
          <Input required value={form.name} onChange={set('name')} placeholder="e.g. Lumina Heights" />
        </Field>
        <FormRow>
          <Field label="Location / Address">
            <Input required value={form.location} onChange={set('location')} placeholder="e.g. Marina Boulevard" />
          </Field>
          <Field label="Property Classification">
            <Select value={form.type} onChange={set('type')}>
              <option value="Luxury Apartments">Luxury High-Rise Apartments</option>
              <option value="Waterfront Villas">Private Oceanfront Villas</option>
              <option value="Commercial Tower">Grade-A Office Suites</option>
              <option value="Boutique Townhouses">Boutique Townhouses</option>
            </Select>
          </Field>
        </FormRow>
        <FormRow>
          <Field label="Price Bracket">
            <Input required value={form.price} onChange={set('price')} placeholder="e.g. $1.2M - $4.0M" />
          </Field>
          <Field label="Total Units">
            <Input required type="number" min="1" value={form.units} onChange={set('units')} placeholder="80" />
          </Field>
        </FormRow>
        <Field label="Target Completion / Handover">
          <Input required value={form.completion} onChange={set('completion')} placeholder="e.g. Q4 2027" />
        </Field>
        <Field label="Project Overview Description">
          <Textarea
            rows={3}
            value={form.description}
            onChange={set('description')}
            placeholder="Describe architectural highlights, amenities, and USPs..."
          />
        </Field>
      </ModalBody>
    </Modal>
  )
}
