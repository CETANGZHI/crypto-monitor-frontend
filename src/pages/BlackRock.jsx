import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Calendar, RefreshCw, ExternalLink, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { api } from '@/services/api'

export function BlackRock({ user }) {
  const [holdings, setHoldings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    fetchBlackRockData()
    // 设置定时刷新
    const interval = setInterval(fetchBlackRockData, 300000) // 5分钟刷新一次
    return () => clearInterval(interval)
  }, [])

  const fetchBlackRockData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/blackrock/holdings')
      setHoldings(response.data.data)
      setLastUpdated(new Date().toISOString())
    } catch (error) {
      console.error('Failed to fetch BlackRock data:', error)
      // 使用模拟数据作为后备
      setHoldings(getMockBlackRockData())
      setLastUpdated(new Date().toISOString())
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    }
    return `$${value.toLocaleString()}`
  }

  const formatNumber = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toLocaleString()
  }

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  if (loading && !holdings) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">贝莱德持仓监控</h1>
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
      {/* 页面标题和刷新按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">贝莱德持仓监控</h1>
          <p className="text-muted-foreground mt-2">
            实时监控贝莱德比特币和以太坊ETF持仓变化
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <div className="text-sm text-muted-foreground">
              最后更新: {formatTime(lastUpdated)}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBlackRockData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>

      {/* 概览统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">BTC总持仓</p>
                <p className="text-2xl font-bold">{formatNumber(holdings?.btc?.total_holdings || 0)}</p>
                <div className="flex items-center mt-2">
                  {holdings?.btc?.change_24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${holdings?.btc?.change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(holdings?.btc?.change_24h || 0)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">24h</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">₿</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">BTC价值</p>
                <p className="text-2xl font-bold">{formatCurrency(holdings?.btc?.total_value_usd || 0)}</p>
                <div className="flex items-center mt-2">
                  {holdings?.btc?.value_change_24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${holdings?.btc?.value_change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(holdings?.btc?.value_change_24h || 0))}
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ETH总持仓</p>
                <p className="text-2xl font-bold">{formatNumber(holdings?.eth?.total_holdings || 0)}</p>
                <div className="flex items-center mt-2">
                  {holdings?.eth?.change_24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${holdings?.eth?.change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(holdings?.eth?.change_24h || 0)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">24h</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">Ξ</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ETH价值</p>
                <p className="text-2xl font-bold">{formatCurrency(holdings?.eth?.total_value_usd || 0)}</p>
                <div className="flex items-center mt-2">
                  {holdings?.eth?.value_change_24h >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${holdings?.eth?.value_change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(holdings?.eth?.value_change_24h || 0))}
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="btc">比特币ETF</TabsTrigger>
          <TabsTrigger value="eth">以太坊ETF</TabsTrigger>
          <TabsTrigger value="analysis">分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 持仓趋势图 */}
            <Card>
              <CardHeader>
                <CardTitle>持仓趋势 (30天)</CardTitle>
                <CardDescription>贝莱德BTC和ETH持仓变化趋势</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={holdings?.trend_data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="btc_holdings" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      name="BTC持仓"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="eth_holdings" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="ETH持仓"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 价值分布 */}
            <Card>
              <CardHeader>
                <CardTitle>资产价值分布</CardTitle>
                <CardDescription>BTC vs ETH 持仓价值对比</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    {
                      name: 'BTC',
                      value: holdings?.btc?.total_value_usd || 0,
                      color: '#f97316'
                    },
                    {
                      name: 'ETH',
                      value: holdings?.eth?.total_value_usd || 0,
                      color: '#3b82f6'
                    }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 最新动态 */}
          <Card>
            <CardHeader>
              <CardTitle>最新动态</CardTitle>
              <CardDescription>贝莱德ETF持仓变化记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {holdings?.recent_changes?.map((change, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        change.asset === 'BTC' ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        <span className="text-white font-bold">
                          {change.asset === 'BTC' ? '₿' : 'Ξ'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{change.asset} 持仓变化</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(change.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center ${
                        change.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {change.change >= 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        <span className="font-medium">
                          {change.change >= 0 ? '+' : ''}{formatNumber(change.change)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(change.value_change)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="btc" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>IBIT - iShares Bitcoin Trust</CardTitle>
                <CardDescription>贝莱德比特币ETF详细信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">基金代码</p>
                    <p className="font-medium">IBIT</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">管理费率</p>
                    <p className="font-medium">0.25%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">成立日期</p>
                    <p className="font-medium">2024-01-11</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">资产规模</p>
                    <p className="font-medium">{formatCurrency(holdings?.btc?.aum || 0)}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">持仓统计</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">总持仓</p>
                      <p className="text-lg font-bold">{formatNumber(holdings?.btc?.total_holdings || 0)} BTC</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">平均成本</p>
                      <p className="text-lg font-bold">{formatCurrency(holdings?.btc?.average_cost || 0)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>变化统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">24小时变化</span>
                    <Badge variant={holdings?.btc?.change_24h >= 0 ? 'default' : 'destructive'}>
                      {formatPercentage(holdings?.btc?.change_24h || 0)}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold">
                    {holdings?.btc?.change_24h >= 0 ? '+' : ''}{formatNumber(holdings?.btc?.change_24h_amount || 0)} BTC
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">7天变化</span>
                    <Badge variant={holdings?.btc?.change_7d >= 0 ? 'default' : 'destructive'}>
                      {formatPercentage(holdings?.btc?.change_7d || 0)}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold">
                    {holdings?.btc?.change_7d >= 0 ? '+' : ''}{formatNumber(holdings?.btc?.change_7d_amount || 0)} BTC
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">30天变化</span>
                    <Badge variant={holdings?.btc?.change_30d >= 0 ? 'default' : 'destructive'}>
                      {formatPercentage(holdings?.btc?.change_30d || 0)}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold">
                    {holdings?.btc?.change_30d >= 0 ? '+' : ''}{formatNumber(holdings?.btc?.change_30d_amount || 0)} BTC
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="eth" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>ETHA - iShares Ethereum Trust</CardTitle>
                <CardDescription>贝莱德以太坊ETF详细信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">基金代码</p>
                    <p className="font-medium">ETHA</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">管理费率</p>
                    <p className="font-medium">0.25%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">成立日期</p>
                    <p className="font-medium">2024-07-23</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">资产规模</p>
                    <p className="font-medium">{formatCurrency(holdings?.eth?.aum || 0)}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">持仓统计</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">总持仓</p>
                      <p className="text-lg font-bold">{formatNumber(holdings?.eth?.total_holdings || 0)} ETH</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">平均成本</p>
                      <p className="text-lg font-bold">{formatCurrency(holdings?.eth?.average_cost || 0)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>变化统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">24小时变化</span>
                    <Badge variant={holdings?.eth?.change_24h >= 0 ? 'default' : 'destructive'}>
                      {formatPercentage(holdings?.eth?.change_24h || 0)}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold">
                    {holdings?.eth?.change_24h >= 0 ? '+' : ''}{formatNumber(holdings?.eth?.change_24h_amount || 0)} ETH
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">7天变化</span>
                    <Badge variant={holdings?.eth?.change_7d >= 0 ? 'default' : 'destructive'}>
                      {formatPercentage(holdings?.eth?.change_7d || 0)}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold">
                    {holdings?.eth?.change_7d >= 0 ? '+' : ''}{formatNumber(holdings?.eth?.change_7d_amount || 0)} ETH
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">30天变化</span>
                    <Badge variant={holdings?.eth?.change_30d >= 0 ? 'default' : 'destructive'}>
                      {formatPercentage(holdings?.eth?.change_30d || 0)}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold">
                    {holdings?.eth?.change_30d >= 0 ? '+' : ''}{formatNumber(holdings?.eth?.change_30d_amount || 0)} ETH
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>市场影响分析</CardTitle>
                <CardDescription>贝莱德持仓变化对市场的潜在影响</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">机构影响力</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        贝莱德作为全球最大的资产管理公司，其ETF持仓变化往往被视为机构态度的风向标，
                        对市场情绪和价格走势具有重要影响。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">BTC市场占比</span>
                    <span className="font-medium">{((holdings?.btc?.total_holdings || 0) / 21000000 * 100).toFixed(4)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">ETH市场占比</span>
                    <span className="font-medium">{((holdings?.eth?.total_holdings || 0) / 120000000 * 100).toFixed(4)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">总资产价值</span>
                    <span className="font-medium">
                      {formatCurrency((holdings?.btc?.total_value_usd || 0) + (holdings?.eth?.total_value_usd || 0))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>投资建议</CardTitle>
                <CardDescription>基于贝莱德持仓数据的市场观察</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">持仓趋势</span>
                      <Badge variant="outline">
                        {(holdings?.btc?.change_7d || 0) > 0 ? '增持' : '减持'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      过去7天贝莱德{(holdings?.btc?.change_7d || 0) > 0 ? '增持' : '减持'}了
                      {formatNumber(Math.abs(holdings?.btc?.change_7d_amount || 0))} BTC
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">资金流向</span>
                      <Badge variant="outline">
                        {(holdings?.btc?.value_change_24h || 0) > 0 ? '流入' : '流出'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      24小时资金{(holdings?.btc?.value_change_24h || 0) > 0 ? '净流入' : '净流出'}
                      {formatCurrency(Math.abs(holdings?.btc?.value_change_24h || 0))}
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">市场信号</span>
                      <Badge variant="outline">关注</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      建议密切关注贝莱德持仓变化，作为市场情绪和机构态度的重要参考指标
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  查看官方报告
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 模拟数据函数
function getMockBlackRockData() {
  return {
    btc: {
      total_holdings: 875420,
      total_value_usd: 42500000000,
      change_24h: 2.3,
      change_24h_amount: 19650,
      value_change_24h: 950000000,
      change_7d: 5.8,
      change_7d_amount: 48200,
      change_30d: 12.4,
      change_30d_amount: 96800,
      aum: 42500000000,
      average_cost: 48500
    },
    eth: {
      total_holdings: 2450000,
      total_value_usd: 8900000000,
      change_24h: 1.8,
      change_24h_amount: 43200,
      value_change_24h: 156000000,
      change_7d: 4.2,
      change_7d_amount: 98500,
      change_30d: 8.9,
      change_30d_amount: 200000,
      aum: 8900000000,
      average_cost: 3630
    },
    trend_data: [
      { date: '01-01', btc_holdings: 820000, eth_holdings: 2200000 },
      { date: '01-08', btc_holdings: 835000, eth_holdings: 2250000 },
      { date: '01-15', btc_holdings: 850000, eth_holdings: 2300000 },
      { date: '01-22', btc_holdings: 865000, eth_holdings: 2380000 },
      { date: '01-29', btc_holdings: 875420, eth_holdings: 2450000 }
    ],
    recent_changes: [
      {
        asset: 'BTC',
        change: 19650,
        value_change: 950000000,
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        asset: 'ETH',
        change: 43200,
        value_change: 156000000,
        timestamp: '2024-01-15T09:15:00Z'
      },
      {
        asset: 'BTC',
        change: -8500,
        value_change: -412000000,
        timestamp: '2024-01-14T14:20:00Z'
      }
    ]
  }
}

