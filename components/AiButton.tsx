"use client"
import { Button } from './ui/button'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const AiButton = () => {
  const pathname = usePathname();

  return (
    <Button asChild className={`rounded-full w-14 h-14 fixed bottom-20 md:bottom-10 right-5 md:right-10 bg-primary hover:bg-primary/80 z-50 ${pathname === '/ai-assistant' || pathname.includes('/recipes') ? 'hidden' : ''}`}>
      <Link href='/ai-assistant'>
        <Sparkles className='h-7 w-7 text-white' />
      </Link>
    </Button>
  )
}

export default AiButton