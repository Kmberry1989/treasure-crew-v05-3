export function html(strings, ...values) {
  return strings.reduce((result, string, index) => `${result}${string}${index < values.length ? values[index] ?? "" : ""}`, "");
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function safeClass(value) {
  return String(value || "default").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
}

export function shuffle(items) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

export function timeRemaining(targetTime) {
  const diff = Math.max(0, targetTime - Date.now());
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, "0")} left`;
}
