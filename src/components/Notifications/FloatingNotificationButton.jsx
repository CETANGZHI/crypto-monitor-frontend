import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function FloatingNotificationButton({ 
  unreadCount = 0, 
  onClick, 
  className 
}) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        className
      )}
      size="icon"
    >
      <Bell className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  )
}

