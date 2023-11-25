import {
  Button,
  Container,
  Flex,
  Heading,
  Link,
  Section,
  Text,
} from "@radix-ui/themes";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function NewUserWelcome() {
  const session = await getServerAuthSession();
  if (!session) redirect("/auth/signin");
  return (
    <Section>
      <Container size="3">
        <Flex direction="column" gap={"4"}>
          <Heading size={"9"} as={"h1"}>
            Welcome to ChessTraining.app!
          </Heading>
          <Text size={"4"}>
            We're glad you're here. If you have any questions, please don't
            hesitate to{" "}
            <a href="mailto:welcome@chesstraining.app">reach out to us.</a>
          </Text>
          <Text size={"4"}>
            We hope you enjoy your time here! And to begin, we recommend you
            visit our <Link href="/courses">Course Library</Link>.
          </Text>
          <Text size={"4"}>
            If you're looking for a place to start, we recommend{" "}
            <Link href="/courses/zero-to-hero-0-to-1600">
              Zero To Hero: From 0 to 1600
            </Link>
            .
          </Text>
          <Link href={"/dashboard"}>
            <Button size={"4"}>Take me to my dashboard</Button>
          </Link>
        </Flex>
      </Container>
    </Section>
  );
}
