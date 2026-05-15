export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function notify(label: string) {
  window.dispatchEvent(new CustomEvent("app-toast", { detail: label }));
}
