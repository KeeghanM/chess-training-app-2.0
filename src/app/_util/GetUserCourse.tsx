import { redirect } from "next/navigation";
import type {
  Course,
  UserLine,
  Line,
  UserCourse,
  Group,
  UserFen,
} from "@prisma/client";
import { getUserServer } from "./getUserServer";

export type PrismaUserCourse = UserCourse & { course: Course };
export type PrismaUserLine = UserLine & { line: Line & { group: Group } };

export async function GetUserCourses() {
  const { user } = await getUserServer();
  if (!user) redirect("/api/auth/signin");

  const resp = await fetch(`${process.env.API_BASE_URL}/courses/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.id}`,
    },
  });
  console.log(`${process.env.API_BASE_URL}/courses/user`);
  const json = await resp.json();
  if (json.message != "Courses found") {
    // TODO: Handle error
    return null;
  }
  return json.data.courses as PrismaUserCourse[];
}

export async function GetUserCourse(courseId: string) {
  const { user } = await getUserServer();

  if (!user) redirect("/api/auth/signin");

  const courseResponse = await fetch(
    `${process.env.API_BASE_URL}/courses/user/${courseId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.id}`,
      },
    },
  );
  const courseJson = await courseResponse.json();
  if (courseJson.message != "Course found") {
    // TODO: Handle error
    return {
      userCourse: null,
      userLines: null,
      fens: null,
    };
  }

  const fensResponse = await fetch(
    `${process.env.API_BASE_URL}/courses/user/${courseId}/fens`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.id}`,
      },
    },
  );
  const fensJson = await fensResponse.json();
  if (fensJson.message != "Fens found") {
    // TODO: Handle error
    return {
      userCourse: null,
      userLines: null,
      fens: null,
    };
  }

  return {
    userCourse: courseJson.data.userCourse as PrismaUserCourse,
    userLines: courseJson.data.userLines as PrismaUserLine[],
    userFens: fensJson.data.fens as UserFen[],
  };
}