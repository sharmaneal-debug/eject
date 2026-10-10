const steps = [
  { title: "Scan", words: "Your live URL", icon: ScanIcon },
  { title: "Move", words: "Pages become files", icon: MoveIcon },
  { title: "Edit by chatting", words: "With your own AI", icon: ChatIcon },
];

export function Steps() {
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {steps.map((step) => (
        <li key={step.title} className="rounded-2xl border border-line bg-white p-6">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-paper-warm text-ink">
            <step.icon />
          </span>
          <p className="mt-4 text-lg font-semibold">{step.title}</p>
          <p className="mt-1 text-sm text-ink-soft">{step.words}</p>
        </li>
      ))}
    </ol>
  );
}

function ScanIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15.5 15.5L20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MoveIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 7l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 16.5V7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v6A2.5 2.5 0 0 1 16.5 16H9l-4 3.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 10.5h.01M12 10.5h.01M15 10.5h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
