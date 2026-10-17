import { useContext } from 'react'
import { CrmContext } from '../context/CrmContext'

export function useCrm() {
  const ctx = useContext(CrmContext)
  if (!ctx) throw new Error('useCrm must be used inside <CrmProvider>')
  return ctx
}
