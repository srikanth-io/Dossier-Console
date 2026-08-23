import { Toaster as Sonner } from "sonner"

function Toaster({ ...props }: React.ComponentProps<typeof Sonner>) {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      closeButton
      duration={6000}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-text": "var(--popover-foreground)",
          "--error-text": "var(--popover-foreground)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:!rounded-xl group-[.toaster]:!border-border/70 group-[.toaster]:!bg-popover group-[.toaster]:!text-popover-foreground group-[.toaster]:!shadow-lg",
          title:
            "group-[.toast]:text-sm group-[.toast]:font-semibold group-[.toast]:!text-popover-foreground",
          description:
            "group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:!text-popover-foreground/80",
          actionButton:
            "group-[.toast]:!bg-primary group-[.toast]:!text-primary-foreground group-[.toast]:!rounded-lg group-[.toast]:!h-8",
          cancelButton:
            "group-[.toast]:!bg-muted group-[.toast]:!text-muted-foreground group-[.toast]:!rounded-lg group-[.toast]:!h-8",
          closeButton:
            "group-[.toast]:!border-border group-[.toast]:!bg-muted group-[.toast]:!text-foreground group-[.toast]:!opacity-100",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
