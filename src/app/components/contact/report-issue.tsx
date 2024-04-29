'use client';

import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';

import type { ResponseJson } from '@/app/api/responses';
import { Button } from '@/app/components/_elements/button';
import { Spinner } from '@/app/components/general/Spinner';

export function ReportIssueForm() {
  const [sendEmail, setSendEmail] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const players = [
    'Magnus Carlsen',
    'Hikaru Nakamura',
    'Fabiano Caruana',
    'Ding Liren',
    'Ian Nepomniachtchi',
  ];

  const [player] = useState(
    players[Math.floor(Math.random() * players.length)] ?? 'Magnus Carlsen',
  );

  const issueList = [
    'My Account',
    'Billing',
    'Tactics Trainer',
    'Course Trainer',
    'Other',
  ];

  const [issue, setIssue] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!name) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    if (!email) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    if (!message) {
      setError('Message is required');
      setLoading(false);
      return;
    }

    if (!issue) {
      setError('Issue type is required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/mail/reportIssue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          issue,
        }),
      });
      const data = (await res.json()) as ResponseJson;
      if (data.message !== 'Message sent') {
        setError(data.message);
        setLoading(false);
        return;
      }
      setName('');
      setEmail('');
      setMessage('');
      setLoading(false);
      setSuccess(true);
    } catch (e) {
      Sentry.captureException(e);
      if (e instanceof Error) setError(e.message);
      else setError('Something went wrong');

      setLoading(false);
    }
  }

  const openChat = () => {
    // @ts-expect-error : BrevoConversations is defined in the head
    BrevoConversations('openChat', true);
  };

  return (
    <>
      {!sendEmail ? (
        <div className="flex flex-col justify-center gap-4">
          <p>
            The fastest way to reach us is via our{' '}
            <button
              className="cursor-pointer font-bold text-purple-700 underline hover:no-underline"
              onClick={openChat}
            >
              Live Chat
            </button>{' '}
            feature. And don&apos;t worry - you&apos;ll always talk to a real
            person (usually Keeghan, the Founder) never a bot.
          </p>
          <p>
            <button
              className="cursor-pointer font-bold text-purple-700 underline hover:no-underline"
              onClick={openChat}
            >
              Chat with us now
            </button>{' '}
            or would you rather{' '}
            <button
              className="cursor-pointer font-bold text-purple-700 underline hover:no-underline"
              onClick={() => setSendEmail(true)}
            >
              submit an issue using the form
            </button>
            .
          </p>
        </div>
      ) : (
        <>
          {success ? (
            <div className="bg-lime-100 p-4 text-center md:p-6 lg:p-12">
              <p>
                Thanks for reaching out, we&apos;ll be in touch as soon as
                possible!
              </p>
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4 md:flex-row">
                <div>
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    name="name"
                    className="w-full border border-gray-300 bg-gray-100 px-4 py-2 text-black"
                    placeholder={player}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    className="w-full border border-gray-300 bg-gray-100 px-4 py-2 text-black"
                    placeholder={`${player.split(' ')[0] ?? 'Magnus'}@chesstraining.app`}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="issue">Issue Type</label>
                <select
                  id="issue"
                  name="issue"
                  className="w-full border border-gray-300 px-4 py-2 dark:bg-gray-100"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                >
                  <option disabled hidden value="">
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
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  className="w-full border border-gray-300 px-4 py-2 dark:bg-gray-100"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <div>
                <Button disabled={loading} variant="primary">
                  {loading ? (
                    <>
                      Sending <Spinner />
                    </>
                  ) : (
                    'Send'
                  )}
                </Button>
              </div>
              {error ? (
                <div className="text-sm italic text-red-500">{error}</div>
              ) : null}
            </form>
          )}
        </>
      )}
    </>
  );
}
