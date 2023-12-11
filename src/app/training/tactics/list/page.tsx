import { redirect } from "next/navigation";
import PageHeader from "~/app/components/_layouts/pageHeader";
import { GetTacticSets } from "~/app/_util/GetTacticSets";
import Error from "~/app/components/general/ErrorPage";
import TacticsList from "~/app/components/training/tactics/list/TacticsList";
import { getUserServer } from "~/app/_util/getUserServer";

export default async function TacticsListPage() {
  const { user } = await getUserServer();
  if (!user) redirect("/api/auth/signin");

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
      <TacticsList />
    </>
  );
}
