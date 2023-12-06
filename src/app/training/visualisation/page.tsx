import { redirect } from "next/navigation";
import { getUserServer } from "~/app/_util/getUserServer";
import PageHeader from "~/app/components/_layouts/pageHeader";

export default async function Visualisation() {
  const { user } = await getUserServer();
  if (!user) redirect("/api/auth/signin");
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
