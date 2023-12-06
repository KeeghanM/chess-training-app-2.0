import Image from "next/image";
import Link from "next/link";
import Nav from "./Nav";
import { getUserServer } from "~/app/_util/getUserServer";

export default async function Header() {
  const { user } = await getUserServer();

  return (
    <header className="py-4 bg-purple-800 text-white sticky top-0 z-10 shadow">
      <div className="flex justify-between items-center max-w-screen-2xl px-4 md:px-8 mx-auto">
        <Link href="/">
          <div className="flex items-center">
            <Image
              src="/chesstrainingapplogo.webp"
              alt="ChessTraining.app"
              width={75}
              height={75}
            />
            <div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold italic">
                ChessTraining.app
              </h2>
              <h3 className="text-sm font-light">
                The best way to improve your chess
              </h3>
            </div>
          </div>
        </Link>
        <Nav props={{ user }} />
      </div>
    </header>
  );
}
