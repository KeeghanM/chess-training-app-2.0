import Image from 'next/image'
import Link from 'next/link'
import Nav from './Nav'
import { getUserServer } from '~/app/_util/getUserServer'

export default async function Header() {
  const { user } = await getUserServer()

  return (
    <header className="sticky top-0 z-10 bg-purple-700 py-4 text-white shadow">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 md:px-8">
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
        <Nav props={{ user }} />
      </div>
    </header>
  )
}
