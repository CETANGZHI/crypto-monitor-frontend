import { useState, useEffect } from 'react'
import { Bell, BellOff, Check, CheckCheck, Trash2, Filter, Search, Settings, AlertCircle, TrendingUp, Wallet, Twitter, Calendar, Clock, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { api } from '@/services/api'

export function NotificationCenter({ user }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [stats, setStats] = useState({})

  useEffect(() => {
    fetchNotifications()
    fetchNotificationStats()
    // 设置定时刷新
    const interval = setInterval(fetchNotifications, 30000) // 30秒刷新一次
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/notifications/list')
      setNotifications(response.data.data)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      // 使用模拟数据作为后备
      setNotifications(getMockNotifications())
    } finally {
      setLoading(false)
    }
  }

  const fetchNotificationStats = async () => {
    try {
      const response = await api.get('/api/v1/notifications/stats')
      setStats(response.data.data)
    } catch (error) {
      console.error('Failed to fetch notification stats:', error)
      setStats(getMockStats())
    }
  }

  const markAsRead = async (notificationIds) => {
    try {
      await api.post('/api/v1/notifications/mark-read', { notification_ids: notificationIds })
      setNotifications(prev => 
        prev.map(notif => 
          notificationIds.includes(notif.id) 
            ? { ...notif, is_read: true }
            : notif
        )
      )
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds)
    }
  }

  const deleteNotifications = async (notificationIds) => {
    try {
      await api.post('/api/v1/notifications/delete', { notification_ids: notificationIds })
      setNotifications(prev => prev.filter(notif => !notificationIds.includes(notif.id)))
      setSelectedNotifications([])
    } catch (error) {
      console.error('Failed to delete notifications:', error)
    }
  }

  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const selectAllNotifications = () => {
    const filteredNotifications = getFilteredNotifications()
    const allIds = filteredNotifications.map(n => n.id)
    setSelectedNotifications(
      selectedNotifications.length === allIds.length ? [] : allIds
    )
  }

  const getFilteredNotifications = () => {
    let filtered = notifications

    // 按类型过滤
    if (filter !== 'all') {
      filtered = filtered.filter(notif => notif.type === filter)
    }

    // 按搜索词过滤
    if (searchTerm) {
      filtered = filtered.filter(notif => 
        notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'twitter':
        return <Twitter className="h-5 w-5 text-blue-500" />
      case 'wallet':
        return <Wallet className="h-5 w-5 text-green-500" />
      case 'price':
        return <TrendingUp className="h-5 w-5 text-orange-500" />
      case 'system':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationTypeLabel = (type) => {
    const labels = {
      twitter: '推特监控',
      wallet: '钱包监控',
      price: '价格提醒',
      system: '系统通知'
    }
    return labels[type] || '其他'
  }

  const formatTime = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now - time
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
    
    return time.toLocaleDateString('zh-CN')
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">通知中心</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和统计 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">通知中心</h1>
          <p className="text-muted-foreground mt-2">
            管理您的推特、钱包和价格提醒通知
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-lg px-3 py-1">
            {unreadCount} 未读
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            通知设置
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">总通知</p>
                <p className="text-2xl font-bold">{stats.total || 0}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">未读通知</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
              <BellOff className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">今日通知</p>
                <p className="text-2xl font-bold">{stats.today || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">本周通知</p>
                <p className="text-2xl font-bold">{stats.week || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索通知..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="筛选类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="twitter">推特监控</SelectItem>
              <SelectItem value="wallet">钱包监控</SelectItem>
              <SelectItem value="price">价格提醒</SelectItem>
              <SelectItem value="system">系统通知</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          {selectedNotifications.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAsRead(selectedNotifications)}
              >
                <Check className="h-4 w-4 mr-2" />
                标记已读
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteNotifications(selectedNotifications)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            全部已读
          </Button>
        </div>
      </div>

      {/* 通知列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>通知列表</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                onCheckedChange={selectAllNotifications}
              />
              <span className="text-sm text-muted-foreground">全选</span>
            </div>
          </div>
          <CardDescription>
            共 {filteredNotifications.length} 条通知
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无通知</h3>
              <p className="text-muted-foreground">
                {searchTerm || filter !== 'all' ? '没有符合条件的通知' : '您还没有收到任何通知'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-4 p-4 border rounded-lg transition-colors ${
                    notification.is_read ? 'bg-background' : 'bg-blue-50 dark:bg-blue-950'
                  } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <Checkbox
                    checked={selectedNotifications.includes(notification.id)}
                    onCheckedChange={() => toggleNotificationSelection(notification.id)}
                  />
                  
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-medium ${!notification.is_read ? 'font-bold' : ''}`}>
                            {notification.title}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.content}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{formatTime(notification.created_at)}</span>
                          {notification.source && (
                            <span>来源: {notification.source}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {notification.action_url && (
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead([notification.id])}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotifications([notification.id])}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 试用提醒 */}
      {user && user.user_type === 'trial' && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-900 dark:text-orange-100">试用期提醒</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  您的试用期还剩 {user.trial_days_remaining || 0} 天。升级到付费版本以继续接收通知提醒。
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  立即升级
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// 模拟数据函数
function getMockNotifications() {
  return [
    {
      id: 1,
      type: 'twitter',
      title: '马斯克发布新推文',
      content: '埃隆·马斯克刚刚发布了一条关于比特币的推文，提到了"To the moon"',
      is_read: false,
      created_at: new Date(Date.now() - 300000).toISOString(), // 5分钟前
      source: '@elonmusk',
      action_url: 'https://twitter.com/elonmusk/status/123456789'
    },
    {
      id: 2,
      type: 'wallet',
      title: '大额转账提醒',
      content: '监控钱包 0x742d...35Cc 发生大额转账，转出 1,500 ETH 到未知地址',
      is_read: false,
      created_at: new Date(Date.now() - 1800000).toISOString(), // 30分钟前
      source: 'Ethereum',
      action_url: 'https://etherscan.io/tx/0x123...'
    },
    {
      id: 3,
      type: 'price',
      title: 'BTC价格突破提醒',
      content: '比特币价格突破 $50,000，当前价格 $50,250 (+2.5%)',
      is_read: true,
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1小时前
      source: 'CoinGecko'
    },
    {
      id: 4,
      type: 'twitter',
      title: 'CZ发布重要公告',
      content: '币安CEO赵长鹏发布关于新产品发布的重要公告',
      is_read: true,
      created_at: new Date(Date.now() - 7200000).toISOString(), // 2小时前
      source: '@cz_binance'
    },
    {
      id: 5,
      type: 'system',
      title: '系统维护通知',
      content: '系统将于今晚 23:00-01:00 进行维护升级，期间可能影响部分功能',
      is_read: false,
      created_at: new Date(Date.now() - 14400000).toISOString(), // 4小时前
      source: '系统'
    }
  ]
}

function getMockStats() {
  return {
    total: 156,
    today: 12,
    week: 45,
    unread: 8
  }
}

