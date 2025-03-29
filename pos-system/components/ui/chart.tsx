"use client"

import * as React from "react"
import { type LegendProps, type TooltipProps } from "recharts"
import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label: string
    color?: string
    formatter?: (value: number) => string
  }
>

interface ChartContextValue {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

function useChartContext() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChartContext must be used within a ChartProvider")
  }
  return context
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: ChartContainerProps) {
  // Set CSS variables for chart colors
  const containerStyle = React.useMemo(() => {
    return Object.entries(config).reduce((acc, [key, value]) => {
      if (value.color) {
        acc[`--color-${key}`] = value.color
      }
      return acc
    }, {} as Record<string, string>)
  }, [config])

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn("text-sm", className)}
        style={containerStyle}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: Record<string, unknown>
  }>
  label?: string
  formatter?: (value: number, name: string, props: unknown) => [string, string]
  labelFormatter?: (label: string) => string
  className?: string
  indicator?: "line" | "dot"
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  className,
  indicator = "line",
}: ChartTooltipContentProps) {
  const { config } = useChartContext()

  if (!active || !payload?.length) {
    return null
  }

  const formattedLabel = labelFormatter ? labelFormatter(label!) : label

  return (
    <div
      className={cn(
        "rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 shadow-sm",
        className
      )}
    >
      <div className="text-[hsl(var(--card-foreground))] mb-1 font-medium">
        {formattedLabel}
      </div>
      <div className="grid gap-0.5">
        {payload.map((item, index) => {
          const dataKey = item.name
          const configItem = config[dataKey]
          const color = configItem?.color || `hsl(var(--chart-${index + 1}))`
          const formattedValue = configItem?.formatter
            ? configItem.formatter(item.value)
            : item.value.toString()

          return (
            <div key={`item-${index}`} className="flex items-center gap-2">
              {indicator === "line" ? (
                <div
                  className="h-0.5 w-4"
                  style={{
                    backgroundColor: color,
                  }}
                />
              ) : (
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: color,
                  }}
                />
              )}
              <span className="text-[hsl(var(--card-foreground))]">
                {configItem?.label || dataKey}:
              </span>
              <span className="font-medium text-[hsl(var(--card-foreground))]">
                {formattedValue}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ChartTooltip(props: TooltipProps<number, string>) {
  return <ChartTooltipContent {...(props as unknown as ChartTooltipContentProps)} />
}


interface ChartLegendContentProps {
  payload?: Array<{
    value: string
    color: string
    payload: {
      fill: string
      stroke: string
      dataKey: string
      name: string
    }
  }>
  className?: string
  indicator?: "line" | "dot"
}

export function ChartLegendContent({
  payload,
  className,
  indicator = "line",
}: ChartLegendContentProps) {
  const { config } = useChartContext()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-4 text-sm",
        className
      )}
    >
      {payload.map((entry, index) => {
        const dataKey = entry.payload.dataKey
        const configItem = config[dataKey]
        const color = configItem?.color || entry.color

        return (
          <div key={`item-${index}`} className="flex items-center gap-1.5">
            {indicator === "line" ? (
              <div
                className="h-0.5 w-4"
                style={{
                  backgroundColor: color,
                }}
              />
            ) : (
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: color,
                }}
              />
            )}
            <span className="text-[hsl(var(--foreground))]">
              {configItem?.label || dataKey}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function ChartLegend(props: LegendProps) {
  return <ChartLegendContent {...(props as ChartLegendContentProps)} />
}
