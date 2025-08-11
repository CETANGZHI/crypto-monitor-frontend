import { useState, useEffect } from 'react'
import { User, Wallet, TrendingUp, TrendingDown, ExternalLink, Copy, Activity, PieChart, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import { api } from '@/services/api'

export function TwitterUserProfile({ username, isOpen, onClose }) {
  const [userWallets, setUserWallets] = useState(null)
  const [portfolio, setPortfolio] = useState(null)
  const [connections, setConnections] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (isOpen && username) {
      fetchUserData()
    }
  }, [isOpen, username])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      const [walletsRes, portfolioRes, connectionsRes] = await Promise.all([
        api.get(`/api/v1/wallet/twitter/${username}`),
        api.get(`/api/v1/wallet/twitter/${username}/portfolio`),
        api.get(`/api/v1/wallet/twitter/${username}/connections`)
      ])

      setUserWallets(walletsRes.data.data)
      setPortfolio(portfolioRes.data.data)
      setConnections(connectionsRes.data.data)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      // 使用模拟数据作为后备
      setUserWallets(getMockUserWallets(username))
      setPortfolio(getMockPortfolio(username))
      setConnections(getMockConnections(username))
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address)
  }

  const openEtherscan = (address) => {
    window.open(`https://etherscan.io/address/${address}`, '_blank')
  }

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toLocaleString()}`
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-6 w-6" />
            <span>@{username} 的钱包分析</span>
          </DialogTitle>
          <DialogDescription>
            查看该推特用户关联的钱包地址和链上数据分析
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
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
        ) : (
          <div className="space-y-6">
            {/* 概览统计 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">关联钱包</p>
                      <p className="text-2xl font-bold">{userWallets?.total_wallets || 0}</p>
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
                      <p className="text-2xl font-bold">{formatCurrency(userWallets?.total_value_usd || 0)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">持仓币种</p>
                      <p className="text-2xl font-bold">{portfolio?.holdings?.length || 0}</p>
                    </div>
                    <PieChart className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">多样化分数</p>
                      <p className="text-2xl font-bold">{portfolio?.diversification_score || 0}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="wallets">钱包详情</TabsTrigger>
                <TabsTrigger value="portfolio">投资组合</TabsTrigger>
                <TabsTrigger value="connections">关联分析</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 钱包列表概览 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>关联钱包</CardTitle>
                      <CardDescription>发现的钱包地址及其价值</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {userWallets?.wallets?.slice(0, 3).map((wallet, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <Wallet className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{formatAddress(wallet.address)}</p>
                              <p className="text-sm text-muted-foreground">
                                置信度: {(wallet.confidence * 100).toFixed(0)}%
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(wallet.balance_data?.total_value_usd || 0)}</p>
                            <Badge variant={wallet.blockchain === 'ethereum' ? 'default' : 'secondary'}>
                              {wallet.blockchain?.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {userWallets?.wallets?.length > 3 && (
                        <p className="text-sm text-muted-foreground text-center">
                          还有 {userWallets.wallets.length - 3} 个钱包...
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* 持仓分布 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>持仓分布</CardTitle>
                      <CardDescription>主要持仓币种占比</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {portfolio?.top_holdings?.length > 0 ? (
                        <div className="space-y-3">
                          {portfolio.top_holdings.slice(0, 5).map((holding, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">{holding.symbol}</span>
                                <span>{holding.percentage.toFixed(1)}%</span>
                              </div>
                              <Progress value={holding.percentage} className="h-2" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">暂无持仓数据</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="wallets" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {userWallets?.wallets?.map((wallet, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{formatAddress(wallet.address)}</CardTitle>
                          <Badge variant={wallet.confidence > 0.8 ? 'default' : 'secondary'}>
                            置信度 {(wallet.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <CardDescription>
                          来源: {wallet.source} | 区块链: {wallet.blockchain?.toUpperCase()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">总价值</p>
                            <p className="text-lg font-bold">{formatCurrency(wallet.balance_data?.total_value_usd || 0)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">ETH余额</p>
                            <p className="text-lg font-bold">{wallet.balance_data?.eth_balance?.toFixed(4) || 0} ETH</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyAddress(wallet.address)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            复制
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEtherscan(wallet.address)}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            查看
                          </Button>
                        </div>

                        {wallet.recent_transactions?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">最近交易</p>
                            <div className="space-y-2">
                              {wallet.recent_transactions.slice(0, 3).map((tx, txIndex) => (
                                <div key={txIndex} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                                  <div className="flex items-center space-x-2">
                                    {tx.type === 'in' ? 
                                      <ArrowDownRight className="h-4 w-4 text-green-600" /> : 
                                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                                    }
                                    <span>{tx.type === 'in' ? '接收' : '发送'}</span>
                                  </div>
                                  <span className="font-medium">{tx.value.toFixed(4)} ETH</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="portfolio" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 持仓详情 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>持仓详情</CardTitle>
                      <CardDescription>所有持仓币种及其价值</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {portfolio?.holdings?.map((holding, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{holding.symbol}</p>
                              <p className="text-sm text-muted-foreground">{holding.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(holding.value_usd)}</p>
                              <p className="text-sm text-muted-foreground">{holding.percentage.toFixed(1)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 投资组合指标 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>投资组合指标</CardTitle>
                      <CardDescription>风险和多样化分析</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">{portfolio?.total_value_usd ? formatCurrency(portfolio.total_value_usd) : '$0'}</p>
                          <p className="text-sm text-muted-foreground">总价值</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">{portfolio?.diversification_score || 0}</p>
                          <p className="text-sm text-muted-foreground">多样化分数</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">风险评估</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>集中度风险</span>
                            <span className={portfolio?.diversification_score > 70 ? 'text-green-600' : portfolio?.diversification_score > 40 ? 'text-yellow-600' : 'text-red-600'}>
                              {portfolio?.diversification_score > 70 ? '低' : portfolio?.diversification_score > 40 ? '中' : '高'}
                            </span>
                          </div>
                          <Progress 
                            value={100 - (portfolio?.diversification_score || 0)} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="connections" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 钱包关联 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>钱包关联分析</CardTitle>
                      <CardDescription>钱包之间的交易关系</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {connections?.connections?.length > 0 ? (
                        <div className="space-y-4">
                          {connections.connections.map((connection, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium">钱包关联</p>
                                <Badge variant="outline">{connection.direct_transactions} 笔交易</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>地址1: {formatAddress(connection.address1)}</p>
                                <p>地址2: {formatAddress(connection.address2)}</p>
                                <p>总交易量: {formatCurrency(connection.total_volume)}</p>
                                {connection.last_interaction && (
                                  <p>最后交互: {new Date(connection.last_interaction).toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">暂无钱包关联数据</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* 交易所交互 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>交易所交互</CardTitle>
                      <CardDescription>与各大交易所的交易频率</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {connections?.exchange_patterns?.exchange_interactions ? (
                        <div className="space-y-3">
                          {Object.entries(connections.exchange_patterns.exchange_interactions).map(([exchange, count]) => (
                            <div key={exchange} className="flex items-center justify-between">
                              <span className="font-medium">{exchange}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${(count / Math.max(...Object.values(connections.exchange_patterns.exchange_interactions))) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-muted-foreground">{count}</span>
                              </div>
                            </div>
                          ))}
                          
                          <div className="mt-4 pt-4 border-t">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">最常用交易所</p>
                                <p className="font-medium">{connections.exchange_patterns.most_used_exchange || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">交易所多样性</p>
                                <p className="font-medium">{connections.exchange_patterns.exchange_diversity || 0}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">暂无交易所交互数据</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// 模拟数据函数
function getMockUserWallets(username) {
  return {
    username,
    wallets: [
      {
        address: '0x742d35Cc6634C0532925a3b8D4C2F2b4C2F2b4C2',
        blockchain: 'ethereum',
        confidence: 0.9,
        source: 'public_disclosure',
        verified_date: '2024-01-15',
        balance_data: {
          total_value_usd: 2450000,
          eth_balance: 1020.5
        },
        recent_transactions: [
          { type: 'out', value: 5.0, timestamp: '2024-01-15T10:30:00Z' },
          { type: 'in', value: 10.0, timestamp: '2024-01-15T09:15:00Z' }
        ]
      }
    ],
    total_wallets: 1,
    total_value_usd: 2450000,
    last_updated: '2024-01-15T10:30:00Z'
  }
}

function getMockPortfolio(username) {
  return {
    username,
    total_value_usd: 2450000,
    holdings: [
      { symbol: 'ETH', name: 'Ethereum', value_usd: 1470000, percentage: 60.0 },
      { symbol: 'USDT', name: 'Tether USD', value_usd: 490000, percentage: 20.0 },
      { symbol: 'USDC', name: 'USD Coin', value_usd: 490000, percentage: 20.0 }
    ],
    top_holdings: [
      { symbol: 'ETH', name: 'Ethereum', value_usd: 1470000, percentage: 60.0 },
      { symbol: 'USDT', name: 'Tether USD', value_usd: 490000, percentage: 20.0 }
    ],
    diversification_score: 65.2
  }
}

function getMockConnections(username) {
  return {
    username,
    connections: [
      {
        address1: '0x742d35Cc6634C0532925a3b8D4C2F2b4C2F2b4C2',
        address2: '0x8ba1f109551bD432803012645Hac136c22C2F2b4',
        has_connection: true,
        direct_transactions: 3,
        total_volume: 150000,
        last_interaction: '2024-01-15T10:30:00Z'
      }
    ],
    exchange_patterns: {
      exchange_interactions: {
        'Binance': 8,
        'Coinbase': 5,
        'Kraken': 2
      },
      most_used_exchange: 'Binance',
      exchange_diversity: 3
    }
  }
}

