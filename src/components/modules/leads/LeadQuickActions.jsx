import { CardAction } from '../../ui/Button'
import { useToast } from '../../../store/useToast'

const LeadQuickActions = ({ lead, schedule = true, onBookVisit }) => {
  const { toast } = useToast()
  const stop = (fn) => (e) => {
    e.stopPropagation()
    fn()
  }
  return (
    <div className="flex gap-1">
      <CardAction
        title="Call"
        onClick={stop(() => toast(`Initiating VOIP call to ${lead.name} (${lead.phone})...`, 'info'))}
      >
        <i className="fas fa-phone" />
      </CardAction>
      <CardAction
        title="WhatsApp"
        onClick={stop(() => toast(`Opening WhatsApp chat thread for ${lead.name}...`, 'success'))}
      >
        <i className="fab fa-whatsapp" />
      </CardAction>
      {schedule && (
        <CardAction title="Book Visit" onClick={stop(() => onBookVisit?.(lead.id))}>
          <i className="fas fa-calendar-plus" />
        </CardAction>
      )}
    </div>
  )
}
export default LeadQuickActions