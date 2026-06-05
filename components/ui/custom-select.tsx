"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
}

export function CustomSelect({ value, onChange, options, placeholder = "Pilih...", className = "" }: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 focus:outline-none focus:border-neutral-900 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)] cursor-pointer"
      >
        <span className={selected ? "text-neutral-900" : "text-neutral-400"}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { onChange(option.value); setOpen(false) }}
              className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors ${
                option.value === value
                  ? "bg-neutral-900 text-white font-medium"
                  : "text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
