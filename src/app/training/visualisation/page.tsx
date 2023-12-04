import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import PageHeader from "~/app/components/_layouts/pageHeader";

export default async function Visualisation() {
  const session = await getServerAuthSession();

  // Redirect to login if no session
  if (!session) redirect("/api/auth/signin");
  return (
    <>
      <PageHeader
        title="Visualisation & Calculation"
        subTitle="Coming soon!"
        image={{
          src: "/images/hero.avif",
          alt: "Hero Image",
        }}
      />
    </>
  );
}
