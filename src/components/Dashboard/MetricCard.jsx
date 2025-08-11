import { cn } from '@/lib/utils'

export function MetricCard({ icon: Icon, title, value, subtitle, className }) {
  return (
    <div className={cn(
      "bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-accent/50",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Icon className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-muted-foreground text-xs mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

