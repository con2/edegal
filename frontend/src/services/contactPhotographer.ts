import Config from '../Config';

export interface ContactRequest {
  context: string;
  subject: 'permission' | 'takedown' | 'other';
  email: string;
  message: string;
}

export default async function contactPhotographer(contact: ContactRequest) {
  const url = `${Config.backend.baseUrl}${Config.backend.apiPrefix}/contact`;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(contact),
  });
}
