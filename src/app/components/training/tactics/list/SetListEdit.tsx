"use client";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import type { PrismaTacticsSet } from "~/app/_util/GetTacticSets";
import Button from "~/app/components/_elements/button";
import Spinner from "~/app/components/general/Spinner";
import { getUserClient } from "~/app/_util/getUserClient";
import trackEventOnClient from "~/app/_util/trackEventOnClient";
import { useState } from "react";

export default function SetListEdit(props: { set: PrismaTacticsSet }) {
  const { user } = getUserClient();
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger>
        <Button variant="secondary">Edit</Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-50" />
        <AlertDialog.Content className="bg-white p-4 md:p-6 shadow-md fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg max-h-[75vh] z-50 overflow-y-auto">
          <AlertDialog.Title className="text-purple-700 text-lg font-bold">
            Create a new Tactics Set
          </AlertDialog.Title>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
