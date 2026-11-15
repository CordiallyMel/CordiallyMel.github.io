"use client";

import { type FormEvent, useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm({
  apiBase,
  email,
}: {
  apiBase: string;
  email: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setError("");

    try {
      const response = await fetch(`${apiBase.replace(/\/$/, "")}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          website: data.get("website"),
          source: window.location.href,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "The message could not be sent.");
      }
      form.reset();
      setStatus("sent");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The message could not be sent.");
      setStatus("error");
    }
  }

  return (
    <div className="contact-form">
      <div className="form-head">
        <span className="form-kicker">Direct line</span>
        <span className="form-note">Goes to a D1-backed inbox</span>
      </div>

      {status === "sent" ? (
        <div className="form-success" role="status">
          <strong>Message received.</strong>
          <p>I will follow up from {email}. If you need a faster route, email me directly.</p>
          <button className="form-reset" type="button" onClick={() => setStatus("idle")}>
            Send another note
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              <span>Name</span>
              <input name="name" type="text" autoComplete="name" required minLength={2} maxLength={100} />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" required maxLength={254} />
            </label>
          </div>
          <label>
            <span>What are you building?</span>
            <textarea name="message" required minLength={20} maxLength={5000} rows={4} />
          </label>
          <label className="form-honeypot" aria-hidden="true">
            Website
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </label>
          <div className="form-actions">
            <button className="button button-small" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
            <span className="form-privacy">No newsletter. No tracking pixels.</span>
          </div>
          {status === "error" && (
            <p className="form-error" role="alert">
              {error} You can also email <a href={`mailto:${email}`}>{email}</a>.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
