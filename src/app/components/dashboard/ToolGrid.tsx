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
  const tool = props.tool;

  return (
    <Card>
      <Flex direction={"column"} justify={"between"} height={"100%"} gap={"4"}>
        <Flex direction={"column"} gap="2">
          {tool.active ? (
            <Link href={tool.href}>
              <Heading size="6">{tool.name}</Heading>
            </Link>
          ) : (
            <Heading size="6" color={"gray"}>
              {tool.name}
            </Heading>
          )}
          <Flex direction="column" gap="2" ref={parent}>
            {
              // Only show the first line of the description
              // unless the user has clicked "Show More"
              tool.description
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
        {tool.active ? (
          <Button
            color="plum"
            variant="solid"
            onClick={() => router.push(tool.href)}
            style={{ cursor: "pointer" }}
          >
            {tool.buttonText}
          </Button>
        ) : (
          <Button color="gray" variant="solid" disabled>
            Coming Soon
          </Button>
        )}
      </Flex>
    </Card>
  );
}
