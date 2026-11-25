import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Hammer, ArrowLeft, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg mb-6">
        <Hammer className="h-7 w-7" />
      </div>
      <h1 className="font-heading text-6xl font-black tracking-tight text-slate-900">404</h1>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-800 font-heading">
        Page Not Found
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild variant="outline" size="sm" className="font-semibold">
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <Home className="h-4 w-4" /> Go to Dashboard
          </Link>
        </Button>
        <Button asChild size="sm" className="font-semibold">
          <Link href="/" className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
