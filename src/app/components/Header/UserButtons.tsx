"use client";
import { Avatar, Button, DropdownMenu, Flex } from "@radix-ui/themes";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function UserButtons() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <Flex direction="row" align="center" gap="2">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Avatar
            src={session?.user.image!}
            fallback="A"
            size="3"
            style={{ cursor: "pointer" }}
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={() => router.push("/training/courses")}>
            Train Courses
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => router.push("/courses")}>
            Find Courses
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => router.push("/account/settings")}>
            Settings
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => {
              signOut();
            }}
            color="red"
          >
            Logout
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <Flex direction="row" gap="2">
        <Button
          onClick={() => router.push("/dashboard")}
          style={{ cursor: "pointer" }}
        >
          Dashboard
        </Button>
      </Flex>
    </Flex>
  );
}