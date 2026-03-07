import { Eye, EyeOff } from "lucide-react"
import * as React from "react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

export interface PasswordInputProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  /** Custom class for the root wrapper */
  className?: string
  /** Props for the toggle button (e.g. aria-label) */
  toggleButtonProps?: React.ComponentProps<"button">
  /**
   * Controlled: visibility state dari parent (untuk sinkron banyak field).
   * Jika dipakai, berikan juga onVisibleChange.
   */
  visible?: boolean
  /**
   * Controlled: callback saat visibility berubah.
   * Dipakai bersama visible untuk sinkron satu tombol mata ke banyak field.
   */
  onVisibleChange?: (visible: boolean) => void
  /**
   * Sembunyikan tombol mata (field ikut visible dari parent, tanpa tombol).
   * Berguna untuk field konfirmasi yang disinkron dengan field password utama.
   */
  showToggle?: boolean
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      toggleButtonProps,
      visible: visibleProp,
      onVisibleChange,
      showToggle = true,
      ...props
    },
    ref
  ) => {
    const [visibleInternal, setVisibleInternal] = React.useState(false)
    const isControlled = visibleProp !== undefined && onVisibleChange != null
    const visible = isControlled ? visibleProp : visibleInternal
    const setVisible = React.useCallback(
      (value: boolean | ((prev: boolean) => boolean)) => {
        const next = typeof value === "function" ? value(visible) : value
        if (isControlled) {
          onVisibleChange?.(next)
        } else {
          setVisibleInternal(next)
        }
      },
      [isControlled, visible, onVisibleChange]
    )

    return (
      <InputGroup
        className={cn("pr-0", className, "flex! w-full! min-w-0!")}
        data-slot="password-input"
      >
        <InputGroupInput
          ref={ref}
          type={visible ? "text" : "password"}
          autoComplete={props.autoComplete ?? "current-password"}
          data-slot="password-input-control"
          className="min-w-0"
          {...props}
        />
        {showToggle && (
          <InputGroupAddon
            align="inline-end"
            className="border-0 bg-transparent"
          >
            <InputGroupButton
              type="button"
              variant="link"
              size="icon-sm"
              tabIndex={-1}
              onClick={() => setVisible((v) => !v)}
              aria-label={
                visible ? "Sembunyikan password" : "Tampilkan password"
              }
              className="text-muted-foreground hover:text-foreground"
              {...toggleButtonProps}
            >
              {visible ? (
                <Eye className="size-4" aria-hidden />
              ) : (
                <EyeOff className="size-4" aria-hidden />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
    )
  }
)

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
