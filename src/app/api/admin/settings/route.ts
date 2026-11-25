import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { requireAdmin } from "@/lib/auth-guard"

export const dynamic = 'force-dynamic'

const MOCK_DB_PATH = path.join(process.cwd(), "src/lib/supabase/mock-db.json")

function getDb() {
  try {
    if (fs.existsSync(MOCK_DB_PATH)) {
      return JSON.parse(fs.readFileSync(MOCK_DB_PATH, "utf-8"))
    }
  } catch {}
  return { settings: { maintenance_mode: false, system_banner: "System Operational", trial_days: 30 } }
}

function saveDb(db: any) {
  try {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(db, null, 2))
  } catch (e) {
    console.error("Failed to save settings:", e)
  }
}

export async function GET() {
  const adminGuard = await requireAdmin()
  if (!adminGuard.authorized) {
    return adminGuard.response
  }

  const db = getDb()
  return NextResponse.json(db.settings || { maintenance_mode: false, system_banner: "System Operational", trial_days: 30 })
}

export async function PUT(request: Request) {
  try {
    const adminGuard = await requireAdmin()
    if (!adminGuard.authorized) {
      return adminGuard.response
    }

    const body = await request.json()
    const db = getDb()
    db.settings = { ...db.settings, ...body }
    saveDb(db)
    return NextResponse.json(db.settings)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update settings" }, { status: 500 })
  }
}
