import { PrismaClient, Course, Group as PrismaGroup } from "@prisma/client";
import { getServerAuthSession } from "~/server/auth";
import { Line } from "../../../../components/courses/create/parse/ParsePGNtoLineData";
import { errorResponse, successResponse } from "../../../responses";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  // Check if user is authenticated and reject request if not
  const session = await getServerAuthSession();
  const authToken = request.headers.get("Authorization")?.split(" ")[1];
  if (!session || session.user.id !== authToken)
    return errorResponse("Unauthorized", 401);

  const { courseName, description, group, lines } = (await request.json()) as {
    courseName: string;
    description: string;
    group: string;
    lines: Line[];
  };

  if (!courseName || !group || !lines)
    return errorResponse("Missing required fields", 400);

  // Extract the unique group names from the lines
  // into an array of objects with a groupName property
  const groupNames = lines.reduce((acc: { groupName: string }[], line) => {
    const groupName = line.tags[group] as string;
    if (
      groupName !== undefined &&
      !acc.some((item) => item.groupName === groupName)
    ) {
      acc.push({ groupName });
    }
    return acc;
  }, []);

  // Get the slug for the course name
  const slug = courseName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Check if course name is available
  const existingCourse = await prisma.course.findFirst({
    where: {
      slug: slug,
    },
  });

  if (existingCourse) return errorResponse("Course name is not available", 400);

  try {
    await prisma.$transaction(
      async (tx) => {
        // Create a new global course and it's groups
        const course = (await tx.course.create({
          include: {
            groups: true,
          },
          data: {
            courseName: courseName,
            courseDescription: description,
            createdBy: session.user.id,
            slug: slug,
            groups: {
              create: groupNames,
            },
          },
        })) as Course & { groups: PrismaGroup[] };

        // Link the user to the course by creating their userCourse
        const userCourse = await tx.userCourse.create({
          data: {
            user: {
              connect: {
                id: session.user.id,
              },
            },
            courseId: course.id,
            linesUnseen: lines.length,
          },
        });

        // Process each line and create a new line and userLine
        // as well as the moves for the userLine
        await Promise.all(
          lines.map(async (line) => {
            const groupName = line.tags[group] as string;
            const colour = line.tags["Colour"] as string;
            const moves = line.moves.map((move) => move.notation).join(",");
            const matchingGroup = course.groups.find(
              (group) => group.groupName === groupName,
            );

            if (!matchingGroup) throw new Error("Invalid group name");

            const dbLine = await tx.line.create({
              data: {
                colour: colour,
                moves: moves,
                groupId: matchingGroup.id,
                courseId: course.id,
              },
            });

            const movesToCreate = line.moves.map((move) => ({
              move: move.notation,
            }));

            await tx.userLine.create({
              data: {
                courseId: course.id,
                userId: session.user.id,
                userCourseId: userCourse.id,
                lineId: dbLine.id,
                moves: {
                  create: movesToCreate,
                },
              },
            });
          }),
        );
      },
      {
        timeout: 10000,
      },
    );

    return successResponse(
      "Course created",
      {
        slug: slug,
      },
      200,
    );
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
