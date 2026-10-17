import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="num text-[4rem] font-medium text-brand-text">404</div>
      <h2 className="text-[1.4rem] font-extrabold tracking-[-0.03em] text-on-surface">Page not found</h2>
      <p className="text-[0.85rem] text-on-surface-muted">The page you’re looking for doesn’t exist or was moved.</p>
      <Link to="/"><Button><i className="fas fa-arrow-left" /> Back to dashboard</Button></Link>
    </div>
  )
}
