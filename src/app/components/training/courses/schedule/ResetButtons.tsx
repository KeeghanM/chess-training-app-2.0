'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useState } from 'react';

import { type ResponseJson } from '@/app/api/responses';
import { Button } from '@/app/components/_elements/button';
import { Heading } from '@/app/components/_elements/heading';
import Spinner from '@/app/components/general/spinner';

interface ResetButtonProps {
  groups: {
    id: string;
    name: string;
  }[];
  courseId: string;
}

export function ResetButtons({ groups, courseId }: ResetButtonProps) {
  const [groupLoading, setGroupLoading] = useState(false);
  const [allLoading, setAllLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [open, setOpen] = useState(false);

  const markGroupForReview = async () => {
    setGroupLoading(true);
    setError(null);

    try {
      if (!selectedGroup) throw new Error('No group selected');
      const resp = await fetch(
        `/api/courses/user/${courseId}/lines/markGroupForReview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ groupId: selectedGroup }),
        },
      );

      const data = (await resp.json()) as ResponseJson;
      if (data.message !== 'Lines updated') {
        throw new Error('Failed to mark group for review');
      }
      setOpen(false);
      window.location.reload();
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError('An error occurred');
    } finally {
      setGroupLoading(false);
    }
  };

  const markAllForReview = async () => {
    if (!confirm('Are you sure you want to mark all lines for review?')) return;

    setAllLoading(true);
    setError(null);

    try {
      const resp = await fetch(
        `/api/courses/user/${courseId}/lines/markAllForReview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = (await resp.json()) as ResponseJson;
      if (data.message !== 'Lines updated') {
        throw new Error('Failed to mark group for review');
      }
      window.location.reload();
    } catch (e) {
      if (e instanceof Error) setError(e.message);
      else setError('An error occurred');
    } finally {
      setAllLoading(false);
    }
  };

  return error ? (
    <p className="text-sm italic text-red-500">{error}</p>
  ) : (
    <>
      <div className="flex flex-col gap-2 lg:flex-row">
        <Button
          disabled={allLoading}
          variant="primary"
          onClick={() => markAllForReview()}
        >
          {allLoading ? (
            <>
              Marking <Spinner />
            </>
          ) : (
            'Mark All Lines For Review'
          )}
        </Button>
        <Button variant="accent" onClick={() => setOpen(true)}>
          Mark Specific Group For Review
        </Button>
      </div>
      <AlertDialog.Root open={open} onOpenChange={setOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)]"
            onClick={() => {
              if (groupLoading) return;
              setOpen(false);
            }}
          />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 flex w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-4 bg-white p-4 shadow-md md:p-6">
            <div className="flex flex-col gap-2 md:flex-row">
              <select
                className="w-full border border-gray-300 bg-gray-100 px-4 py-1 text-black md:w-fit"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">Select a group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <Button
                disabled={groupLoading}
                variant="primary"
                onClick={() => markGroupForReview()}
              >
                {groupLoading ? (
                  <>
                    Marking <Spinner />
                  </>
                ) : (
                  'Mark For Review'
                )}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (groupLoading) return;
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
