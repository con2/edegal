"use client";

import React from "react";

interface Props {
  error: Error | { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: Props) {
  return (
    <div className="container pt-5">
      <div className="row justify-content-center align-items-center">
        {"" + error}
      </div>
    </div>
  );
}
