'use client'

import { BookDrawer } from '@/components/film/BookDrawer'
import Link from 'next/link'

export default function BookPage() {
  return (
    <main className="min-h-screen bg-black text-white relative">
      <Link href="/" className="absolute top-8 left-8 text-white hover:text-amber-500 font-mono tracking-widest text-xs uppercase z-50">
        ← Back to Experience
      </Link>
      <BookDrawer onClose={() => {}} />
    </main>
  )
}
