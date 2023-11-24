"use client";

import { Button, Text } from "@radix-ui/themes";
import { signIn } from "next-auth/react";
import Image from "next/image";

const icons: {
  [key: string]: {
    color: string;
    url: string;
  };
} = {
  Discord: { color: "#5865F2", url: "/icons/discord-mark-white.svg" },
};

export default function ProviderButton(props: { provider: any }) {
  const { provider } = props;
  return (
    <Button
      onClick={() => signIn(provider.id)}
      variant="solid"
      style={{
        backgroundColor: icons[provider.name]?.color,
        color: "white",
        fontWeight: 600,
        cursor: "pointer",
        maxWidth: "fit-content",
      }}
      mx={"auto"}
      size={"4"}
    >
      <Image
        src={icons[provider.name]?.url as string}
        width={24}
        height={24}
        alt={`${provider.name} logo`}
      />
      <Text>Sign in with {provider.name}</Text>
    </Button>
  );
}
