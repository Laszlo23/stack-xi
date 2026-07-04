import { useEffect, useState } from "react";

const TYPE_MS = 38;
const DELETE_MS = 22;
const PAUSE_AFTER_TYPE_MS = 3_200;
const PAUSE_AFTER_DELETE_MS = 450;

type TypewriterLineProps = {
  messages: string[];
  className?: string;
};

export function TypewriterLine({ messages, className }: TypewriterLineProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const messagesKey = messages.join("\0");

  useEffect(() => {
    setMessageIndex(0);
    setText("");
    setDeleting(false);
  }, [messagesKey]);

  useEffect(() => {
    if (messages.length === 0) return;

    const full = messages[messageIndex % messages.length] ?? "";

    if (!deleting && text === full) {
      const pause = setTimeout(() => setDeleting(true), PAUSE_AFTER_TYPE_MS);
      return () => clearTimeout(pause);
    }

    if (deleting && text === "") {
      const pause = setTimeout(() => {
        setDeleting(false);
        setMessageIndex((current) => (current + 1) % messages.length);
      }, PAUSE_AFTER_DELETE_MS);
      return () => clearTimeout(pause);
    }

    const step = setTimeout(
      () => {
        if (deleting) {
          setText(full.slice(0, text.length - 1));
        } else {
          setText(full.slice(0, text.length + 1));
        }
      },
      deleting ? DELETE_MS : TYPE_MS,
    );

    return () => clearTimeout(step);
  }, [deleting, messageIndex, messages, text]);

  if (messages.length === 0) return null;

  return (
    <span className={className} aria-live="polite">
      {text}
      <span className="text-primary/70">▌</span>
    </span>
  );
}
