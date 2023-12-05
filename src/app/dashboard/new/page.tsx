import { getServerAuthSession } from "~/server/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "~/app/components/_elements/container";
import PageHeader from "~/app/components/_layouts/pageHeader";
import Button from "~/app/components/_elements/button";

export default async function NewUserWelcome() {
  const session = await getServerAuthSession();
  if (!session) redirect("/auth/signin");

  return (
    <>
      <PageHeader
        title={"Welcome to ChessTraining.app!"}
        image={{
          src: "/images/hero.avif",
          alt: "Welcome to ChessTraining.app!",
        }}
      />
      <Container>
        <div className="flex flex-col gap-4">
          <p>
            We're glad you're here. If you have any questions, please don't
            hesitate to{" "}
            <a href="mailto:welcome@chesstraining.app">reach out to us.</a>
          </p>
          <p>
            We hope you enjoy your time here! And to begin, we recommend you
            visit our <Link href="/courses">Course Library</Link>.
          </p>
          <p>
            If you're looking for a place to start, we recommend{" "}
            <Link href="/courses/zero-to-hero-0-to-1600">
              Zero To Hero: From 0 to 1600
            </Link>
            .
          </p>
          <Link href={"/dashboard"}>
            <Button variant="primary">Take me to my dashboard</Button>
          </Link>
        </div>
      </Container>{" "}
    </>
  );
}
