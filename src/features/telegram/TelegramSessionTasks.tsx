import { useEffect } from "react";
import { useMemberTasks } from "@/hooks/use-member-tasks";
import { useTelegramSession } from "@/hooks/use-telegram-session";

/** Completes auto Telegram tasks once initData session is verified. */
export function TelegramSessionTasks() {
  const { isTelegram, isLoading, user } = useTelegramSession();
  const { completeTask, isTaskComplete } = useMemberTasks();

  useEffect(() => {
    if (!isTelegram || isLoading || !user) return;
    if (!isTaskComplete("connect_telegram")) {
      completeTask("connect_telegram");
    }
    if (!isTaskComplete("open_telegram_game")) {
      completeTask("open_telegram_game");
    }
  }, [isTelegram, isLoading, user, completeTask, isTaskComplete]);

  return null;
}
