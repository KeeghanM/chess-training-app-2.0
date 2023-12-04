import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import PageHeader from "~/app/components/_layouts/pageHeader";
import { GetTacticSets } from "~/app/util/GetTacticSets";
import Error from "~/app/components/general/ErrorPage";
import TacticsList from "~/app/components/training/tactics/list/TacticsList";

export default async function TacticsListPage() {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");

  const puzzleSets = await GetTacticSets();
  if (!puzzleSets) return <Error PageTitle="Your Courses" />;

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
      <TacticsList sets={puzzleSets} />
    </>
  );
}
