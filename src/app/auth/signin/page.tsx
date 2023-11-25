import { Container, Flex, Heading, Section, Text } from "@radix-ui/themes";
import { getProviders } from "next-auth/react";
import ProviderButton from "~/app/components/auth/ProviderButton";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function SignIn() {
  const providers = await getProviders();
  const session = await getServerAuthSession();

  if (session) redirect("/dashboard");

  return (
    <Section>
      <Container size="3">
        <Flex direction="column" gap="4">
          <Heading size="9" as={"h1"}>
            Sign In or Register
          </Heading>
          <Text size="5">
            To get the most out of ChessTraining.app, and to access all of our
            features, please sign in or register. Registration is{" "}
            <Text color={"tomato"}>completely free</Text>, and you'll get access
            to every single one of our Science Backed training tools forever.
          </Text>
          <Text size="5">
            We support a wide range of sign in providers, including Google,
            Facebook, and Twitter. We also support email sign in, if you prefer.
          </Text>
          {Object.values(providers as Object).map((provider) => (
            <ProviderButton provider={provider} />
          ))}
        </Flex>
      </Container>
    </Section>
  );
}
