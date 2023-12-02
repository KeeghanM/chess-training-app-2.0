"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "../_elements/button";

export default function UserButtons() {
  const { data: session } = useSession();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative">
          <button
            className="bg-white h-8 w-8  flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-gray-900"
            id="user-menu"
            aria-haspopup="true"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="sr-only">Open user menu</span>
            <img
              className="h-8 w-8 rounded-full"
              src={session?.user.image ?? "/images/default-avatar.png"}
              alt=""
            />
          </button>
          <div
            className={
              "origin-bottom-left md:origin-top-right z-50 absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5" +
              (menuOpen ? "" : " hidden")
            }
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu"
          >
            <div
              onClick={() => setMenuOpen(false)}
              className={
                menuOpen
                  ? "fixed w-screen h-screen left-0 top-0 -z-10"
                  : "hidden -z-50"
              }
            ></div>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Your Profile
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Settings
            </a>
            <button
              onClick={() => signOut()}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-100 w-full text-left"
              role="menuitem"
            >
              Sign out
            </button>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard")} variant="accent">
          Dashboard
        </Button>
      </div>
    </>
  );
}
