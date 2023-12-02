import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import PageHeader from "~/app/components/_layouts/pageHeader";
import { GetPuzzleSets } from "~/app/util/GetPuzzleSets";

export default async function TacticsList() {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");

  const puzzleSets = await GetPuzzleSets();

  return (
    <>
      <PageHeader
        title="Tactics Trainer"
        subTitle="Your puzzle sets"
        image={{
          src: "/images/hero.avif",
          alt: "Hero Image",
        }}
      />
    </>
  );
}
