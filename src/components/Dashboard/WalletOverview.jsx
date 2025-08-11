import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function WalletOverview({ wallets }) {
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatValue = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  const formatChange = (change) => {
    const isPositive = change >= 0
    return {
      value: `${isPositive ? '+' : ''}${change.toFixed(2)}%`,
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">钱包监控概览</h3>
        <Button variant="outline" size="sm">
          查看全部
        </Button>
      </div>

      <div className="space-y-4">
        {wallets.map((wallet) => {
          const change = formatChange(wallet.change24h)
          const ChangeIcon = change.icon

          return (
            <div
              key={wallet.id}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{wallet.label}</span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {formatAddress(wallet.address)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {formatValue(wallet.currentValue)}
                  </p>
                  <div className={cn(
                    "flex items-center space-x-1 text-sm",
                    change.isPositive ? "text-chart-3" : "text-destructive"
                  )}>
                    <ChangeIcon className="h-3 w-3" />
                    <span>{change.value}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    wallet.isActive ? "bg-chart-3" : "bg-muted-foreground"
                  )} />
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {wallets.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">暂无监控的钱包地址</p>
          <Button variant="outline">
            添加钱包地址
          </Button>
        </div>
      )}
    </div>
  )
}

