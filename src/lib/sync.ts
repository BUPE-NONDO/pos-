import offline, { MutationRecord } from './offline'
import { supabase, isSupabaseConfigured } from './supabase'

export async function processMutation(m: MutationRecord): Promise<boolean> {
  try {
    if (m.table === 'app_settings' && m.action === 'upsert') {
      // attempt to upsert to Supabase
      if (!isSupabaseConfigured() || !supabase) {
        console.warn('Supabase not configured; skipping remote upsert')
        return false
      }

  type SettingsPayload = { install_id?: string; settings?: unknown; data?: unknown }
  const payload = m.payload as SettingsPayload
  const installId = payload?.install_id
  const data = payload?.settings || payload?.data || payload

      const { error } = await supabase.from('app_settings').upsert({ install_id: installId, data }, { onConflict: 'install_id' })
      if (error) {
        console.warn('supabase upsert error', error)
        return false
      }

      return true
    }

    if (m.table === 'sales_transactions' && m.action === 'insert') {
      if (!isSupabaseConfigured() || !supabase) {
        console.warn('Supabase not configured; skipping transaction insert')
        return false
      }

      const { error } = await supabase.from('sales_transactions').insert(m.payload)
      if (error) {
        console.warn('supabase transaction insert error', error)
        return false
      }

      return true
    }

    if (m.table === 'quotations' && m.action === 'insert') {
      if (!isSupabaseConfigured() || !supabase) {
        console.warn('Supabase not configured; skipping quotation insert')
        return false
      }

      const { error } = await supabase.from('quotations').insert(m.payload)
      if (error) {
        console.warn('supabase quotation insert error', error)
        return false
      }

      return true
    }

    return false
  } catch (err) {
    console.warn('processMutation error', err)
    return false
  }
}

export async function drain() {
  await offline.drainQueue(async (m: MutationRecord) => {
    const ok = await processMutation(m)
    return ok
  })
}

export default { processMutation, drain }
