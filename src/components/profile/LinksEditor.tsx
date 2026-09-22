"use client";

import { useState } from "react";

interface Link {
  title: string;
  href: string;
}

interface LinksEditorMessages {
  linkTitle: string;
  linkHref: string;
  addLink: string;
  removeLink: string;
}

interface LinksEditorProps {
  initial: Link[];
  /** Shared by the self-service profile form and the admin editor, each with their own copy. */
  messages: LinksEditorMessages;
}

/** Rows of title / address, serialised into the hidden `links` field as JSON. */
export function LinksEditor({ initial, messages }: LinksEditorProps) {
  const [links, setLinks] = useState<Link[]>(initial);
  const update = (index: number, patch: Partial<Link>) =>
    setLinks(links.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  return (
    <div>
      <input
        type="hidden"
        name="links"
        value={JSON.stringify(links.filter((l) => l.title && l.href))}
      />
      {links.map((link, index) => (
        <div className="row g-2 mb-2" key={index}>
          <div className="col-md-4">
            <input
              className="form-control"
              type="text"
              placeholder={messages.linkTitle}
              value={link.title}
              maxLength={255}
              onChange={(e) => update(index, { title: e.target.value })}
            />
          </div>
          <div className="col-md-7">
            <input
              className="form-control"
              type="url"
              placeholder={messages.linkHref}
              value={link.href}
              maxLength={1023}
              onChange={(e) => update(index, { href: e.target.value })}
            />
          </div>
          <div className="col-md-1">
            <button
              type="button"
              className="btn btn-link link-subtle p-0"
              onClick={() => setLinks(links.filter((_, i) => i !== index))}
            >
              {messages.removeLink}
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm"
        onClick={() => setLinks([...links, { title: "", href: "" }])}
      >
        {messages.addLink}
      </button>
    </div>
  );
}
