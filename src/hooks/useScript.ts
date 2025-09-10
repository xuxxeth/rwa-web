import { useState, useEffect } from "react";

export function useScript(src: string) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    if (!src) return;

    setStatus("loading");

    // 检查是否已加载过
    let script = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);

    if (!script) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;

      script.onload = () => setStatus("ready");
      script.onerror = () => setStatus("error");

      document.body.appendChild(script);
    } else {
      setStatus("ready");
    }
  }, [src]);

  return status;
}
