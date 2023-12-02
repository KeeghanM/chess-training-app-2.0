import { useState } from "react";
import Spinner from "~/app/components/general/Spinner";
import trackEventOnClient from "~/app/util/trackEventOnClient";
import Heading from "~/app/components/_elements/heading";
import Button from "~/app/components/_elements/button";

export default function DetailsForm(props: {
  finished: (name: string, description: string) => void;
  courseName: string | undefined;
  description: string | undefined;
}) {
  const [extrasOpen, setExtrasOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>(props.courseName || "");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [description, setDescription] = useState<string>(
    props.description || "",
  );
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    setStatus("loading");
    setError(null);

    if (name === "") {
      setError("Name cannot be empty");
      setStatus("idle");
      return;
    }

    const res = await fetch("/api/courses/create/checkName", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (!json.data?.isAvailable) {
      setError("Name is already taken");
      setStatus("idle");
      trackEventOnClient("Create Course", {
        step: "Details",
        value: "Name Taken",
        name,
      });
      return;
    }

    trackEventOnClient("Create Course", {
      step: "Details",
      value: "Success",
      name,
    });
    props.finished(name, description);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Heading as="h3">Give your course a name</Heading>
        <input
          className="px-4 py-2 border border-gray-300 w-full"
          type="text"
          placeholder="Ruy Lopez: For white"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <Heading as={"h3"}>and a helpful description</Heading>
        <textarea
          className="px-4 py-2 border border-gray-300 w-full"
          rows={5}
          placeholder="An opening course covering all the main lines for White"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Button variant="primary" onClick={create}>
          <span className="flex items-center gap-4">
            <span>{status == "idle" ? "Create Course" : "Checking Name"}</span>
            {status == "loading" && <Spinner />}
          </span>
        </Button>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
}
