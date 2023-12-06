import CreateCourseForm from "~/app/components/training/courses/create/CreateCourse";
import { redirect } from "next/navigation";
import PageHeader from "~/app/components/_layouts/pageHeader";
import { getUserServer } from "~/app/_util/getUserServer";

export default async function CreateCourse() {
  const { user } = await getUserServer();
  if (!user) redirect("/api/auth/signin");

  return (
    <>
      <PageHeader
        title={"Create a new course"}
        image={{
          src: "/images/hero.avif",
          alt: "Create a new course",
        }}
      />
      <CreateCourseForm />
    </>
  );
}
