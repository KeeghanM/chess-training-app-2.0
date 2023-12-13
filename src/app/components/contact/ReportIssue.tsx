"use client";

import { useState } from "react";
import { ResponseJson } from "~/app/api/responses";
import Button from "../_elements/button";
import Spinner from "../general/Spinner";
import * as Sentry from "@sentry/nextjs";

export default function ReportIssueForm() {
  const [sendEmail, setSendEmail] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const players = [
    "Magnus Carlsen",
    "Hikaru Nakamura",
    "Fabiano Caruana",
    "Ding Liren",
    "Ian Nepomniachtchi",
  ];

  const [player] = useState(
    players[Math.floor(Math.random() * players.length)],
  );

  const issueList = [
    "My Account",
    "Billing",
    "Tactics Trainer",
    "Course Trainer",
    "Other",
  ];

  const [issue, setIssue] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (!email) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    if (!message) {
      setError("Message is required");
      setLoading(false);
      return;
    }

    if (!issue) {
      setError("Issue type is required");
      setLoading(false);
      return;
    }

    try {
      // @ts-expect-error : greptcha is defined in the head
      grecaptcha.enterprise.ready(async () => {
        // @ts-expect-error : greptcha is defined in the head
        const token = await grecaptcha.enterprise.execute(
          "6Lcjei8pAAAAAMzsHEubDHvnyBWg2AuqmSSLmwZ0",
          { action: "CONTACT_FORM" },
        );
        const res = await fetch("/api/mail/reportIssue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            name,
            email,
            message,
            issue,
          }),
        });
        const data = (await res.json()) as ResponseJson;
        if (data.message != "Message sent") {
          setError(data.message);
          setLoading(false);
          return;
        }
        setName("");
        setEmail("");
        setMessage("");
        setLoading(false);
        setSuccess(true);
      });
    } catch (e) {
      Sentry.captureException(e);
      if (e instanceof Error) setError(e.message);
      else setError("Something went wrong");

      setLoading(false);
    }
  }

  const openChat = () => {
    // @ts-expect-error : BrevoConversations is defined in the head
    BrevoConversations("openChat", true);
  };

  return (
    <>
      {!sendEmail ? (
        <div className="flex flex-col gap-4 justify-center">
          <p>
            The fastest way to reach us is via our{" "}
            <span
              onClick={openChat}
              className="text-purple-700 underline cursor-pointer hover:no-underline font-bold"
            >
              Live Chat
            </span>{" "}
            feature. And don't worry - you'll always talk to a real person
            (usually Keeghan, the Founder) never a bot.
          </p>
          <p>
            <span
              onClick={openChat}
              className="text-purple-700 underline cursor-pointer hover:no-underline font-bold"
            >
              Chat with us now
            </span>{" "}
            or would you rather{" "}
            <span
              onClick={() => setSendEmail(true)}
              className="text-purple-700 underline cursor-pointer hover:no-underline font-bold"
            >
              submit an issue using the form
            </span>
            .
          </p>
        </div>
      ) : (
        <>
          {success ? (
            <div className="text-center p-4 md:p-6 lg:p-12 bg-lime-100">
              <p>
                Thanks for reaching out, we'll be in touch as soon as possible!
              </p>
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col md:flex-row gap-4">
                <div>
                  <label>Name</label>
                  <input
                    className="px-4 py-2 border border-gray-300 w-full"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={player}
                  />
                </div>
                <div>
                  <label>Email</label>
                  <input
                    className="px-4 py-2 border border-gray-300 w-full"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={player?.split(" ")[0] + "@chesstraining.app"}
                  />
                </div>
              </div>
              <div>
                <label>Issue Type</label>
                <select
                  className="px-4 py-2 border border-gray-300 w-full"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                >
                  <option value="" disabled hidden>
                    I have an issue with...
                  </option>
                  {issueList.map((issue, i) => (
                    <option key={i} value={issue}>
                      {issue}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Message</label>
                <textarea
                  rows={6}
                  className="px-4 py-2 border border-gray-300 w-full"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <div>
                <Button variant="primary" disabled={loading}>
                  {loading ? (
                    <>
                      Sending <Spinner />
                    </>
                  ) : (
                    "Send"
                  )}
                </Button>
              </div>
              {error && (
                <div className="text-red-500 text-sm italic">{error}</div>
              )}
            </form>
          )}
        </>
      )}
    </>
  );
}
