'use client'

import Image from 'next/image'
import Link from 'next/link'

import { useState } from 'react'

import { thumbs } from '@dicebear/collection'
import { createAvatar } from '@dicebear/core'
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs'
import type { KindeUser } from '@kinde-oss/kinde-auth-nextjs/dist/types'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'

import { XpRanks } from '~/app/_util/RanksAndBadges'

export default function Nav(props: {
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
      href: '/courses',
      name: 'Courses',
    },
    {
      href: '/about/features/woodpecker-method',
      name: 'Woodpecker Method',
    },
    {
      name: 'Features',
      subLinks: [
        {
          name: 'Tactics Trainer',
          href: '/training/tactics',
        },
        {
          name: 'Openings Trainer',
          href: '/about/features/natural-play-learning',
        },
        {
          name: 'Endgame Trainer',
          href: '/training/endgames',
        },
        {
          name: 'Visualisation Trainer',
          href: '/training/visualisation',
        },
        {
          name: 'Recall Trainer',
          href: '/training/recall',
        },
        {
          name: 'Knight Vision',
          href: '/training/knight-vision',
        },
        {
          name: 'View All Features',
          href: '/about/features',
        },
      ],
    },
  ]

  return (
    <header className="sticky top-0 z-10 bg-purple-700 text-white shadow-lg">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-1 px-1 py-2 lg:gap-4 lg:p-4">
        <Link href="/">
          <div className="flex items-center">
            <Image
              src="/chesstrainingapplogo.png"
              alt="ChessTraining.app"
              width={75}
              height={75}
            />
            <div>
              <h2 className="font-bold italic lg:text-xl">ChessTraining.app</h2>
              <h3 className="text-xs font-light lg:text-sm">
                The best way to improve your chess
              </h3>
            </div>
          </div>
        </Link>
        <div className="relative flex items-center space-x-3 lg:order-2 lg:space-x-0">
          {user && (
            <>
              <Tippy content="Your Profile">
                <button
                  type="button"
                  className="flex overflow-hidden rounded-full bg-gray-800 text-sm focus:ring-4 focus:ring-gray-600 lg:me-0"
                  onClick={() => setUserOpen(!userOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-10 w-10">
                    <div dangerouslySetInnerHTML={{ __html: avatarSvg }} />
                  </div>
                </button>
              </Tippy>
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
            className="inline-flex h-10 w-10 items-center justify-center p-2 text-sm text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-gray-200 lg:hidden"
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
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
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
              ? 'absolute left-0 right-0 top-[100px] z-50 mx-auto w-screen max-w-screen-sm px-2 shadow-lg lg:p-0'
              : 'hidden') +
            ' items-center justify-between lg:order-1 lg:ml-auto lg:flex lg:w-auto '
          }
        >
          {openSub != '' && (
            <div
              className="fixed inset-0 z-10 hidden lg:block"
              onClick={() => setOpenSub('')}
            ></div>
          )}
          <ul className="relative mt-4 flex flex-col divide-y divide-gray-600 border border-gray-100 bg-gray-50 p-4 font-medium rtl:space-x-reverse lg:mt-0 lg:flex-row lg:items-center lg:divide-none lg:border-0 lg:bg-transparent lg:p-0">
            {links.map((link) =>
              link.subLinks ? (
                <div key={link.name} className="relative">
                  <button
                    onClick={() =>
                      setOpenSub(openSub === link.name ? '' : link.name)
                    }
                    className="flex w-full items-center justify-between px-4 py-2 text-gray-900 hover:bg-purple-100 lg:w-auto lg:border-0 lg:text-white lg:hover:bg-purple-600"
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
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 4 4 4-4"
                      />
                    </svg>
                  </button>
                  <div
                    className={
                      'z-50 w-full divide-y divide-gray-600 bg-gray-50 font-normal lg:w-44 lg:shadow ' +
                      (openSub === link.name
                        ? 'block lg:absolute lg:top-10'
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
                  className="block cursor-pointer px-4 py-2 text-gray-700 hover:bg-purple-100 lg:text-white lg:hover:bg-purple-600"
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
            {!user ? (
              <Link
                onClick={() => {
                  setMenuOpen(false)
                  setOpenSub('')
                }}
                className="block cursor-pointer bg-orange-500 px-4 py-2 text-white hover:bg-orange-400 lg:ml-2"
                href="/auth/signin"
              >
                Login/Register
              </Link>
            ) : (
              <Link
                onClick={() => {
                  setMenuOpen(false)
                  setOpenSub('')
                }}
                className="block cursor-pointer bg-orange-500 px-4 py-2 text-white hover:bg-orange-400 lg:ml-2"
                href="/dashboard"
              >
                Dashboard
              </Link>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
