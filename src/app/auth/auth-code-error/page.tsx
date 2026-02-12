
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-[#0f0c29]">
      <div className="p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-2xl">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400 mb-4">
          Authentication Error
        </h1>
        <p className="text-slate-300 mb-8 max-w-md">
          There was an issue verifying your login. Usually, this means the link expired or was already used.
        </p>
        <Button asChild className="bg-white/10 hover:bg-white/20 text-white rounded-full px-8 py-3 h-auto text-lg font-medium">
          <Link href="/">Try Again</Link>
        </Button>
      </div>
    </div>
  )
}
