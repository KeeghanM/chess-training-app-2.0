import { redirect } from "next/navigation";
import Container from "~/app/components/_elements/container";
import PageHeader from "~/app/components/_layouts/pageHeader";
import Button from "~/app/components/_elements/button";
import { createUserProfile, getUserServer } from "~/app/_util/getUserServer";
import StyledLink from "~/app/components/_elements/styledLink";
import Link from "next/link";

export default async function NewUserWelcome() {
  const { user, profile } = await getUserServer();
  if (!user) redirect("/auth/signin");
  if (!profile) {
    await createUserProfile(user);
  }

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
            visit our <StyledLink href="/courses" text="Course Library" />.
          </p>
          <p>
            If you're looking for a place to start, we recommend{" "}
            <StyledLink
              href="/courses/zero-to-hero-0-to-1600"
              text="Zero To Hero: From 0 to 1600"
            />
            .
          </p>
          <Link href={"/dashboard"}>
            <Button variant="primary">Take me to my dashboard</Button>
          </Link>
        </div>
      </Container>
    </>
  );
}
