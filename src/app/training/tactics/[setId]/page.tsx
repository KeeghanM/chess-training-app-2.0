import { redirect } from "next/navigation";
import { GetSetPuzzles } from "~/app/_util/GetTacticSets";
import { getUserServer } from "~/app/_util/getUserServer";
import Container from "~/app/components/_elements/container";
import Error from "~/app/components/general/ErrorPage";
import TacticsTrainer from "~/app/components/training/tactics/TacticsTrainer";

export default async function TacticsTrainPage({
  params,
}: {
  params: { setId: string };
}) {
  const { user } = await getUserServer();
  if (!user) redirect("/api/auth/signin");

  const set = await GetSetPuzzles(params.setId);
  if (!set) return <Error PageTitle="Oops! Something went wrong" />;

  return (
    <Container>
      <TacticsTrainer set={set} />
    </Container>
  );
}
