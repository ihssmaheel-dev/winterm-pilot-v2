import { forwardRef, type TextareaHTMLAttributes, type ReactNode } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="mb-3">
        {label && <label className="block text-[11px] font-semibold text-text2 mb-[5px]">{label}</label>}
        <textarea
          ref={ref}
          className={`w-full bg-bg-elevated border border-border-med rounded-[8px] text-text font-mono text-[11px] leading-[1.65] px-[10px] py-[7px] outline-none transition-all duration-150 resize-y min-h-[72px] focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-glow)] placeholder:text-text3 ${className}`}
          {...props}
        />
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
