import { Bell, Search, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'

export function Header({ onNotificationClick, user, onMenuClick }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
      {/* 左侧区域 */}
      <div className="flex items-center space-x-4">
        {/* 手机端菜单按钮 */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="text-foreground hover:bg-accent/10 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* 欢迎信息 */}
        <h1 className="text-lg md:text-2xl font-semibold text-foreground">
          欢迎回来，<span className="text-accent">{user ? user.username : '访客'}</span>
        </h1>
      </div>

      {/* 右侧操作区 */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* 搜索框 - 桌面端显示 */}
        {!isMobile && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索推文或钱包地址..."
              className="pl-10 w-80 bg-input border-border"
            />
          </div>
        )}

        {/* 手机端搜索按钮 */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-accent/10"
          >
            <Search className="h-5 w-5" />
          </Button>
        )}

        {/* 通知按钮 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onNotificationClick}
          className="relative text-foreground hover:bg-accent/10"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
            5
          </span>
        </Button>

        {/* 用户头像 */}
        <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent/10">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}

