'use client'

import * as S from './DefaultLoggedPageLayout.styles'
import { ArrowLeft, List, User } from '@phosphor-icons/react'
import { getUserData } from '@/helpers/get-user-data'
import { UserMenu } from '@/components/UserMenu'
import { useState } from 'react'
import Image from 'next/image'
import logo from '../../assets/logo-with-name.png'

// BUG se o menu mobile estiver aberto, o conteúdo da página não é renderizado, portanto se a largura da tela aumentar e o menu mobile sumir, o conteúdo da página não aparece
export function DefaultLoggedPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false)

  const userData = getUserData()

  const handleChangeOpenMobileMenu = () => {
    setMobileMenuIsOpen(!mobileMenuIsOpen)
  }

  return (
    <S.Wrapper>
      <S.MobileHeader>
        <S.MobileMenu $isOpen={mobileMenuIsOpen}>
          <S.MobileMenuIconWrapper onClick={handleChangeOpenMobileMenu}>
            <ArrowLeft size={32} />
          </S.MobileMenuIconWrapper>
          <UserMenu />
        </S.MobileMenu>
        <S.MobileHeaderIconWrapper onClick={handleChangeOpenMobileMenu}>
          <List size={32} />
        </S.MobileHeaderIconWrapper>
        <S.LogoWrapper>
          <Image src={logo} alt="Logo" width={145} height={42} />
        </S.LogoWrapper>
        <S.UserInfo>
          <User size={32} />
          <span>{userData?.name}</span>
        </S.UserInfo>
      </S.MobileHeader>
      <S.AsideMenu>
        <S.UserInfo>
          <User size={48} />
          <span>{userData?.name}</span>
        </S.UserInfo>
        <UserMenu />
      </S.AsideMenu>
      {mobileMenuIsOpen ? null : <S.PageContent>{children}</S.PageContent>}
    </S.Wrapper>
  )
}
