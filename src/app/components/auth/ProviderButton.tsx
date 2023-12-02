"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Button from "../_elements/button";

const icons: {
  [key: string]: {
    color: string;
    url: string;
  };
} = {
  Discord: { color: "#5865F2", url: "/icons/discord-mark-white.svg" },
  Google: { color: "#4285F4", url: "/icons/google.svg" },
};

export default function ProviderButton(props: { provider: any }) {
  const { provider } = props;

  return (
    <Button onClick={() => signIn(provider.id)} variant="primary">
      <Image
        src={icons[provider.name]?.url as string}
        width={24}
        height={24}
        alt={`${provider.name} logo`}
      />
      <p>Sign in with {provider.name}</p>
    </Button>
  );
}
