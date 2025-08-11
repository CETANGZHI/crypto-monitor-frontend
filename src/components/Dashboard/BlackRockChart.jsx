import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const timeRanges = [
  { id: '24h', label: '24小时' },
  { id: '7d', label: '7天' },
  { id: '30d', label: '30天' }
]

export function BlackRockChart({ data, currentHoldings }) {
  const [selectedRange, setSelectedRange] = useState('7d')

  const formatValue = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }

  const formatChange = (change) => {
    const isPositive = change >= 0
    return {
      value: `${isPositive ? '+' : ''}${change.toFixed(1)}`,
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown
    }
  }

  const btcChange = formatChange(currentHoldings.btcChange24h)
  const ethChange = formatChange(currentHoldings.ethChange24h)

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">贝莱德持仓趋势</h3>
        <div className="flex space-x-2">
          {timeRanges.map((range) => (
            <Button
              key={range.id}
              variant={selectedRange === range.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRange(range.id)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 当前持仓数据 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">BTC 持仓</p>
              <p className="text-2xl font-bold text-foreground">
                {formatValue(currentHoldings.btcHoldings)}
              </p>
            </div>
            <div className={cn(
              "flex items-center space-x-1 text-sm",
              btcChange.isPositive ? "text-chart-3" : "text-destructive"
            )}>
              <btcChange.icon className="h-4 w-4" />
              <span>{btcChange.value}</span>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">ETH 持仓</p>
              <p className="text-2xl font-bold text-foreground">
                {formatValue(currentHoldings.ethHoldings)}
              </p>
            </div>
            <div className={cn(
              "flex items-center space-x-1 text-sm",
              ethChange.isPositive ? "text-chart-3" : "text-destructive"
            )}>
              <ethChange.icon className="h-4 w-4" />
              <span>{ethChange.value}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 趋势图表 */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data[selectedRange]}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickFormatter={formatValue}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--popover-foreground)'
              }}
              formatter={(value, name) => [
                formatValue(value),
                name === 'btc' ? 'BTC' : 'ETH'
              ]}
            />
            <Line
              type="monotone"
              dataKey="btc"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ fill: 'var(--chart-1)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'var(--chart-1)', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="eth"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={{ fill: 'var(--chart-2)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'var(--chart-2)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-chart-1 rounded-full" />
          <span className="text-sm text-muted-foreground">BTC</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-chart-2 rounded-full" />
          <span className="text-sm text-muted-foreground">ETH</span>
        </div>
      </div>
    </div>
  )
}

