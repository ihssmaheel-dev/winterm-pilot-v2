import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="mb-3">
        {label && <label className="block text-[11px] font-semibold text-text2 mb-[5px]">{label}</label>}
        <input
          ref={ref}
          className={`w-full bg-bg-elevated border border-border-med rounded-[8px] text-text font-sans text-[12px] px-[10px] py-[7px] outline-none transition-all duration-150 focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-glow)] placeholder:text-text3 ${className}`}
          {...props}
        />
      </div>
    )
  },
)
Input.displayName = 'Input'
