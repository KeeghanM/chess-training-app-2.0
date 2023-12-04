import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import Container from "~/app/components/_elements/container";
import Heading from "~/app/components/_elements/heading";
import GoogleSignIn from "~/app/components/auth/GoogleSignIn";

export default async function SignIn() {
  const session = await getServerAuthSession();

  if (session) redirect("/dashboard");

  return (
    <Container>
      <div className="flex flex-col gap-4">
        <Heading as={"h1"}>Sign In or Register</Heading>
        <p>
          To get the most out of ChessTraining.app, and to access all of our
          features, please sign in or register. Registration is{" "}
          <span className="text-orange-500">completely free</span>, and you'll
          get access to every single one of our Science Backed training tools
          forever.
        </p>
        <GoogleSignIn />
      </div>
    </Container>
  );
}
