"use client";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { PrismaTacticsSet } from "~/app/_util/GetTacticSets";
import Button from "~/app/components/_elements/button";
import Spinner from "~/app/components/general/Spinner";
import { getUserClient } from "~/app/_util/getUserClient";
import trackEventOnClient from "~/app/_util/trackEventOnClient";
import { useState } from "react";
import type { ResponseJson } from "~/app/api/responses";
import * as Sentry from "@sentry/nextjs";

export default function SetListEdit(props: {
  set: PrismaTacticsSet;
  onFinished: () => void;
}) {
  const { set } = props;
  const { user } = getUserClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form Values
  const [name, setName] = useState(set.name);

  const close = () => {
    setOpen(false);
  };

  const deleteSet = async () => {
    setLoading(true);
    try {
      await trackEventOnClient("tactics_set_delete", {});
      if (!user) throw new Error("Not logged in");
      await fetch("/api/tactics/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + user.id,
        },
        body: JSON.stringify({
          setId: set.id,
        }),
      });

      props.onFinished();
      close();
    } catch (e) {
      Sentry.captureException(e);
    }
    setLoading(false);
  };

  const updateSet = async () => {
    setLoading(true);
    try {
      await trackEventOnClient("tactics_set_updated", {});
      if (!user) throw new Error("Not logged in");
      const resp = await fetch("/api/tactics/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + user.id,
        },
        body: JSON.stringify({
          setId: set.id,
          name,
        }),
      });

      const json = (await resp.json()) as ResponseJson;

      if (json.message != "Set Created") {
        setError("Oops! Something went wrong: " + json?.message);
        close();
        return;
      }

      props.onFinished();
      close();
    } catch (e) {
      Sentry.captureException(e);
    }
    setLoading(false);
  };

  const DeleteButton = () => {
    return (
      <AlertDialog.Root>
        <AlertDialog.Trigger>
          <Button variant="danger">Delete</Button>
        </AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-20"
            onClick={close}
          />
          <AlertDialog.Content className="bg-white p-4 md:p-6 shadow-md fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg max-h-[75vh] z-50 overflow-y-auto">
            <AlertDialog.Title className="text-purple-700 text-lg font-bold">
              Are you sure you want to delete this?
            </AlertDialog.Title>
            <p>
              This action cannot be undone. You will lose all progress on your
              Tactics Set
            </p>
            <div className="flex gap-2">
              <AlertDialog.Action>
                <Button variant="danger" onClick={deleteSet}>
                  {loading ? (
                    <>
                      Deleting <Spinner />
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </AlertDialog.Action>
              <AlertDialog.Cancel>
                <Button variant="primary" disabled={loading}>
                  Keep The Set
                </Button>
              </AlertDialog.Cancel>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    );
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger>
        <Button variant="secondary">Edit</Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-50"
          onClick={close}
        />
        <AlertDialog.Content className="bg-white p-4 md:p-6 shadow-md fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg max-h-[75vh] z-50 overflow-y-auto">
          <AlertDialog.Title className="text-purple-700 text-lg font-bold">
            Editing "{set.name}"
          </AlertDialog.Title>
          <div className="flex flex-col gap-2">
            <div className="">
              <label>Set Name</label>
              <input
                type="text"
                className="px-4 py-2 border border-gray-300 w-full"
                value={name}
                onInput={(e) => {
                  setName(e.currentTarget.value);
                }}
              />
            </div>
            <div className="flex flex-row gap-2">
              <Button variant="primary" disabled={loading} onClick={updateSet}>
                {loading ? (
                  <>
                    Saving <Spinner />
                  </>
                ) : (
                  "Save"
                )}
              </Button>
              <Button variant="secondary" onClick={close}>
                Close
              </Button>
              <DeleteButton />
            </div>
            <p className="text-sm italic text-red-500">{error}</p>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
