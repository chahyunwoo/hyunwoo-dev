import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { REFERRER_CATEGORY_COLORS, REFERRER_CATEGORY_LABELS } from '../config/referrer-colors'
import type { ReferrerCategory, ReferrerSummary } from '../model'

interface ReferrerPieChartProps {
  summary: ReferrerSummary
}

const CATEGORIES: ReferrerCategory[] = ['direct', 'search', 'social', 'other']

export function ReferrerPieChart({ summary }: ReferrerPieChartProps) {
  const data = CATEGORIES.filter(cat => summary[cat] > 0).map(cat => ({
    name: REFERRER_CATEGORY_LABELS[cat],
    value: summary[cat],
    color: REFERRER_CATEGORY_COLORS[cat],
  }))

  if (!data.length) return null

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={130} height={130}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={58}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map(entry => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ payload }) => {
              const item = payload?.[0]
              if (!item) return null
              const percent = summary.total > 0 ? (((item.value as number) / summary.total) * 100).toFixed(1) : 0
              return (
                <div className="rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md">
                  {item.name}: {item.value}회 ({percent}%)
                </div>
              )
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-2">
        {data.map(entry => (
          <div key={entry.name} className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span className="text-xs text-muted-foreground">{entry.name}</span>
            <span className="text-xs font-mono font-medium ml-auto">{entry.value}</span>
          </div>
        ))}
        <div className="border-t pt-1.5 mt-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">전체</span>
            <span className="text-xs font-mono font-medium">{summary.total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
