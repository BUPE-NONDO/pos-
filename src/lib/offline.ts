import { openDB, IDBPDatabase } from 'idb'

export type MutationRecord = {
  id: string
  table: string
  action: 'upsert' | 'insert' | 'delete'
  payload: unknown
  timestamp: string
  synced?: boolean
}

const DB_NAME = 'taolo-offline-db'
const DB_VERSION = 1
const STORE_MUTATIONS = 'mutations'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(STORE_MUTATIONS)) {
          database.createObjectStore(STORE_MUTATIONS, { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

export async function enqueueMutation(m: MutationRecord) {
  const db = await getDb()
  const tx = db.transaction(STORE_MUTATIONS, 'readwrite')
  await tx.store.put(m)
  await tx.done
}

export async function getPendingMutations(): Promise<MutationRecord[]> {
  const db = await getDb()
  // return all mutations (filtering of synced happens elsewhere)
  return (await db.getAll(STORE_MUTATIONS)) as MutationRecord[]
}

export async function getPendingCount(): Promise<number> {
  const db = await getDb()
  const all = (await db.getAll(STORE_MUTATIONS)) as MutationRecord[]
  return all.filter((m) => !m.synced).length
}

export async function markSynced(id: string) {
  const db = await getDb()
  const record = await db.get(STORE_MUTATIONS, id) as MutationRecord | undefined
  if (record) {
    record.synced = true
    await db.put(STORE_MUTATIONS, record)
  }
}

export async function drainQueue(processor: (m: MutationRecord) => Promise<boolean>) {
  const db = await getDb()
  const tx = db.transaction(STORE_MUTATIONS, 'readwrite')
  const store = tx.objectStore(STORE_MUTATIONS)
  const all = (await store.getAll()) as MutationRecord[]

  for (const m of all) {
    if (m.synced) continue
    try {
      const ok = await processor(m)
      if (ok) {
        m.synced = true
        await store.put(m)
      }
    } catch (error) {
      console.warn('drainQueue: processor error', error)
      // Stop processing on first failure to avoid busy loop
      break
    }
  }

  await tx.done
}

export default {
  enqueueMutation,
  getPendingMutations,
  getPendingCount,
  markSynced,
  drainQueue,
}
