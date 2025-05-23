"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FABProps {
  onClick: () => void;
}

export function FAB({ onClick }: FABProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-xl md:hidden"
      aria-label="Add new expense"
    >
      <Plus className="h-8 w-8" />
    </Button>
  );
}
