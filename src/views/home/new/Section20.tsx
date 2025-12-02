import { useEffect, useRef } from "react";

export default function AutoSnapSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const top = el.offsetTop - 88;
          window.scrollTo({
            top,
            behavior: "smooth"
          });
          
        }
      },
      {
        threshold: 0.1 // 当 section 有 50% 进入视口时触发
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex items-center justify-center text-white text-6xl bg-gray-900"
    >
      {children}
    </div>
  );
}
