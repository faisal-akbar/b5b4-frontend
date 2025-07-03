"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function Toast() {
  return (
    <Button variant="outline" onClick={() => toast("Event has been created")}>
      Show Toast
    </Button>
  );
}
