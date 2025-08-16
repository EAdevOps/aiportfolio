import { useEffect } from "react";

export function useAutosizeTextArea(
  el: HTMLTextAreaElement | null,
  value: string
) {
  useEffect(() => {
    if (!el) return;
    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";
  }, [el, value]);
}
