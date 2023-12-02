"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "../../_elements/button";

export default function UserButtons() {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row gap-2">
      <Button onClick={() => router.push("/dashboard")} variant="accent">
        Dashboard
      </Button>
      <Button onClick={() => signOut()} variant="danger">
        Sign out
      </Button>
    </div>
  );
}
