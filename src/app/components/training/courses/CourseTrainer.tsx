"use client";

import { PrismaUserCourse, PrismaUserLine } from "~/app/util/GetUserCourse";
import { useState } from "react";
import Board from "./board";
import { Container, Flex, Text } from "@radix-ui/themes";
import { UserFens } from "@prisma/client";

export default function CourseTrainer(props: {
  userCourse: PrismaUserCourse;
  userLines: PrismaUserLine[];
  userFens: UserFens[];
}) {
  const [currentLine, setCurrentLine] = useState<PrismaUserLine>(
    props.userLines[0] as PrismaUserLine,
  );

  return (
    <Container size={"1"} mt={"3"}>
      <Flex direction={"column"} gap={"6"}>
        <Text size={"4"}>
          Current Group: {currentLine.line.group.groupName}
        </Text>
        <Board currentLine={currentLine} userFens={props.userFens} />
      </Flex>
    </Container>
  );
}
