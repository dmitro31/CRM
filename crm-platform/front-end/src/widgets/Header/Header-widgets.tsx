'use client'

import HeaderInput from '@/features/header/HeaderInput'
import Logo from '@/features/header/logo'
import WorkspaceDropMenu from '@/features/header/workspace-dropMenu'
import NotificationBell from '@/features/header/NotificationBell'
import UserMenu from '@/features/header/UserMenu'
import { useAuth } from '@/providers/auth-provider'
import LoginButt from '@/features/header/LoginButt'


export default function HeaderWidgets() {
  const { isAuth } = useAuth()

  return (
    <div className="flex h-16 items-center justify-between border-b border-[#DFE3DC] bg-[#F6F7F4]">
      <div className="flex items-center">
        <div className="pl-8 pr-6">
          <Logo />
        </div>
        <WorkspaceDropMenu />
        <HeaderInput />
      </div>

      <div className="flex items-center gap-2 pr-8">
        <NotificationBell />
        {isAuth ? (<UserMenu />) : (<><LoginButt/></>)}

      </div>
    </div>
  )
}