import { NavLink, useNavigate } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { useCrmStore } from '../../store/crmStore'
import { useUserStore } from '../../store/useUserStore'
import { useAuth } from '../../store/useAuth'
import { initials } from '../../utils/format'
import { NAV } from './navItems'

export default function Sidebar({ open, onClose }) {
  const { isAgent, visibleLeads, visibleAppointments } = useCrmStore()
  const { logout } = useAuth()
  const name = useUserStore((s) => s.name)
  const role = useUserStore((s) => s.role)
  const navigate = useNavigate()

  const roleLabel = role === 'admin' ? 'Administrator' : 'Agent'

  const badges = {
    leads: visibleLeads.length,
    visits: visibleAppointments.filter((a) => a.status === 'Scheduled').length,
  }

  const signOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-99 bg-(--overlay) lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-100 flex w-66 flex-col border-r border-outline-subtle bg-surface-card transition-transform duration-250 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center gap-[0.7rem] border-b border-outline-subtle px-[1.4rem] py-3">
          <div className="flex size-9.5 shrink-0 items-center justify-center rounded-[11px] bg-brand text-[1.05rem] text-on-brand">
            <i className="fas fa-city" />
          </div>
          <div>
            <h1 className="text-[1.05rem] leading-[1.15] font-extrabold tracking-[-0.04em] text-on-surface">EstatePulse</h1>
            <span className="kicker text-[0.6rem] text-on-surface-muted">CRM Intelligence</span>
          </div>
        </div>

       

        <nav className="flex-1 overflow-y-auto px-4 py-3">
          {NAV.map((group) => (
            <ul key={group.section} className="mb-2">
              <li className="kicker px-[0.85rem] pt-3 pb-2 text-[0.62rem] text-on-surface-faint">{group.section}</li>
              {group.items
                .filter((i) => !(i.adminOnly && isAgent))
                .map((item) => (
                  <li key={item.to} className="mb-[0.2rem]">
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-md border border-transparent px-[0.85rem] py-[0.65rem] text-[0.86rem] transition duration-200 ${
                          isActive
                            ? 'bg-accent/10 font-extrabold text-accent'
                            : 'font-semibold text-on-surface-variant hover:bg-surface-dim hover:text-on-surface'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <i
                            className={`fas ${item.icon} w-5 text-center text-base transition duration-200 ${
                              isActive ? 'text-accent' : 'text-on-surface-muted group-hover:text-accent'
                            }`}
                          />
                          <span>{item.label}</span>
                          {item.badge && (
                            <span
                              className={`num ml-auto rounded-full px-2 py-[0.1rem] text-[0.68rem] font-medium ${
                                isActive ? 'bg-accent text-on-accent' : 'bg-surface-high text-on-surface-variant'
                              }`}
                            >
                              {badges[item.badge]}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
            </ul>
          ))}
        </nav>

        <div className="border-t border-outline-subtle p-4">
          <div className="flex items-center gap-3">
            <Avatar className="bg-brand-deep text-white">{initials(name)}</Avatar>
            <div className="min-w-0">
              <div className="truncate text-[0.8rem] font-bold text-on-surface">{name}</div>
              <div className="truncate text-[0.68rem] text-on-surface-muted">{roleLabel}</div>
            </div>
          </div>
          <div className="mt-[0.85rem] flex gap-2">
           
            <Button variant="secondary" size="sm" className="h-8.5 flex-1 text-[0.72rem]" onClick={signOut}>
              <i className="fas fa-right-from-bracket" /> Sign out
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
