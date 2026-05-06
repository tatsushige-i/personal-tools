"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onSubmit: (username: string) => void;
  initialValue?: string;
};

export function UsernameSearchForm({ onSubmit, initialValue = "" }: Props) {
  const [value, setValue] = useState(initialValue);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    if (e.nativeEvent.isComposing) return;
    e.preventDefault();
    submit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1 space-y-2">
        <Label htmlFor="github-username">GitHub ユーザー名</Label>
        <Input
          id="github-username"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="例: facebook"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <Button type="submit" disabled={!value.trim()}>
        <Search className="size-4" aria-hidden="true" />
        検索
      </Button>
    </form>
  );
}
