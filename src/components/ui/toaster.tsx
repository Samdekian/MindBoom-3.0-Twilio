
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider as RadixToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import * as React from "react"

export function Toaster() {
  const { toasts } = useToast()

  // Add defensive check for toasts
  if (!toasts || !Array.isArray(toasts)) {
    return React.createElement(RadixToastProvider, null, React.createElement(ToastViewport, { key: "viewport" }))
  }

  return React.createElement(
    RadixToastProvider,
    null,
    [
      ...toasts.map(function ({ id, title, description, action, ...props }) {
        return React.createElement(
          Toast,
          { key: id, ...props },
          [
            React.createElement(
              "div",
              { className: "grid gap-1", key: "content" },
              [
                title ? React.createElement(ToastTitle, { key: "title" }, title) : null,
                description ? React.createElement(ToastDescription, { key: "desc" }, description) : null
              ].filter(Boolean) // Filter out null elements
            ),
            action,
            React.createElement(ToastClose, { key: "close" })
          ]
        )
      }),
      React.createElement(ToastViewport, { key: "viewport" })
    ]
  )
}
