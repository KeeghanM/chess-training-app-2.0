"use client";

import { useState } from "react";
import Link from "next/link";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Tool } from "~/app/dashboard/page";
import { useRouter } from "next/navigation";
import Heading from "../_elements/heading";
import Button from "../_elements/button";

export default function ToolGrid(props: { tool: Tool }) {
  const [showDescription, setShowDescription] = useState(false);
  const [parent] = useAutoAnimate();
  const router = useRouter();
  const tool = props.tool;

  return (
    <div className="flex flex-col items-center p-4 md:p-6">
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-2">
          {tool.active ? (
            <Link href={tool.href}>
              <Heading as={"h3"}>{tool.name}</Heading>
            </Link>
          ) : (
            <Heading as={"h3"} color="#666">
              {tool.name}
            </Heading>
          )}
          <div className="flex flex-col gap-2" ref={parent}>
            {
              // Only show the first line of the description
              // unless the user has clicked "Show More"
              tool.description
                .slice(0, showDescription ? undefined : 1)
                .map((line) => (
                  <p key={line}>{line}</p>
                ))
            }
            <Button
              onClick={() => setShowDescription(!showDescription)}
              variant={"tertiary"}
            >
              {showDescription ? "Hide" : "Show More"}
            </Button>
          </div>
        </div>
        {tool.active ? (
          <Button variant="primary" onClick={() => router.push(tool.href)}>
            {tool.buttonText}
          </Button>
        ) : (
          <Button variant="secondary" disabled={true}>
            Coming Soon
          </Button>
        )}
      </div>
    </div>
  );
}
