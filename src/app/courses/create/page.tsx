import CreateCourseForm from "~/app/components/training/courses/create/CreateCourse";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import PageHeader from "~/app/components/_layouts/pageHeader";

export default async function CreateCourse() {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");

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
