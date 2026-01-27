import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { useEffect } from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <>
      <style>{`
        #toast-root {
          pointer-events: auto !important;
          z-index: 9999 !important;
          position: relative !important;
        }
        [aria-label="Notifications alt+T"] {
          z-index: 9999 !important;
          pointer-events: auto !important;
        }
        [aria-label="Notifications alt+T"] * {
          pointer-events: auto !important;
        }
      `}</style>
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        style={{ zIndex: 9999 }}
        
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton:
              "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton:
              "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          },
        }}
        {...props}
      />
    </>
  )
}

export { Toaster }
