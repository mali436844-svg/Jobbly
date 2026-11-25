import fs from 'fs'
import path from 'path'

const MOCK_DB_PATH = path.join(process.cwd(), 'src/lib/supabase/mock-db.json')

export interface MockDbSchema {
  profiles: any[]
  clients: any[]
  jobs: any[]
  quotes: any[]
  quote_items: any[]
  invoices: any[]
  invoice_items: any[]
  payments: any[]
}

const DEFAULT_DB: MockDbSchema = {
  profiles: [
    {
      id: "demo-user-id",
      email: "admin@jobbly.com",
      business_name: "Jobbly Demo Contractor",
      business_address: "123 Main St",
      business_city: "Austin",
      business_state: "TX",
      business_zip: "78701",
      business_phone: "512-555-0199",
      business_email: "billing@jobblydemo.com",
      default_tax_rate: 8.25,
      default_payment_terms: "Net 30",
      subscription_plan: "free",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  clients: [],
  jobs: [],
  quotes: [],
  quote_items: [],
  invoices: [],
  invoice_items: [],
  payments: []
}

function readDb(): MockDbSchema {
  try {
    if (!fs.existsSync(MOCK_DB_PATH)) {
      fs.mkdirSync(path.dirname(MOCK_DB_PATH), { recursive: true })
      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(DEFAULT_DB, null, 2))
      return DEFAULT_DB
    }
    const content = fs.readFileSync(MOCK_DB_PATH, 'utf-8')
    return JSON.parse(content)
  } catch (err) {
    console.error('Error reading mock db, returning defaults:', err)
    return DEFAULT_DB
  }
}

function writeDb(db: MockDbSchema) {
  try {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(db, null, 2))
  } catch (err) {
    console.error('Error writing mock db:', err)
  }
}

function generateId() {
  return 'mock-uuid-' + Math.random().toString(36).substring(2, 15)
}

export async function getMockData(
  table: string,
  filters: any[],
  orderField: string | null,
  orderAsc: boolean,
  limitCount: number | null
) {
  const db = readDb()
  const rows = db[table as keyof MockDbSchema] || []
  
  let filtered = rows.filter((row: any) => {
    for (const f of filters) {
      const val = row[f.column]
      if (f.type === 'eq' && val !== f.value) return false
      if (f.type === 'neq' && val === f.value) return false
      if (f.type === 'gte' && (val === null || val === undefined || val < f.value)) return false
      if (f.type === 'lte' && (val === null || val === undefined || val > f.value)) return false
      if (f.type === 'gt' && (val === null || val === undefined || val <= f.value)) return false
      if (f.type === 'lt' && (val === null || val === undefined || val >= f.value)) return false
      if (f.type === 'in' && (!Array.isArray(f.value) || !f.value.includes(val))) return false
    }
    return true
  })

  if (orderField) {
    filtered.sort((a: any, b: any) => {
      const valA = a[orderField]
      const valB = b[orderField]
      if (valA === valB) return 0
      if (valA === null || valA === undefined) return 1
      if (valB === null || valB === undefined) return -1
      
      const comparison = valA < valB ? -1 : 1
      return orderAsc ? comparison : -comparison
    })
  }

  if (limitCount !== null) {
    filtered = filtered.slice(0, limitCount)
  }

  const populated = filtered.map((row: any) => {
    const copy = { ...row }
    
    if (copy.client_id) {
      copy.client = db.clients.find(c => c.id === copy.client_id) || null
    }
    if (copy.job_id) {
      copy.job = db.jobs.find(j => j.id === copy.job_id) || null
    }
    if (copy.quote_id) {
      copy.quote = db.quotes.find(q => q.id === copy.quote_id) || null
    }
    if (table === 'quotes') {
      copy.items = db.quote_items.filter(item => item.quote_id === copy.id)
    }
    if (table === 'invoices') {
      copy.items = db.invoice_items.filter(item => item.invoice_id === copy.id)
      copy.payments = db.payments.filter(p => p.invoice_id === copy.id)
    }
    
    return copy
  })

  return populated
}

export async function insertMockData(table: string, data: any) {
  const db = readDb()
  const rows = db[table as keyof MockDbSchema] || []
  
  const toInsert = Array.isArray(data) ? data : [data]
  const inserted: any[] = []

  for (const item of toInsert) {
    const newItem = {
      id: item.id || generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...item
    }
    rows.push(newItem)
    inserted.push(newItem)
  }

  writeDb(db)
  return Array.isArray(data) ? inserted : inserted[0]
}

export async function updateMockData(table: string, filters: any[], updates: any) {
  const db = readDb()
  const rows = db[table as keyof MockDbSchema] || []
  
  const updated: any[] = []
  
  const updatedRows = rows.map((row: any) => {
    let matches = true
    for (const f of filters) {
      const val = row[f.column]
      if (f.type === 'eq' && val !== f.value) matches = false
      if (f.type === 'neq' && val === f.value) matches = false
      if (f.type === 'gte' && (val === null || val === undefined || val < f.value)) matches = false
      if (f.type === 'lte' && (val === null || val === undefined || val > f.value)) matches = false
      if (f.type === 'in' && (!Array.isArray(f.value) || !f.value.includes(val))) matches = false
    }
    
    if (matches) {
      const newRow = { ...row, ...updates, updated_at: new Date().toISOString() }
      updated.push(newRow)
      return newRow
    }
    return row
  })
  
  db[table as keyof MockDbSchema] = updatedRows as any
  writeDb(db)
  return updated
}

export async function deleteMockData(table: string, filters: any[]) {
  const db = readDb()
  const rows = db[table as keyof MockDbSchema] || []
  
  const deleted: any[] = []
  const remaining: any[] = []
  
  for (const row of rows) {
    let matches = true
    for (const f of filters) {
      const val = row[f.column]
      if (f.type === 'eq' && val !== f.value) matches = false
      if (f.type === 'neq' && val === f.value) matches = false
      if (f.type === 'gte' && (val === null || val === undefined || val < f.value)) matches = false
      if (f.type === 'lte' && (val === null || val === undefined || val > f.value)) matches = false
      if (f.type === 'in' && (!Array.isArray(f.value) || !f.value.includes(val))) matches = false
    }
    
    if (matches) {
      deleted.push(row)
    } else {
      remaining.push(row)
    }
  }
  
  db[table as keyof MockDbSchema] = remaining as any
  writeDb(db)
  return deleted
}
