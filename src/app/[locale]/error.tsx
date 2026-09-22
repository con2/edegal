"use client";

import { ErrorMessage } from "@/components/ErrorMessage";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <ErrorMessage>
      Something went wrong.{error.digest ? ` (${error.digest})` : null}
    </ErrorMessage>
  );
}
