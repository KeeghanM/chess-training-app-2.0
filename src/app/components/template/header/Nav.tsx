"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "../../_elements/button";
import UserButtons from "./UserButtons";
import type { KindeUser } from "@kinde-oss/kinde-auth-nextjs/dist/types";

const menuItems = [
  { name: "Home", href: "/" },
  { name: "Browse Courses", href: "/courses" },
  { name: "Tactics Trainer", href: "/training/tactics" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export default function Nav({ props }: { props: { user: KindeUser | null } }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setMenuOpen(false)}
        className={
          (menuOpen
            ? "fixed w-screen h-screen left-0 top-0 z-10 bg-[rgba(0,0,0,0.5)]"
            : "hidden -z-50") + " lg:hidden"
        }
      ></div>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="block lg:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 8h22M5 16h22M5 24h22"
          />
        </svg>
      </button>
      <nav
        className={
          "fixed right-0 top-0 h-screen w-[50vw] max-w-sm bg-white z-40 flex-col pb-6 pt-10" +
          (menuOpen ? " flex" : " hidden") +
          " lg:flex lg:flex-row lg:bg-transparent lg:relative lg:h-auto lg:w-auto lg:pb-0 lg:pt-0 lg:ml-auto lg:mr-0 lg:items-center lg:justify-end lg:gap-4"
        }
      >
        <div className="absolute right-0 top-0 px-4 py-2 lg:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-black hover:text-orange-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 15 15"
            >
              <path
                fill="currentColor"
                d="M3.64 2.27L7.5 6.13l3.84-3.84A.92.92 0 0 1 12 2a1 1 0 0 1 1 1a.9.9 0 0 1-.27.66L8.84 7.5l3.89 3.89A.9.9 0 0 1 13 12a1 1 0 0 1-1 1a.92.92 0 0 1-.69-.27L7.5 8.87l-3.85 3.85A.92.92 0 0 1 3 13a1 1 0 0 1-1-1a.9.9 0 0 1 .27-.66L6.16 7.5L2.27 3.61A.9.9 0 0 1 2 3a1 1 0 0 1 1-1c.24.003.47.1.64.27Z"
              />
            </svg>
          </button>
        </div>
        {menuItems.map((item) => (
          <Link
            key={item.name}
            onClick={() => setMenuOpen(false)}
            href={item.href}
            className="block px-4 py-2 text-black lg:text-white hover:bg-purple-100 lg:hover:bg-transparent lg:px-0 lg:py-0 lg:hover:underline lg:inline-block lg:min-w-fit font-bold"
          >
            {item.name}
          </Link>
        ))}
        <div className="hidden lg:block">|</div>
        <div className="mt-auto px-4 lg:px-0 lg:mt-0">
          {props.user ? (
            <UserButtons />
          ) : (
            <Link onClick={() => setMenuOpen(false)} href="/auth/signin">
              <Button variant="accent">Login/Register</Button>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
