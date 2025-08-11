import { useState, useEffect } from 'react'
import { Twitter, Wallet, Bell, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react'
import { MetricCard } from '@/components/Dashboard/MetricCard'
import { TweetCard } from '@/components/Dashboard/TweetCard'
import { WalletOverview } from '@/components/Dashboard/WalletOverview'
import { BlackRockChart } from '@/components/Dashboard/BlackRockChart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/services/api'

export function Dashboard({ user }) {
  const [tweets, setTweets] = useState([])
  const [wallets, setWallets] = useState([])
  const [blackRockData, setBlackRockData] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // 获取仪表盘数据
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // 并行获取所有数据
      const [tweetsRes, walletsRes, blackRockRes, notificationsRes] = await Promise.all([
        api.get('/api/v1/twitter/posts?limit=5'),
        api.get('/api/v1/wallet/overview'),
        api.get('/api/v1/blackrock/holdings'),
        api.get('/api/v1/notifications?limit=5')
      ])

      setTweets(tweetsRes.data.data || [])
      setWallets(walletsRes.data.data || [])
      setBlackRockData(blackRockRes.data || null)
      setNotifications(notificationsRes.data.data || [])
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // 使用模拟数据作为后备
      setTweets(mockTweets)
      setWallets(mockWallets)
      setBlackRockData(mockBlackRockData)
      setNotifications(mockNotifications)
    } finally {
      setLoading(false)
    }
  }

  // 组件挂载时获取数据
  useEffect(() => {
    fetchDashboardData()
    
    // 设置自动刷新（每30秒）
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  // 计算统计数据
  const stats = {
    followedAccounts: tweets.length,
    monitoredWallets: wallets.filter(w => w.isActive).length,
    todayNotifications: notifications.filter(n => {
      const today = new Date().toDateString()
      return new Date(n.created_at).toDateString() === today
    }).length,
    totalValue: wallets.reduce((sum, wallet) => sum + (wallet.currentValue || 0), 0)
  }

  // 获取试用期状态
  const getTrialStatus = () => {
    if (!user || user.user_type !== 'TRIAL') return null
    const trialEndDate = new Date(user.trial_end_date)
    const now = new Date()
    const diffTime = trialEndDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const trialDaysLeft = getTrialStatus()

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* 试用期提醒 */}
      {user && user.user_type === 'TRIAL' && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  {trialDaysLeft > 0 
                    ? `试用期剩余 ${trialDaysLeft} 天` 
                    : '试用期已结束'
                  }
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-300">
                  升级到专业版以解锁所有功能和无限制监控
                </p>
              </div>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                立即升级
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 页面标题和刷新按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            仪表盘
          </h1>
          <p className="text-muted-foreground">
            最后更新：{lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchDashboardData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新数据
        </Button>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard
          icon={Twitter}
          title="关注推特账号"
          value={`${stats.followedAccounts}/5`}
          subtitle={user?.user_type === 'TRIAL' ? '试用期限制' : '无限制'}
          trend={stats.followedAccounts > 0 ? 'up' : 'neutral'}
        />
        <MetricCard
          icon={Wallet}
          title="监控钱包地址"
          value={`${stats.monitoredWallets}/5`}
          subtitle={user?.user_type === 'TRIAL' ? '试用期限制' : '无限制'}
          trend={stats.monitoredWallets > 0 ? 'up' : 'neutral'}
        />
        <MetricCard
          icon={Bell}
          title="今日通知"
          value={stats.todayNotifications.toString()}
          subtitle={notifications.length > 0 ? `最新：${new Date(notifications[0]?.created_at).toLocaleTimeString()}` : '暂无通知'}
          trend={stats.todayNotifications > 0 ? 'up' : 'neutral'}
        />
        <MetricCard
          icon={TrendingUp}
          title="总资产价值"
          value={`$${(stats.totalValue / 1000000).toFixed(2)}M`}
          subtitle="监控钱包总值"
          trend="up"
        />
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最新推文动态 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Twitter className="h-5 w-5" />
                    <span>最新推文动态</span>
                  </CardTitle>
                  <CardDescription>币圈大咖最新动态</CardDescription>
                </div>
                <Badge variant="secondary">实时更新</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="flex space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : tweets.length > 0 ? (
                tweets.slice(0, 3).map((tweet) => (
                  <TweetCard key={tweet.id} tweet={tweet} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Twitter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>暂无推文数据</p>
                  <p className="text-sm">请添加要监控的推特账号</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 钱包监控概览 */}
        <div className="space-y-4">
          <WalletOverview wallets={wallets} loading={loading} />
        </div>
      </div>

      {/* 贝莱德持仓趋势 */}
      <BlackRockChart 
        data={blackRockData} 
        loading={loading}
      />

      {/* 快速操作区域 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>常用功能快捷入口</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Twitter className="h-6 w-6" />
              <span className="text-sm">添加推特</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Wallet className="h-6 w-6" />
              <span className="text-sm">添加钱包</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Bell className="h-6 w-6" />
              <span className="text-sm">通知设置</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">数据分析</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 模拟数据作为后备
const mockTweets = [
  {
    id: '1',
    username: 'elonmusk',
    displayName: 'Elon Musk',
    avatar: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
    content: 'Bitcoin is the future of finance! 🚀',
    contentZh: '比特币是金融的未来！🚀',
    publishedAt: '2024-01-15T10:30:00Z',
    likeCount: 15200,
    retweetCount: 8500,
    replyCount: 3200,
    isVerified: true
  },
  {
    id: '2',
    username: 'justinsuntron',
    displayName: 'Justin Sun',
    avatar: 'https://pbs.twimg.com/profile_images/1345542479645581313/Qs_VXzOr_400x400.jpg',
    content: 'TRON ecosystem is growing stronger every day. New partnerships coming soon!',
    contentZh: 'TRON生态系统每天都在变得更强大。新的合作伙伴关系即将到来！',
    publishedAt: '2024-01-15T09:15:00Z',
    likeCount: 5800,
    retweetCount: 2100,
    replyCount: 890,
    isVerified: true
  }
]

const mockWallets = [
  {
    id: '1',
    address: '0x742d35Cc6634C0532925a3b8D4C2F2b4C2F2b4C2',
    label: '马斯克钱包',
    currentValue: 2450000,
    change24h: 12.5,
    isActive: true
  },
  {
    id: '2',
    address: '0x8ba1f109551bD432803012645Hac136c22C2F2b4',
    label: '孙宇晨钱包',
    currentValue: 1850000,
    change24h: -8.2,
    isActive: true
  }
]

const mockBlackRockData = {
  btcHoldings: 152600,
  ethHoldings: 48600,
  btcChange24h: 2.1,
  ethChange24h: 1.8,
  chartData: {
    '24h': [
      { date: '00:00', btc: 152000, eth: 48000 },
      { date: '04:00', btc: 152100, eth: 48100 },
      { date: '08:00', btc: 152200, eth: 48200 },
      { date: '12:00', btc: 152300, eth: 48300 },
      { date: '16:00', btc: 152400, eth: 48400 },
      { date: '20:00', btc: 152500, eth: 48500 },
      { date: '24:00', btc: 152600, eth: 48600 }
    ]
  }
}

const mockNotifications = [
  {
    id: '1',
    title: '马斯克发布新推文',
    content: 'Bitcoin is the future of finance! 🚀',
    type: 'twitter',
    created_at: new Date().toISOString(),
    is_read: false
  },
  {
    id: '2',
    title: '钱包异常交易',
    content: '检测到大额转账：500 BTC',
    type: 'wallet',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    is_read: false
  }
]

