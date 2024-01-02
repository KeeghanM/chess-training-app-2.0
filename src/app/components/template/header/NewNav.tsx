'use client'

import { KindeUser } from '@kinde-oss/kinde-auth-nextjs/dist/types'
import Image from 'next/image'
import Link from 'next/link'
import Button from '../../_elements/button'
import { createAvatar } from '@dicebear/core'
import { thumbs } from '@dicebear/collection'
import { useState } from 'react'
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs'
import { XpRanks } from '~/app/_util/RanksAndBadges'

export default function NewNav(props: {
  user: KindeUser | null
  experience: number
}) {
  const [userOpen, setUserOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openSub, setOpenSub] = useState('')

  const { user, experience } = props
  const avatar = createAvatar(thumbs, {
    seed: user?.email ?? 'default',
  })
  const avatarSvg = avatar.toString()
  const rank = XpRanks.reverse().find((rank) => experience >= rank.xp)

  const links = [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Features',
      subLinks: [
        {
          name: 'Tactics Trainer',
          href: '/training/tactics',
        },
        {
          name: 'Courses',
          href: '/courses',
        },
        {
          name: 'Endgame Trainer',
          href: '/training/endgames',
        },
        {
          name: 'View All Features',
          href: '/about/features',
        },
      ],
    },
    {
      name: 'About',
      href: '/about',
    },
  ]

  return (
    <header className="sticky top-0 z-10 bg-purple-700 text-white shadow-lg">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-1 px-1 py-2 md:gap-4 md:p-4">
        <Link href="/">
          <div className="flex items-center">
            <Image
              src="/chesstrainingapplogo.png"
              alt="ChessTraining.app"
              width={75}
              height={75}
            />
            <div>
              <h2 className="font-bold italic md:text-xl lg:text-2xl">
                ChessTraining.app
              </h2>
              <h3 className="text-xs font-light md:text-sm">
                The best way to improve your chess
              </h3>
            </div>
          </div>
        </Link>
        <div className="relative flex items-center space-x-3 md:order-2 md:space-x-0">
          {user && (
            <>
              <button
                type="button"
                className="flex overflow-hidden rounded-full bg-gray-800 text-sm focus:ring-4 focus:ring-gray-600 md:me-0"
                onClick={() => setUserOpen(!userOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-10 w-10">
                  <div dangerouslySetInnerHTML={{ __html: avatarSvg }} />
                </div>
              </button>
              {userOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserOpen(false)}
                  ></div>
                  <div className="absolute right-0 top-8 z-50 my-4 list-none divide-y divide-gray-600 bg-gray-700 text-base shadow">
                    <div className="px-4 py-3">
                      <span className="block text-sm  text-white">
                        {user.given_name} {user.family_name ?? 'Welcome'}
                      </span>
                      <span className="block truncate text-sm  text-gray-400">
                        {user.email}
                      </span>
                      <span className="block truncate text-xs text-orange-500">
                        {experience.toLocaleString()} XP ({rank?.rank}:{' '}
                        {rank?.name})
                      </span>
                    </div>
                    <ul className="py-2" aria-labelledby="user-menu-button">
                      <li>
                        <Link
                          href="/dashboard"
                          onClick={() => setUserOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white"
                        >
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setUserOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white"
                        >
                          Settings
                        </Link>
                      </li>
                      <li>
                        <LogoutLink
                          className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 hover:text-white"
                          onClick={() => setUserOpen(false)}
                        >
                          Sign out
                        </LogoutLink>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </>
          )}

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center p-2 text-sm text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div
            className="fixed inset-0 z-10 bg-[rgba(0,0,0,0.3)]"
            onClick={() => setMenuOpen(false)}
          ></div>
        )}
        <nav
          className={
            (menuOpen
              ? 'absolute left-0 right-0 top-[100px] z-50 mx-auto w-screen max-w-screen-sm px-2 shadow-lg md:p-0'
              : 'hidden') +
            ' items-center justify-between md:order-1 md:ml-auto md:flex md:w-auto '
          }
        >
          {openSub != '' && (
            <div
              className="fixed inset-0 z-10 hidden md:block"
              onClick={() => setOpenSub('')}
            ></div>
          )}
          <ul className="relative mt-4 flex flex-col divide-y divide-gray-600 border border-gray-100 bg-gray-50 p-4 font-medium rtl:space-x-reverse md:mt-0 md:flex-row md:divide-none md:border-0 md:bg-transparent md:p-0">
            {links.map((link) =>
              link.subLinks ? (
                <div key={link.name} className="relative">
                  <button
                    onClick={() =>
                      setOpenSub(openSub === link.name ? '' : link.name)
                    }
                    className="flex w-full items-center justify-between px-4 py-2 text-gray-900 hover:bg-purple-100 md:w-auto md:border-0 md:text-white md:hover:bg-purple-600"
                  >
                    {link.name}{' '}
                    <svg
                      className="ms-2.5 h-2.5 w-2.5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 10 6"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m1 1 4 4 4-4"
                      />
                    </svg>
                  </button>
                  <div
                    className={
                      'z-50 w-full divide-y divide-gray-600 bg-gray-50 font-normal md:w-44 md:shadow ' +
                      (openSub === link.name
                        ? 'block md:absolute md:top-10'
                        : 'hidden')
                    }
                  >
                    <ul className="w-full divide-y divide-gray-300 py-2 text-sm text-gray-700">
                      {link.subLinks.map((subLink) => (
                        <Link
                          key={subLink.name}
                          href={subLink.href}
                          className="block w-full px-4 py-2 hover:bg-purple-100"
                          onClick={() => {
                            setMenuOpen(false)
                            setOpenSub('')
                          }}
                        >
                          {subLink.name}
                        </Link>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.name}
                  className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-purple-100 md:text-white md:hover:bg-purple-600"
                  href={link.href}
                  onClick={() => {
                    setMenuOpen(false)
                    setOpenSub('')
                  }}
                >
                  {link.name}
                </Link>
              ),
            )}
            {!user && (
              <Link
                onClick={() => {
                  setMenuOpen(false)
                  setOpenSub('')
                }}
                className="block cursor-pointer bg-orange-500 px-4 py-2 text-white hover:bg-orange-400 md:ml-2"
                href="/auth/signin"
              >
                Login
              </Link>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
