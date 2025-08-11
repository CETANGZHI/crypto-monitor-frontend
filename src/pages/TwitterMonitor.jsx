import { useState, useEffect } from 'react'
import { Twitter, Plus, Search, Filter, RefreshCw, UserPlus, Settings, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { TweetCard } from '@/components/Dashboard/TweetCard'
import { api } from '@/services/api'

export function TwitterMonitor({ user }) {
  const [tweets, setTweets] = useState([])
  const [followedAccounts, setFollowedAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newAccountUsername, setNewAccountUsername] = useState('')
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // 获取推特数据
  const fetchTwitterData = async () => {
    try {
      setLoading(true)
      
      const [tweetsRes, accountsRes] = await Promise.all([
        api.get('/api/v1/twitter/posts'),
        api.get('/api/v1/twitter/accounts')
      ])

      setTweets(tweetsRes.data.data || [])
      setFollowedAccounts(accountsRes.data.data || [])
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch Twitter data:', error)
      // 使用模拟数据作为后备
      setTweets(mockTweets)
      setFollowedAccounts(mockAccounts)
    } finally {
      setLoading(false)
    }
  }

  // 添加推特账号
  const handleAddAccount = async () => {
    if (!newAccountUsername.trim()) return

    try {
      await api.post('/api/v1/twitter/accounts', {
        username: newAccountUsername.trim()
      })
      
      setNewAccountUsername('')
      setShowAddDialog(false)
      fetchTwitterData() // 刷新数据
    } catch (error) {
      console.error('Failed to add Twitter account:', error)
    }
  }

  // 切换账号监控状态
  const toggleAccountMonitoring = async (accountId, enabled) => {
    try {
      await api.patch(`/api/v1/twitter/accounts/${accountId}`, {
        is_active: enabled
      })
      
      fetchTwitterData() // 刷新数据
    } catch (error) {
      console.error('Failed to toggle account monitoring:', error)
    }
  }

  // 删除账号
  const removeAccount = async (accountId) => {
    try {
      await api.delete(`/api/v1/twitter/accounts/${accountId}`)
      fetchTwitterData() // 刷新数据
    } catch (error) {
      console.error('Failed to remove account:', error)
    }
  }

  useEffect(() => {
    fetchTwitterData()
    
    // 设置自动刷新（每60秒）
    const interval = setInterval(fetchTwitterData, 60000)
    return () => clearInterval(interval)
  }, [])

  // 过滤和排序推文
  const filteredTweets = tweets
    .filter(tweet => {
      if (searchTerm) {
        return tweet.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
               tweet.contentZh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               tweet.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      }
      return true
    })
    .filter(tweet => {
      if (filterType === 'verified') return tweet.isVerified
      if (filterType === 'high_engagement') return tweet.likeCount > 10000
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.publishedAt) - new Date(a.publishedAt)
      if (sortBy === 'engagement') return (b.likeCount + b.retweetCount) - (a.likeCount + a.retweetCount)
      return 0
    })

  // 计算统计数据
  const stats = {
    totalAccounts: followedAccounts.length,
    activeAccounts: followedAccounts.filter(acc => acc.is_active).length,
    todayTweets: tweets.filter(tweet => {
      const today = new Date().toDateString()
      return new Date(tweet.publishedAt).toDateString() === today
    }).length,
    totalEngagement: tweets.reduce((sum, tweet) => sum + tweet.likeCount + tweet.retweetCount, 0)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center space-x-2">
            <Twitter className="h-8 w-8" />
            <span>推特监控</span>
          </h1>
          <p className="text-muted-foreground">
            最后更新：{lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchTwitterData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                添加账号
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加推特账号</DialogTitle>
                <DialogDescription>
                  输入要监控的推特用户名（不包含@符号）
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    placeholder="例如：elonmusk"
                    value={newAccountUsername}
                    onChange={(e) => setNewAccountUsername(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    取消
                  </Button>
                  <Button onClick={handleAddAccount}>
                    添加
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">关注账号</p>
                <p className="text-2xl font-bold">{stats.activeAccounts}/{stats.totalAccounts}</p>
              </div>
              <UserPlus className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">今日推文</p>
                <p className="text-2xl font-bold">{stats.todayTweets}</p>
              </div>
              <Twitter className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">总互动量</p>
                <p className="text-2xl font-bold">{(stats.totalEngagement / 1000).toFixed(1)}K</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">监控状态</p>
                <p className="text-2xl font-bold text-green-600">活跃</p>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 关注的账号列表 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>关注账号</span>
              </CardTitle>
              <CardDescription>
                管理监控的推特账号
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {followedAccounts.length > 0 ? (
                followedAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={account.avatar || '/default-avatar.png'} 
                        alt={account.display_name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{account.display_name}</p>
                        <p className="text-sm text-muted-foreground">@{account.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={account.is_active}
                        onCheckedChange={(checked) => toggleAccountMonitoring(account.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAccount(account.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>暂无关注账号</p>
                  <p className="text-sm">点击"添加账号"开始监控</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 推文列表 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 搜索和过滤 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索推文内容或用户名..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="筛选类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部推文</SelectItem>
                    <SelectItem value="verified">认证用户</SelectItem>
                    <SelectItem value="high_engagement">高互动</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="排序方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">最新发布</SelectItem>
                    <SelectItem value="engagement">互动量</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 推文列表 */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="animate-pulse">
                        <div className="flex space-x-3">
                          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                            <div className="h-20 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTweets.length > 0 ? (
              filteredTweets.map((tweet) => (
                <TweetCard key={tweet.id} tweet={tweet} showActions={true} />
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 text-muted-foreground">
                    <Twitter className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">暂无推文数据</p>
                    <p className="text-sm">
                      {searchTerm ? '没有找到匹配的推文' : '请添加要监控的推特账号'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 模拟数据
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
  },
  {
    id: '3',
    username: 'cz_binance',
    displayName: 'CZ',
    avatar: 'https://pbs.twimg.com/profile_images/1493096844906262529/gWJYKLuG_400x400.jpg',
    content: 'Building the future of crypto infrastructure. Stay tuned for major announcements.',
    contentZh: '构建加密货币基础设施的未来。敬请关注重大公告。',
    publishedAt: '2024-01-15T08:45:00Z',
    likeCount: 12400,
    retweetCount: 6700,
    replyCount: 2100,
    isVerified: true
  }
]

const mockAccounts = [
  {
    id: '1',
    username: 'elonmusk',
    display_name: 'Elon Musk',
    avatar: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
    is_active: true,
    is_verified: true
  },
  {
    id: '2',
    username: 'justinsuntron',
    display_name: 'Justin Sun',
    avatar: 'https://pbs.twimg.com/profile_images/1345542479645581313/Qs_VXzOr_400x400.jpg',
    is_active: true,
    is_verified: true
  },
  {
    id: '3',
    username: 'cz_binance',
    display_name: 'CZ',
    avatar: 'https://pbs.twimg.com/profile_images/1493096844906262529/gWJYKLuG_400x400.jpg',
    is_active: false,
    is_verified: true
  }
]

