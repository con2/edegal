"use client";

import { useState } from "react";

import type { CreditInput } from "@/editor/schemas";
import type { Translations } from "@/translations";

interface CreditsEditorProps {
  initial: CreditInput[];
  photographers: { id: string; displayName: string }[];
  messages: Translations["Editor"]["fields"];
}

/** Rows of photographer / copyright / role, serialised into the hidden `credits` field as JSON. */
export function CreditsEditor({
  initial,
  photographers,
  messages,
}: CreditsEditorProps) {
  const [rows, setRows] = useState<CreditInput[]>(initial);
  const update = (index: number, patch: Partial<CreditInput>) =>
    setRows(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  return (
    <div>
      <input type="hidden" name="credits" value={JSON.stringify(rows)} />
      {rows.map((row, index) => (
        <div className="row g-2 align-items-center mb-2" key={index}>
          <div className="col-md-5">
            <select
              className="form-select"
              aria-label={messages.creditPhotographer}
              value={row.photographerId}
              onChange={(event) =>
                update(index, { photographerId: event.target.value })
              }
            >
              {photographers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={row.isCopyright}
                onChange={(event) =>
                  update(index, { isCopyright: event.target.checked })
                }
              />{" "}
              {messages.creditCopyright}
            </label>
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder={messages.creditDescription}
              value={row.description}
              maxLength={255}
              onChange={(event) =>
                update(index, { description: event.target.value })
              }
            />
          </div>
          <div className="col-md-1">
            <button
              type="button"
              className="btn btn-link link-subtle p-0"
              onClick={() => setRows(rows.filter((_, i) => i !== index))}
            >
              {messages.removeCredit}
            </button>
          </div>
        </div>
      ))}
      {photographers.length > 0 ? (
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() =>
            setRows([
              ...rows,
              {
                photographerId: photographers[0].id,
                isCopyright: rows.length === 0,
                description: "",
              },
            ])
          }
        >
          {messages.addCredit}
        </button>
      ) : null}
    </div>
  );
}
