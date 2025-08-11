import { useState, useEffect } from 'react'
import { Crown, Check, X, CreditCard, Calendar, Gift, Zap, Shield, Star, TrendingUp, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { api } from '@/services/api'

export function Subscription({ user }) {
  const [loading, setLoading] = useState(true)
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [paymentHistory, setPaymentHistory] = useState([])
  const [plans, setPlans] = useState([])

  useEffect(() => {
    fetchSubscriptionData()
    fetchPaymentHistory()
    fetchPlans()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/v1/subscription/status')
      setSubscriptionData(response.data.data)
    } catch (error) {
      console.error('Failed to fetch subscription data:', error)
      // 使用模拟数据作为后备
      setSubscriptionData(getMockSubscriptionData())
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentHistory = async () => {
    try {
      const response = await api.get('/api/v1/subscription/payment-history')
      setPaymentHistory(response.data.data)
    } catch (error) {
      console.error('Failed to fetch payment history:', error)
      setPaymentHistory(getMockPaymentHistory())
    }
  }

  const fetchPlans = async () => {
    try {
      const response = await api.get('/api/v1/subscription/plans')
      setPlans(response.data.data)
    } catch (error) {
      console.error('Failed to fetch plans:', error)
      setPlans(getMockPlans())
    }
  }

  const handleUpgrade = async (planId) => {
    try {
      const response = await api.post('/api/v1/subscription/upgrade', { plan_id: planId })
      // 重定向到支付页面
      window.open(response.data.payment_url, '_blank')
    } catch (error) {
      console.error('Failed to initiate upgrade:', error)
      alert('升级失败，请重试')
    }
  }

  const handleCancelSubscription = async () => {
    if (window.confirm('确定要取消订阅吗？取消后将在当前计费周期结束时停止服务。')) {
      try {
        await api.post('/api/v1/subscription/cancel')
        fetchSubscriptionData()
        alert('订阅取消成功')
      } catch (error) {
        console.error('Failed to cancel subscription:', error)
        alert('取消订阅失败，请重试')
      }
    }
  }

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const getTrialProgress = () => {
    if (!subscriptionData?.trial_start_date || !subscriptionData?.trial_end_date) return 0
    
    const start = new Date(subscriptionData.trial_start_date)
    const end = new Date(subscriptionData.trial_end_date)
    const now = new Date()
    
    const total = end - start
    const elapsed = now - start
    
    return Math.min(Math.max((elapsed / total) * 100, 0), 100)
  }

  const getTrialDaysRemaining = () => {
    if (!subscriptionData?.trial_end_date) return 0
    
    const end = new Date(subscriptionData.trial_end_date)
    const now = new Date()
    const diff = end - now
    
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">订阅管理</h1>
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
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">订阅管理</h1>
          <p className="text-muted-foreground mt-2">
            管理您的订阅计划和付费服务
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {subscriptionData?.status === 'trial' ? '试用中' : 
           subscriptionData?.status === 'active' ? '已订阅' : '未订阅'}
        </Badge>
      </div>

      {/* 当前订阅状态 */}
      <Card className={`${
        subscriptionData?.status === 'trial' ? 'border-orange-200 bg-orange-50 dark:bg-orange-950' :
        subscriptionData?.status === 'active' ? 'border-green-200 bg-green-50 dark:bg-green-950' :
        'border-gray-200'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {subscriptionData?.status === 'trial' ? (
              <Gift className="h-5 w-5 text-orange-600" />
            ) : subscriptionData?.status === 'active' ? (
              <Crown className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-gray-600" />
            )}
            <span>当前订阅状态</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptionData?.status === 'trial' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">免费试用</h3>
                  <p className="text-sm text-muted-foreground">
                    试用期剩余 {getTrialDaysRemaining()} 天
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">免费</p>
                  <p className="text-sm text-muted-foreground">
                    到期时间: {formatDate(subscriptionData.trial_end_date)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>试用进度</span>
                  <span>{Math.round(getTrialProgress())}%</span>
                </div>
                <Progress value={getTrialProgress()} className="h-2" />
              </div>
              
              <div className="flex items-center space-x-2 p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  试用期结束后，您需要升级到付费计划才能继续使用通知功能
                </p>
              </div>
            </div>
          )}

          {subscriptionData?.status === 'active' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{subscriptionData.plan_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    下次续费: {formatDate(subscriptionData.next_billing_date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(subscriptionData.amount)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    /{subscriptionData.billing_cycle === 'monthly' ? '月' : '年'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{subscriptionData.max_follows}</p>
                  <p className="text-sm text-muted-foreground">监控数量</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">∞</p>
                  <p className="text-sm text-muted-foreground">通知数量</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-sm text-muted-foreground">技术支持</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">✓</p>
                  <p className="text-sm text-muted-foreground">高级功能</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => handleUpgrade(subscriptionData.plan_id)}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  升级计划
                </Button>
                <Button variant="outline" onClick={handleCancelSubscription}>
                  取消订阅
                </Button>
              </div>
            </div>
          )}

          {subscriptionData?.status === 'inactive' && (
            <div className="text-center space-y-4">
              <div>
                <h3 className="text-lg font-semibold">未订阅</h3>
                <p className="text-sm text-muted-foreground">
                  选择一个计划开始使用完整功能
                </p>
              </div>
              <Button onClick={() => document.getElementById('plans-tab').click()}>
                <Crown className="h-4 w-4 mr-2" />
                查看订阅计划
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="plans" id="plans-tab">订阅计划</TabsTrigger>
          <TabsTrigger value="history">付费历史</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 使用统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">使用统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>监控账号</span>
                    <span>{subscriptionData?.current_follows || 0} / {subscriptionData?.max_follows || 0}</span>
                  </div>
                  <Progress 
                    value={((subscriptionData?.current_follows || 0) / (subscriptionData?.max_follows || 1)) * 100} 
                    className="h-2" 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>本月通知</span>
                    <span>{subscriptionData?.notifications_this_month || 0}</span>
                  </div>
                  <Progress 
                    value={Math.min((subscriptionData?.notifications_this_month || 0) / 1000 * 100, 100)} 
                    className="h-2" 
                  />
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">账户状态</span>
                    <Badge variant={subscriptionData?.status === 'active' ? 'default' : 'secondary'}>
                      {subscriptionData?.status === 'active' ? '正常' : '受限'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 功能对比 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">功能权限</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">推特监控</span>
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">钱包监控</span>
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">价格提醒</span>
                  {subscriptionData?.status === 'active' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">高级分析</span>
                  {subscriptionData?.status === 'active' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API访问</span>
                  {subscriptionData?.status === 'active' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 账单信息 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">账单信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {subscriptionData?.status === 'active' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">当前计划</span>
                      <span className="font-medium">{subscriptionData.plan_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">月费用</span>
                      <span className="font-medium">{formatCurrency(subscriptionData.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">下次扣费</span>
                      <span className="font-medium">{formatDate(subscriptionData.next_billing_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">付款方式</span>
                      <span className="font-medium">**** 1234</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <CreditCard className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">暂无账单信息</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative ${
                plan.recommended ? 'border-blue-500 shadow-lg' : ''
              }`}>
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      推荐
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                    <span className="text-muted-foreground">/{plan.billing_cycle === 'monthly' ? '月' : '年'}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full" 
                    variant={plan.recommended ? 'default' : 'outline'}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={subscriptionData?.plan_id === plan.id}
                  >
                    {subscriptionData?.plan_id === plan.id ? '当前计划' : 
                     subscriptionData?.status === 'active' ? '升级到此计划' : '选择此计划'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>常见问题</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">如何取消订阅？</h4>
                <p className="text-sm text-muted-foreground">
                  您可以随时在订阅管理页面取消订阅。取消后，您的服务将在当前计费周期结束时停止。
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">支持哪些付款方式？</h4>
                <p className="text-sm text-muted-foreground">
                  我们支持信用卡、借记卡、PayPal、支付宝和微信支付等多种付款方式。
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">可以随时升级或降级吗？</h4>
                <p className="text-sm text-muted-foreground">
                  是的，您可以随时升级或降级您的订阅计划。费用将按比例调整。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>付费历史</CardTitle>
              <CardDescription>
                查看您的所有付费记录和发票
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">暂无付费记录</h3>
                  <p className="text-muted-foreground">
                    您还没有任何付费记录
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          payment.status === 'success' ? 'bg-green-100 dark:bg-green-900' : 
                          payment.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900' :
                          'bg-red-100 dark:bg-red-900'
                        }`}>
                          {payment.status === 'success' ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : payment.status === 'pending' ? (
                            <RefreshCw className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <X className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{payment.plan_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(payment.created_at)} • 订单号: {payment.order_id}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            payment.status === 'success' ? 'default' :
                            payment.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {payment.status === 'success' ? '已支付' :
                             payment.status === 'pending' ? '处理中' : '失败'}
                          </Badge>
                          {payment.invoice_url && (
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 模拟数据函数
function getMockSubscriptionData() {
  return {
    status: 'trial',
    plan_name: '免费试用',
    plan_id: 'trial',
    amount: 0,
    billing_cycle: 'monthly',
    trial_start_date: '2024-01-10T00:00:00Z',
    trial_end_date: '2024-01-13T00:00:00Z',
    next_billing_date: '2024-01-13T00:00:00Z',
    max_follows: 5,
    current_follows: 3,
    notifications_this_month: 45
  }
}

function getMockPaymentHistory() {
  return [
    {
      id: 1,
      order_id: 'ORD-2024-001',
      plan_name: '专业版 - 月付',
      amount: 29.99,
      status: 'success',
      created_at: '2024-01-01T00:00:00Z',
      invoice_url: 'https://example.com/invoice/1'
    },
    {
      id: 2,
      order_id: 'ORD-2023-012',
      plan_name: '基础版 - 月付',
      amount: 9.99,
      status: 'success',
      created_at: '2023-12-01T00:00:00Z',
      invoice_url: 'https://example.com/invoice/2'
    }
  ]
}

function getMockPlans() {
  return [
    {
      id: 'basic',
      name: '基础版',
      description: '适合个人用户的基础监控功能',
      price: 9.99,
      billing_cycle: 'monthly',
      recommended: false,
      features: [
        '监控 10 个推特账号',
        '监控 5 个钱包地址',
        '基础通知功能',
        '邮件支持'
      ]
    },
    {
      id: 'pro',
      name: '专业版',
      description: '适合专业交易者的完整功能',
      price: 29.99,
      billing_cycle: 'monthly',
      recommended: true,
      features: [
        '监控 50 个推特账号',
        '监控 20 个钱包地址',
        '高级通知功能',
        '价格提醒',
        '高级分析',
        '优先支持'
      ]
    },
    {
      id: 'enterprise',
      name: '企业版',
      description: '适合机构和团队的企业级功能',
      price: 99.99,
      billing_cycle: 'monthly',
      recommended: false,
      features: [
        '无限监控账号',
        '无限钱包地址',
        '全部高级功能',
        'API 访问',
        '自定义集成',
        '24/7 专属支持'
      ]
    }
  ]
}

