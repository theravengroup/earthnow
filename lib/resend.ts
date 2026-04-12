import { Resend } from "resend";

let resend: Resend;

export function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}
