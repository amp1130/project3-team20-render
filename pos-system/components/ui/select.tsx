"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps extends React.ComponentPropsWithoutRef<"select"> {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ value, onValueChange, placeholder, className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("relative", className)}>
        <select
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className={cn(
            "flex h-10 w-full appearance-none items-center justify-between rounded-md border border-[#d4c8bc] bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-[#8c7b6b] focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
      </div>
    )
  }
)
Select.displayName = "Select"

interface SelectItemProps extends React.ComponentPropsWithoutRef<"option"> {
  value: string
}

const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <option
        ref={ref}
        className={cn("py-1.5 text-sm", className)}
        {...props}
      >
        {children}
      </option>
    )
  }
)
SelectItem.displayName = "SelectItem"

// These are just empty components to maintain API compatibility
const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
const SelectTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>
const SelectValue = ({ children }: { children: React.ReactNode }) => <>{children}</>

export { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } 