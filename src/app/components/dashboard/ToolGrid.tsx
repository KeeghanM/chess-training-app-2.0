"use client";

import { Button, Card, Flex, Heading, Link, Text } from "@radix-ui/themes";
import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Tool } from "~/app/dashboard/page";
import { useRouter } from "next/navigation";

export default function ToolGrid(props: { tool: Tool }) {
  const [showDescription, setShowDescription] = useState(false);
  const [parent] = useAutoAnimate();
  const router = useRouter();

  return (
    <Card>
      <Flex direction={"column"} justify={"between"} height={"100%"} gap={"4"}>
        <Flex direction={"column"} gap="2">
          <Link href={props.tool.href}>
            <Heading size="6">{props.tool.name}</Heading>
          </Link>
          <Flex direction="column" gap="2" ref={parent}>
            {
              // Only show the first line of the description
              // unless the user has clicked "Show More"
              props.tool.description
                .slice(0, showDescription ? undefined : 1)
                .map((line) => (
                  <Text key={line} size="3">
                    {line}
                  </Text>
                ))
            }
            <Button
              onClick={() => setShowDescription(!showDescription)}
              variant={"ghost"}
              color="gray"
            >
              {showDescription ? "Hide" : "Show More"}
            </Button>
          </Flex>
        </Flex>
        <Button
          color="plum"
          variant="solid"
          onClick={() => router.push(props.tool.href)}
        >
          {props.tool.buttonText}
        </Button>
      </Flex>
    </Card>
  );
}
