import { Container, Em, Heading, Section } from "@radix-ui/themes";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function Visualisation() {
  const session = await getServerAuthSession();

  // Redirect to login if no session
  if (!session) redirect("/api/auth/signin");
  return (
    <Section>
      <Container p={{ initial: "2", lg: "0" }}>
        <Heading size="9" as="h1">
          Visualisation & Calculation
        </Heading>
        <Heading size="6" as="h2">
          <Em>Coming soon!</Em>
        </Heading>
      </Container>
    </Section>
  );
}
