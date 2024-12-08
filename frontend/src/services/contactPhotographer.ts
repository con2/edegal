import { apiUrl } from "@/config";

export interface ContactRequest {
  context: string;
  subject: "permission" | "takedown" | "other";
  email: string;
  message: string;
}

export default async function contactPhotographer(contact: ContactRequest) {
  const url = `${apiUrl}/contact`;
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify(contact),
  });
}
