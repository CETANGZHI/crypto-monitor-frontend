import { useState } from 'react'
import { Heart, MessageCircle, Repeat2, ExternalLink, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TwitterUserProfile } from '@/components/TwitterUserProfile'

export function TweetCard({ tweet }) {
  const [showUserProfile, setShowUserProfile] = useState(false)
  
  const {
    id,
    username,
    displayName,
    avatar,
    content,
    contentZh,
    publishedAt,
    likeCount,
    retweetCount,
    replyCount,
    isVerified
  } = tweet

  const formatCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  const formatTime = (dateString) => {
    const now = new Date()
    const tweetTime = new Date(dateString)
    const diffInMinutes = Math.floor((now - tweetTime) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`
    return `${Math.floor(diffInMinutes / 1440)}天前`
  }

  const handleUserClick = () => {
    setShowUserProfile(true)
  }

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:border-accent/50">
        {/* 用户信息 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <img
              src={avatar}
              alt={displayName}
              className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleUserClick}
            />
            <div>
              <div className="flex items-center space-x-2">
                <span 
                  className="font-semibold text-foreground cursor-pointer hover:underline"
                  onClick={handleUserClick}
                >
                  {displayName}
                </span>
                {isVerified && (
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-primary h-6 px-2"
                  onClick={handleUserClick}
                >
                  <Wallet className="h-3 w-3 mr-1" />
                  钱包
                </Button>
              </div>
              <span className="text-muted-foreground text-sm">@{username}</span>
            </div>
          </div>
          <span className="text-muted-foreground text-sm">{formatTime(publishedAt)}</span>
        </div>

        {/* 推文内容 */}
        <div className="mb-4">
          <p className="text-foreground mb-2 leading-relaxed">{content}</p>
          {contentZh && (
            <p className="text-muted-foreground text-sm leading-relaxed border-l-2 border-accent/30 pl-3">
              {contentZh}
            </p>
          )}
        </div>

        {/* 互动数据 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-muted-foreground hover:text-primary cursor-pointer transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{formatCount(replyCount)}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground hover:text-chart-3 cursor-pointer transition-colors">
              <Repeat2 className="h-4 w-4" />
              <span className="text-sm">{formatCount(retweetCount)}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground hover:text-destructive cursor-pointer transition-colors">
              <Heart className="h-4 w-4" />
              <span className="text-sm">{formatCount(likeCount)}</span>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ExternalLink className="h-4 w-4 mr-2" />
            查看详情
          </Button>
        </div>
      </div>

      {/* 用户资料弹窗 */}
      <TwitterUserProfile
        username={username}
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />
    </>
  )
}

