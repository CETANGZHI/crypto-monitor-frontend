import { useState } from 'react'
import { X, Twitter, Wallet, Settings as SettingsIcon, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const notificationTabs = [
  { id: 'all', label: '全部' },
  { id: 'twitter', label: '推特' },
  { id: 'wallet', label: '钱包' },
  { id: 'system', label: '系统' }
]

const getNotificationIcon = (type) => {
  switch (type) {
    case 'twitter':
      return Twitter
    case 'wallet':
      return Wallet
    case 'system':
      return SettingsIcon
    default:
      return Twitter
  }
}

export function NotificationPanel({ isOpen, onClose, notifications = [] }) {
  const [activeTab, setActiveTab] = useState('all')

  const filteredNotifications = notifications.filter(notification => 
    activeTab === 'all' || notification.type === activeTab
  )

  const formatTime = (dateString) => {
    const now = new Date()
    const notificationTime = new Date(dateString)
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`
    return `${Math.floor(diffInMinutes / 1440)}天前`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 背景遮罩 */}
      <div 
        className="flex-1 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 通知面板 */}
      <div className="w-96 bg-card border-l border-border flex flex-col h-full">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">通知中心</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 标签页 */}
        <div className="flex border-b border-border">
          {notificationTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-3 px-4 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 通知列表 */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length > 0 ? (
            <div className="p-4 space-y-4">
              {filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type)
                
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
                      notification.isRead 
                        ? "bg-muted/30 border-border" 
                        : "bg-card border-primary/20 shadow-sm"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        notification.type === 'twitter' && "bg-blue-500/10 text-blue-500",
                        notification.type === 'wallet' && "bg-yellow-500/10 text-yellow-500",
                        notification.type === 'system' && "bg-gray-500/10 text-gray-500"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground truncate">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-muted-foreground ml-2">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.content}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <Button variant="ghost" size="sm" className="text-xs">
                            查看
                          </Button>
                          {!notification.isRead && (
                            <Button variant="ghost" size="sm" className="text-xs">
                              标记已读
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <CheckCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-2">暂无通知</h3>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'all' ? '您的所有通知都已查看' : `暂无${notificationTabs.find(t => t.id === activeTab)?.label}通知`}
              </p>
            </div>
          )}
        </div>

        {/* 底部操作 */}
        {filteredNotifications.length > 0 && (
          <div className="p-4 border-t border-border">
            <Button variant="outline" className="w-full">
              全部标记为已读
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

