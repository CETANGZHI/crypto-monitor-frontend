import { useState, useEffect } from 'react'
import { 
  Home, 
  Twitter, 
  Wallet, 
  Building2, 
  Bell, 
  Settings, 
  CreditCard,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const menuItems = [
  { icon: Home, label: '仪表盘', id: 'dashboard', active: true },
  { icon: Twitter, label: '推特监控', id: 'twitter' },
  { icon: Wallet, label: '钱包监控', id: 'wallet' },
  { icon: Building2, label: '贝莱德持仓', id: 'blackrock' },
  { icon: Bell, label: '通知中心', id: 'notifications' },
  { icon: Settings, label: '设置', id: 'settings' },
  { icon: CreditCard, label: '订阅管理', id: 'subscription' },
]

export function Sidebar({ activeItem, onItemClick, className, user, onLogout, isMobileMenuOpen, setIsMobileMenuOpen }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 检测屏幕尺寸
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsCollapsed(false) // 手机端不使用折叠模式
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 手机端点击菜单项后自动关闭侧边栏
  const handleItemClick = (itemId) => {
    onItemClick(itemId)
    if (isMobile && setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
  }

  // 手机端点击关闭按钮
  const handleClose = () => {
    if (isMobile && setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  const getTrialStatus = (user) => {
    if (!user || user.user_type !== 'TRIAL') return null;
    const trialEndDate = new Date(user.trial_end_date);
    const now = new Date();
    const diffTime = trialEndDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      return `试用期剩余 ${diffDays} 天`;
    } else {
      return '试用期已结束';
    }
  };

  return (
    <>
      {/* 手机端遮罩层 */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <div className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50",
        // 桌面端样式
        !isMobile && (isCollapsed ? "w-16" : "w-72"),
        // 手机端样式
        isMobile && "fixed left-0 top-0 w-80 h-full transform transition-transform duration-300",
        isMobile && (isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"),
        className
      )}>
        {/* Logo区域 */}
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
          {(!isCollapsed || isMobile) && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-lg">₿</span>
              </div>
              <span className="text-sidebar-foreground font-semibold text-lg">币圈监控</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isMobile ? <X className="h-4 w-4" /> : (isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />)}
          </Button>
        </div>

        {/* 用户信息卡片 */}
        {(!isCollapsed || isMobile) && user && (
          <div className="p-4 mx-4 mt-4 bg-sidebar-accent rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-medium">{user.username ? user.username.charAt(0) : 'U'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sidebar-foreground font-medium truncate">{user.username || '用户'}</p>
                {user.user_type === 'TRIAL' && (
                  <p className="text-sidebar-foreground/60 text-sm">{getTrialStatus(user)}</p>
                )}
                {user.user_type !== 'TRIAL' && (
                  <p className="text-sidebar-foreground/60 text-sm">{user.user_type === 'LIFETIME' ? '终身会员' : '付费会员'}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 导航菜单 */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
                  (isCollapsed && !isMobile) && "px-2"
                )}
                onClick={() => handleItemClick(item.id)}
              >
                <Icon className={cn("h-4 w-4", (!isCollapsed || isMobile) && "mr-3")} />
                {(!isCollapsed || isMobile) && <span>{item.label}</span>}
              </Button>
            )
          })}
        </nav>

        {/* 快捷操作区 */}
        {(!isCollapsed || isMobile) && (
          <div className="p-4 border-t border-sidebar-border">
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              升级到专业版
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent mt-2"
              onClick={onLogout}
            >
              登出
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

