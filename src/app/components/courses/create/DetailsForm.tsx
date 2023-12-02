import { useState } from "react";
import Spinner from "../../general/Spinner";
import trackEventOnClient from "~/app/util/trackEventOnClient";
import Container from "../../_elements/container";
import Heading from "../../_elements/heading";
import Button from "../../_elements/button";

export default function DetailsForm(props: {
  finished: (name: string, description: string) => void;
}) {
  const [extrasOpen, setExtrasOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [description, setDescription] = useState<string>("");
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
    <Container>
      <div className="flex flex-col gap-6">
        <div>
          <Heading as="h3">Give your course a name</Heading>
          <input
            type="text"
            placeholder="Ruy Lopez: For white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Heading as={"h3"}>and a helpful description</Heading>
          <textarea
            rows={5}
            placeholder="An opening course covering all the main lines for White"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Heading as="h4">Optional Extras</Heading>
            <Button
              variant="tertiary"
              onClick={() => setExtrasOpen(!extrasOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12"
              >
                <path
                  fill="currentColor"
                  d="M6 8.825c-.2 0-.4-.1-.5-.2l-3.3-3.3c-.3-.3-.3-.8 0-1.1c.3-.3.8-.3 1.1 0l2.7 2.7l2.7-2.7c.3-.3.8-.3 1.1 0c.3.3.3.8 0 1.1l-3.2 3.2c-.2.2-.4.3-.6.3Z"
                />
              </svg>
            </Button>
          </div>
          {extrasOpen && (
            <div className="flex flex-col gap-2">
              <p>Coming Soon!</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="primary" onClick={create}>
            <span className="flex items-center gap-4">
              <span>
                {status == "idle" ? "Create Course" : "Checking Name"}
              </span>
              {status == "loading" && <Spinner />}
            </span>
          </Button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    </Container>
  );
}
