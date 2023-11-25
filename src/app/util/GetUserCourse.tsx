import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import { Course, UserCourse } from "@prisma/client";

export type PrismaCourse = UserCourse & { course: Course };

export async function GetUserCourses() {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");

  const resp = await fetch(`${process.env.API_BASE_URL}/courses/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.user.id}`,
    },
  });
  const json = await resp.json();
  if (json.message != "Courses found") {
    console.log(json);
    return null;
  }
  return json.data.courses as PrismaCourse[];
}

export async function GetUserCourse(courseId: string) {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");

  const resp = await fetch(
    `${process.env.API_BASE_URL}/courses/user/${courseId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.id}`,
      },
    },
  );
  const json = await resp.json();
  if (json.message != "Course found") {
    console.log(json);
    return null;
  }
  return json.data.userCourse as PrismaCourse;
}
