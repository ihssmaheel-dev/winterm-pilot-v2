import type { InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`flex items-center gap-[8px] px-[8px] py-[6px] rounded-[6px] cursor-pointer transition-colors duration-100 hover:bg-bg-hover ${className}`}>
      <input
        type="checkbox"
        className="accent-accent cursor-pointer w-[14px] h-[14px]"
        {...props}
      />
      <span className="text-[12px] text-text2 font-medium">{label}</span>
    </label>
  )
}
