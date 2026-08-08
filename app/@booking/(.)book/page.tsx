'use client'

import { BookDrawer } from '@/components/film/BookDrawer'
import { useRouter } from 'next/navigation'

export default function BookingIntercept() {
  const router = useRouter()
  return (
    <BookDrawer onClose={() => router.back()} />
  )
}
