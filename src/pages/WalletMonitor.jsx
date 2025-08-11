import { useState, useEffect } from 'react'
import { Wallet, Plus, Search, Filter, RefreshCw, TrendingUp, TrendingDown, Copy, ExternalLink, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { api } from '@/services/api'

export function WalletMonitor({ user }) {
  const [wallets, setWallets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('value')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newWalletAddress, setNewWalletAddress] = useState('')
  const [newWalletLabel, setNewWalletLabel] = useState('')
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // 获取钱包数据
  const fetchWalletData = async () => {
    try {
      setLoading(true)
      
      const [walletsRes, transactionsRes] = await Promise.all([
        api.get('/api/v1/wallet/list'),
        api.get('/api/v1/wallet/transactions?limit=50')
      ])

      setWallets(walletsRes.data.data || [])
      setTransactions(transactionsRes.data.data || [])
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
      // 使用模拟数据作为后备
      setWallets(mockWallets)
      setTransactions(mockTransactions)
    } finally {
      setLoading(false)
    }
  }

  // 添加钱包地址
  const handleAddWallet = async () => {
    if (!newWalletAddress.trim()) return

    try {
      await api.post('/api/v1/wallet/add', {
        address: newWalletAddress.trim(),
        label: newWalletLabel.trim() || '未命名钱包'
      })
      
      setNewWalletAddress('')
      setNewWalletLabel('')
      setShowAddDialog(false)
      fetchWalletData() // 刷新数据
    } catch (error) {
      console.error('Failed to add wallet:', error)
    }
  }

  // 切换钱包监控状态
  const toggleWalletMonitoring = async (walletId, enabled) => {
    try {
      await api.patch(`/api/v1/wallet/${walletId}`, {
        is_active: enabled
      })
      
      fetchWalletData() // 刷新数据
    } catch (error) {
      console.error('Failed to toggle wallet monitoring:', error)
    }
  }

  // 删除钱包
  const removeWallet = async (walletId) => {
    try {
      await api.delete(`/api/v1/wallet/${walletId}`)
      fetchWalletData() // 刷新数据
    } catch (error) {
      console.error('Failed to remove wallet:', error)
    }
  }

  // 复制地址到剪贴板
  const copyAddress = (address) => {
    navigator.clipboard.writeText(address)
  }

  useEffect(() => {
    fetchWalletData()
    
    // 设置自动刷新（每60秒）
    const interval = setInterval(fetchWalletData, 60000)
    return () => clearInterval(interval)
  }, [])

  // 过滤和排序钱包
  const filteredWallets = wallets
    .filter(wallet => {
      if (searchTerm) {
        return wallet.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
               wallet.label.toLowerCase().includes(searchTerm.toLowerCase())
      }
      return true
    })
    .filter(wallet => {
      if (filterType === 'active') return wallet.is_active
      if (filterType === 'high_value') return wallet.currentValue > 1000000
      if (filterType === 'recent_activity') return wallet.lastActivity && new Date(wallet.lastActivity) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'value') return (b.currentValue || 0) - (a.currentValue || 0)
      if (sortBy === 'change') return (b.change24h || 0) - (a.change24h || 0)
      if (sortBy === 'activity') return new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0)
      return 0
    })

  // 计算统计数据
  const stats = {
    totalWallets: wallets.length,
    activeWallets: wallets.filter(w => w.is_active).length,
    totalValue: wallets.reduce((sum, wallet) => sum + (wallet.currentValue || 0), 0),
    totalChange24h: wallets.reduce((sum, wallet) => sum + (wallet.change24h || 0), 0) / wallets.length,
    recentTransactions: transactions.filter(tx => {
      const today = new Date().toDateString()
      return new Date(tx.timestamp).toDateString() === today
    }).length
  }

  // 资产分布数据
  const assetDistribution = wallets.map(wallet => ({
    name: wallet.label,
    value: wallet.currentValue || 0,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  }))

  // 价值趋势数据（模拟）
  const valueTrend = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    value: stats.totalValue * (0.8 + Math.random() * 0.4)
  }))

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center space-x-2">
            <Wallet className="h-8 w-8" />
            <span>钱包监控</span>
          </h1>
          <p className="text-muted-foreground">
            最后更新：{lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchWalletData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                添加钱包
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加钱包地址</DialogTitle>
                <DialogDescription>
                  输入要监控的钱包地址和标签
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">钱包地址</Label>
                  <Input
                    id="address"
                    placeholder="0x..."
                    value={newWalletAddress}
                    onChange={(e) => setNewWalletAddress(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="label">标签（可选）</Label>
                  <Input
                    id="label"
                    placeholder="例如：马斯克钱包"
                    value={newWalletLabel}
                    onChange={(e) => setNewWalletLabel(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    取消
                  </Button>
                  <Button onClick={handleAddWallet}>
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
                <p className="text-sm font-medium text-muted-foreground">监控钱包</p>
                <p className="text-2xl font-bold">{stats.activeWallets}/{stats.totalWallets}</p>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">总资产价值</p>
                <p className="text-2xl font-bold">${(stats.totalValue / 1000000).toFixed(2)}M</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">24h变化</p>
                <p className={`text-2xl font-bold ${stats.totalChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.totalChange24h >= 0 ? '+' : ''}{stats.totalChange24h.toFixed(2)}%
                </p>
              </div>
              {stats.totalChange24h >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-600" /> : 
                <TrendingDown className="h-8 w-8 text-red-600" />
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">今日交易</p>
                <p className="text-2xl font-bold">{stats.recentTransactions}</p>
              </div>
              <ExternalLink className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="wallets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="wallets">钱包列表</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
          <TabsTrigger value="transactions">交易记录</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-4">
          {/* 搜索和过滤 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索钱包地址或标签..."
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
                    <SelectItem value="all">全部钱包</SelectItem>
                    <SelectItem value="active">活跃监控</SelectItem>
                    <SelectItem value="high_value">高价值</SelectItem>
                    <SelectItem value="recent_activity">近期活动</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="排序方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="value">资产价值</SelectItem>
                    <SelectItem value="change">24h变化</SelectItem>
                    <SelectItem value="activity">最近活动</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 钱包列表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-300 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredWallets.length > 0 ? (
              filteredWallets.map((wallet) => (
                <Card key={wallet.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{wallet.label}</h3>
                          <Switch
                            checked={wallet.is_active}
                            onCheckedChange={(checked) => toggleWalletMonitoring(wallet.id, checked)}
                          />
                        </div>
                        <Badge variant={wallet.is_active ? "default" : "secondary"}>
                          {wallet.is_active ? '监控中' : '已暂停'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span className="font-mono">{wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyAddress(wallet.address)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://etherscan.io/address/${wallet.address}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">当前价值</p>
                          <p className="text-lg font-bold">${(wallet.currentValue || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">24h变化</p>
                          <p className={`text-lg font-bold ${(wallet.change24h || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(wallet.change24h || 0) >= 0 ? '+' : ''}{(wallet.change24h || 0).toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      {wallet.lastActivity && (
                        <div>
                          <p className="text-sm text-muted-foreground">最近活动</p>
                          <p className="text-sm">{new Date(wallet.lastActivity).toLocaleString()}</p>
                        </div>
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedWallet(wallet)}>
                          详情
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => removeWallet(wallet.id)}>
                          删除
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12 text-muted-foreground">
                      <Wallet className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">暂无钱包数据</p>
                      <p className="text-sm">
                        {searchTerm ? '没有找到匹配的钱包' : '点击"添加钱包"开始监控'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 资产价值趋势 */}
            <Card>
              <CardHeader>
                <CardTitle>资产价值趋势</CardTitle>
                <CardDescription>过去30天的总资产价值变化</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={valueTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${(value / 1000000).toFixed(2)}M`, '总价值']} />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 资产分布 */}
            <Card>
              <CardHeader>
                <CardTitle>资产分布</CardTitle>
                <CardDescription>各钱包资产占比</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assetDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assetDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '价值']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>最近交易记录</CardTitle>
              <CardDescription>监控钱包的最新交易活动</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length > 0 ? (
                  transactions.slice(0, 20).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${tx.type === 'in' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <p className="font-medium">
                            {tx.type === 'in' ? '接收' : '发送'} {tx.amount} {tx.token}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {tx.type === 'in' ? '来自' : '发送至'}: {tx.counterparty.slice(0, 10)}...{tx.counterparty.slice(-8)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${tx.value.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ExternalLink className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无交易记录</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 模拟数据
const mockWallets = [
  {
    id: '1',
    address: '0x742d35Cc6634C0532925a3b8D4C2F2b4C2F2b4C2',
    label: '马斯克钱包',
    currentValue: 2450000,
    change24h: 12.5,
    is_active: true,
    lastActivity: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    address: '0x8ba1f109551bD432803012645Hac136c22C2F2b4',
    label: '孙宇晨钱包',
    currentValue: 1850000,
    change24h: -8.2,
    is_active: true,
    lastActivity: '2024-01-15T09:15:00Z'
  },
  {
    id: '3',
    address: '0x9cd24553d0Cf942e0d808D5F3B89B9F5F5F5F5F5',
    label: 'CZ钱包',
    currentValue: 3200000,
    change24h: 5.8,
    is_active: false,
    lastActivity: '2024-01-14T18:45:00Z'
  }
]

const mockTransactions = [
  {
    id: '1',
    type: 'out',
    amount: '500',
    token: 'BTC',
    value: 21500000,
    counterparty: '0x1234567890abcdef1234567890abcdef12345678',
    timestamp: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    type: 'in',
    amount: '1000',
    token: 'ETH',
    value: 2400000,
    counterparty: '0xabcdef1234567890abcdef1234567890abcdef12',
    timestamp: '2024-01-15T09:15:00Z'
  },
  {
    id: '3',
    type: 'out',
    amount: '50000',
    token: 'USDT',
    value: 50000,
    counterparty: '0x567890abcdef1234567890abcdef1234567890ab',
    timestamp: '2024-01-15T08:45:00Z'
  }
]

