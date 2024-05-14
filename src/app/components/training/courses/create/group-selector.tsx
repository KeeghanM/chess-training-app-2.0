'use client';

import { useAutoAnimate } from '@formkit/auto-animate/react';
import * as Tabs from '@radix-ui/react-tabs';
import { useEffect, useState } from 'react';

import { trackEventOnClient } from '@/app/_util/track-event-on-client';
import { Button } from '@/app/components/_elements/button';
import { Container } from '@/app/components/_elements/container';
import { Heading } from '@/app/components/_elements/heading';
import { Spinner } from '@/app/components/general/spinner';

import { GroupItem } from './group-item';
import type { Line } from './parse/ParsePGNtoLineData';

export function GroupSelector({
  lines,
  setLines,
  back,
  finished,
}: {
  lines: Line[];
  setLines: (lines: Line[]) => void;
  back: () => void;
  finished: (group: string, lines: Line[]) => void;
}) {
  const [parent] = useAutoAnimate();
  const [groupOptions, setGroupOptions] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [groupedLineCounts, setGroupedLineCounts] = useState<
    Record<string, number>
  >({});
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [needsPrompt, setNeedsPrompt] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  const getGroupOptionsFromLines = (lines: Line[]): string[] => {
    // Get a list of tags which exist on all lines
    // ignore tags which are not on all lines
    // then set groupOptions to that list
    const tags = lines.map((line) => line.tags);
    const tagKeys = tags.map((tag) => Object.keys(tag));
    const commonTagKeys = tagKeys.reduce((prev, curr) => {
      return prev.filter((tag) => curr.includes(tag));
    });
    const uselessTags = [
      'White',
      'Black',
      'Result',
      'messages',
      'Date',
      'Time',
      'UTCDate',
      'UTCTime',
    ];
    return commonTagKeys.filter((tag) => !uselessTags.includes(tag));
  };

  const countLines = (group: string, value: string) => {
    return lines.reduce(
      (prev, curr) => prev + (curr.tags[group] === value ? 1 : 0),
      0,
    );
  };

  useEffect(() => {
    const groups = getGroupOptionsFromLines(lines);
    setGroupOptions(groups);
    if (selectedGroup || groups.length === 0 || groups[0] === undefined) return;
    setSelectedGroup(groups[0]);

    if (hasPrompted) return;
    const whiteCount = countLines('Colour', 'White');
    const blackCount = countLines('Colour', 'Black');
    if (whiteCount > 0 && blackCount > 0) {
      setNeedsPrompt(true);
      setSelectedGroup('Colour');
    }
  }, [lines, selectedGroup]);

  useEffect(() => {
    if (!selectedGroup) return;

    setGroupedLineCounts(
      lines.reduce<Record<string, number>>((prev, curr) => {
        const tag = curr.tags[selectedGroup];
        if (tag === undefined) throw new Error('Missing tag');
        if (prev[tag]) {
          prev[tag]++;
        } else {
          prev[tag] = 1;
        }
        return prev;
      }, {}),
    );
  }, [selectedGroup, lines]);

  return (
    <Container>
      {needsPrompt && !hasPrompted ? (
        <div className="fixed inset-0 z-[99999] grid place-items-center bg-[rgba(0,0,0,0.3)]">
          {/* eslint-disable-next-line -- This is the modal background, what else do you want me to use? */}
          <div
            className="absolute inset-0"
            onClick={() => setHasPrompted(true)}
          />
          <div className="min-w-md fixed z-50 flex max-w-[95vw] flex-col gap-2 bg-white p-2 shadow-lg md:max-w-md">
            <Heading as="h4" color="text-red-500">
              Grouping by Colour
            </Heading>
            <p>
              <strong>
                It looks like you have both white and black lines in this PGN.
                The default colour of a line is based on it&apos;s last move.
              </strong>
            </p>
            <p>
              To allow you to review these, we have set the grouping to
              &quot;Colour&quot;. Here you can edit each lines colour
              individually, or use the &quot;Set All&quot; button to set all
              lines to the same colour.
            </p>
            <p>
              Once you&apos;re happy with the line colours, you can change it
              back to whatever grouping you like.
            </p>
            <p className="italic">
              If a line&apos;s last move doesn&apos;t align with it&apos;s set
              colour, the training will stop at the last move matching the set
              colour.
            </p>
            <Button variant="primary" onClick={() => setHasPrompted(true)}>
              Okay, got it!
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row flex-wrap items-baseline gap-2 text-sm dark:text-white">
            <Heading as="h4">Stats:</Heading>
            <p>
              <span>Total Lines:</span>{' '}
              <span className="font-bold">{lines.length}</span>
            </p>
            <p>
              <span>White Lines:</span>{' '}
              <span className="font-bold">
                {lines.reduce(
                  (prev, curr) => prev + (curr.tags.Colour === 'White' ? 1 : 0),
                  0,
                )}
              </span>
              ,
            </p>
            <p>
              <span>Black Lines:</span>{' '}
              <span className="font-bold">
                {lines.reduce(
                  (prev, curr) => prev + (curr.tags.Colour === 'Black' ? 1 : 0),
                  0,
                )}
              </span>
            </p>
          </div>
          <Tabs.Root
            defaultValue={groupOptions[0]}
            onValueChange={(x) => {
              setSelectedGroup(x);
              trackEventOnClient('create_course_change_grouping', {
                groupName: x,
              });
            }}
          >
            <Heading as="h4">Grouping Options:</Heading>
            <Tabs.List className="flex flex-wrap gap-2">
              {groupOptions.map((group) => (
                <Tabs.Trigger
                  key={group}
                  value={group}
                  className={`border-b-2 px-2 py-1 hover:border-purple-700 hover:bg-purple-200 md:px-4 md:py-2 ${
                    selectedGroup === group
                      ? 'border-purple-700 bg-purple-100'
                      : 'border-gray-300 dark:bg-slate-700 dark:text-white'
                  }`}
                >
                  {group}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs.Root>
          <div ref={parent} className="flex flex-col gap-2">
            {Object.entries(groupedLineCounts).map((entry) => (
              <GroupItem
                key={entry[0]}
                count={entry[1]}
                groupKey={entry[0]}
                lines={lines}
                selectedGroup={selectedGroup}
                updateLines={(newLines) => setLines(newLines)}
              />
            ))}
          </div>
          <div className="flex flex-col gap-2 md:flex-row">
            <Button
              disabled={status === 'loading'}
              variant="primary"
              onClick={() => {
                setStatus('loading');
                finished(selectedGroup, lines);
              }}
            >
              <div className="flex items-center gap-4">
                <span>
                  {status === 'loading' ? 'Creating' : 'Confirm and Create'}
                </span>
                {status === 'loading' && <Spinner />}
              </div>
            </Button>

            <Button variant="secondary" onClick={back}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
