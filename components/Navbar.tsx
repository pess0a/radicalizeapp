'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, LayoutDashboard, User } from 'lucide-react'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <header className="h-14 border-b border-gray-200 flex items-center px-4 gap-4 bg-white z-10">
      <Link href="/" className="font-black text-xl tracking-tight text-gray-900">
        RADICALIZE
      </Link>

      <div className="flex-1" />

      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button className="flex items-center gap-2 rounded-full hover:bg-gray-100 p-1 pr-3 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarImage src={session.user.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {session.user.name?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">
                {session.user.name?.split(' ')[0]}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem render={<Link href="/conta" />}>
              <User size={14} className="mr-2" />
              Minha Conta
            </DropdownMenuItem>
            {(session.user.role === 'OPERATOR' || session.user.role === 'ADMIN') && (
              <DropdownMenuItem render={<Link href="/dashboard" />}>
                <LayoutDashboard size={14} className="mr-2" />
                Dashboard
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut size={14} className="mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
            Entrar
          </Link>
          <Link href="/cadastro" className={cn(buttonVariants({ size: 'sm' }))}>
            Cadastrar
          </Link>
        </div>
      )}
    </header>
  )
}
