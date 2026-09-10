"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Translations } from "@/translations";

interface UploadPanelProps {
  albumId: string;
  processing: number;
  /** Bound server action returning the album's job counts. */
  status: () => Promise<{ processing: number; failed: number }>;
  messages: Translations["Upload"];
}

type State = "waiting" | "uploading" | "done" | "failed";
type ErrorCode = keyof Translations["Upload"]["errors"];

interface Item {
  id: number;
  file: File;
  state: State;
  progress: number;
  error: ErrorCode | null;
}

const concurrency = 3;
const maxBytes = 100 * 1024 * 1024;

function upload(
  albumId: string,
  file: File,
  onProgress: (fraction: number) => void,
): Promise<ErrorCode | null> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/albums/${albumId}/photos`);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );
    xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onerror = () => resolve("network");
    xhr.onload = () => {
      if (xhr.status === 201) return resolve(null);
      try {
        const { error } = JSON.parse(xhr.responseText) as { error?: string };
        resolve((error as ErrorCode) ?? "network");
      } catch {
        resolve("network");
      }
    };
    xhr.send(file);
  });
}

/** Queue of files uploaded three at a time, then a poll until the worker has processed them. */
export function UploadPanel({
  albumId,
  processing,
  status,
  messages,
}: UploadPanelProps) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [pending, setPending] = useState(processing);
  const nextId = useRef(1);
  const active = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const patch = (id: number, changes: Partial<Item>) =>
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );

  const addFiles = (files: FileList | File[]) => {
    const added: Item[] = Array.from(files).map((file) => ({
      id: nextId.current++,
      file,
      state: file.size > maxBytes ? "failed" : "waiting",
      progress: 0,
      error: file.size > maxBytes ? "tooLarge" : null,
    }));
    setItems((current) => [...current, ...added]);
  };

  // Start uploads whenever a slot is free.
  useEffect(() => {
    const waiting = items.filter((item) => item.state === "waiting");
    while (active.current < concurrency && waiting.length > 0) {
      const item = waiting.shift()!;
      active.current++;
      patch(item.id, { state: "uploading" });
      upload(albumId, item.file, (fraction) =>
        patch(item.id, { progress: fraction }),
      ).then((error) => {
        active.current--;
        patch(
          item.id,
          error ? { state: "failed", error } : { state: "done", progress: 1 },
        );
        if (!error) setPending((n) => n + 1);
      });
    }
  }, [items, albumId]);

  const uploadsInFlight = items.some(
    (item) => item.state === "waiting" || item.state === "uploading",
  );

  // Once the worker has something to do, poll it and refresh the page as photos become visible.
  const poll = useCallback(async () => {
    const counts = await status();
    if (counts.processing !== pending) {
      setPending(counts.processing);
      router.refresh();
    }
  }, [status, pending, router]);

  useEffect(() => {
    if (uploadsInFlight || pending === 0) return;
    const timer = setInterval(() => void poll(), 3000);
    return () => clearInterval(timer);
  }, [uploadsInFlight, pending, poll]);

  const counts = {
    done: items.filter((i) => i.state === "done").length,
    failed: items.filter((i) => i.state === "failed").length,
  };

  return (
    <div className="TextContent">
      <div className="container">
        <h2 className="mb-3">{messages.title}</h2>
        <p className="text-muted">{messages.help}</p>
        <div
          className="border border-2 border-secondary rounded p-4 text-center mb-3"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            addFiles(event.dataTransfer.files);
          }}
        >
          {messages.dropHere}{" "}
          <button
            type="button"
            className="btn btn-link p-0 align-baseline"
            onClick={() => inputRef.current?.click()}
          >
            {messages.selectFiles}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>

        {items.length > 0 ? (
          <table className="table table-sm align-middle">
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="text-truncate" style={{ maxWidth: "24rem" }}>
                    {item.file.name}
                  </td>
                  <td style={{ width: "40%" }}>
                    {item.state === "uploading" || item.state === "done" ? (
                      <div
                        className="progress"
                        role="progressbar"
                        aria-valuenow={Math.round(item.progress * 100)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className={`progress-bar${item.state === "done" ? " bg-success" : ""}`}
                          style={{
                            width: `${Math.round(item.progress * 100)}%`,
                          }}
                        />
                      </div>
                    ) : null}
                  </td>
                  <td
                    className={
                      item.state === "failed" ? "text-danger" : "text-muted"
                    }
                  >
                    {item.state === "failed" && item.error
                      ? messages.errors[item.error]
                      : messages[item.state]}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>
                  {messages.done}: {counts.done} · {messages.failed}:{" "}
                  {counts.failed}
                  {counts.failed > 0 ? (
                    <button
                      type="button"
                      className="btn btn-link btn-sm"
                      onClick={() =>
                        setItems((current) =>
                          current.map((i) =>
                            i.state === "failed" &&
                            i.error !== "tooLarge" &&
                            i.error !== "unsupported" &&
                            i.error !== "exists"
                              ? {
                                  ...i,
                                  state: "waiting",
                                  error: null,
                                  progress: 0,
                                }
                              : i,
                          ),
                        )
                      }
                    >
                      {messages.retry}
                    </button>
                  ) : null}
                  {counts.done > 0 ? (
                    <button
                      type="button"
                      className="btn btn-link btn-sm"
                      onClick={() =>
                        setItems((current) =>
                          current.filter((i) => i.state !== "done"),
                        )
                      }
                    >
                      {messages.clear}
                    </button>
                  ) : null}
                </td>
              </tr>
            </tfoot>
          </table>
        ) : null}

        {pending > 0 ? (
          <p>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            />
            {pending} {messages.processingSuffix}
          </p>
        ) : null}
      </div>
    </div>
  );
}
