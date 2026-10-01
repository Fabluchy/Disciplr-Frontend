import { Component, type ErrorInfo, type ReactNode } from "react";

const SUPPORT_HREF = "mailto:support@disciplr.app";

function createReferenceId(): string {
  // crypto.randomUUID is not guaranteed in every jsdom/runtime, so fall back
  // to a v4-shaped id built from getRandomValues.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  referenceId: string;
};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    referenceId: "",
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true, referenceId: createReferenceId() };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // The reference id is surfaced to the user so support can correlate the
    // crash; keep the raw error available in the console for debugging.
    console.error("Unhandled render error", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const supportHref = SUPPORT_HREF;

    return (
      <div
        role="alert"
        className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center"
      >
        <p className="text-4xl" aria-hidden="true">
          ⚠️
        </p>

        <div className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
          500 error
        </div>

        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Something went wrong
        </h1>

        <p
          className="max-w-md text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          We couldn’t complete that request. Please refresh the page or contact
          support with the reference ID below.
        </p>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-left text-sm">
          <div style={{ color: "var(--text-secondary)" }}>Reference ID</div>
          <div
            className="font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {this.state.referenceId || "Unavailable"}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            className="btn-primary rounded-xl px-5 py-2 text-sm font-semibold"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>

          <a
            href="/"
            className="rounded-xl border border-[var(--border)] px-5 py-2 text-sm font-semibold"
            style={{
              color: "var(--text-primary)",
              textDecoration: "none",
            }}
          >
            Go home
          </a>

          <a
            href={supportHref}
            className="rounded-xl border border-[var(--border)] px-5 py-2 text-sm font-semibold"
            style={{
              color: "var(--text-primary)",
              textDecoration: "none",
            }}
          >
            Contact support
          </a>
        </div>
      </div>
    );
  }
}
