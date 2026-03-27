"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThumbsUp, Share2, MessageCircle, Play, Bell, Users, Send, Facebook, Linkedin, Copy, Check } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Custom X icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

interface Video {
  id: string
  title: string
  description: string
  video_url: string
  video_type: string
  thumbnail_url: string
  category: string
  is_featured: boolean
  is_live: boolean
  view_count: number
  like_count: number
  duration: string
}

interface ChatMessage {
  id: string
  user: string
  message: string
  time: string
}

// Extract video ID from YouTube/Vimeo URL
function getVideoEmbedUrl(url: string, type: string): string {
  if (type === 'youtube') {
    // Handle various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    const videoId = match && match[2].length === 11 ? match[2] : null
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url
  } else if (type === 'vimeo') {
    // Handle Vimeo URLs
    const regExp = /vimeo\.com\/(\d+)/
    const match = url.match(regExp)
    const videoId = match ? match[1] : null
    return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1` : url
  }
  return url
}

// Get thumbnail from YouTube URL
function getYouTubeThumbnail(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  const videoId = match && match[2].length === 11 ? match[2] : null
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''
}

export default function DirectPage() {
  const { t, locale } = useI18n()
  const [activeFilter, setActiveFilter] = useState("all")
  const [videos, setVideos] = useState<Video[]>([])
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [likes, setLikes] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'Marie K.', message: 'Super emission!', time: '14:32' },
    { id: '2', user: 'Jean P.', message: 'Tres instructif, merci', time: '14:33' },
    { id: '3', user: 'Awa D.', message: 'On peut avoir plus de details sur le materiel?', time: '14:35' },
  ])
  const [newMessage, setNewMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [liveContent, setLiveContent] = useState({
    title: 'Masterclass : La lumiere en exterieur jour',
    description: 'Rejoignez-nous pour une session pratique sur la gestion du contraste et le debouchage en lumiere naturelle.',
    is_live: false,
    stream_url: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // Fetch videos
      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .eq('active', true)
        .order('published_at', { ascending: false })
      
      // Fetch live content settings
      const { data: liveSettings } = await supabase
        .from('site_content')
        .select('key, value')
        .eq('section', 'direct')
      
      if (videosData && videosData.length > 0) {
        setVideos(videosData)
        // Find featured or live video
        const featured = videosData.find(v => v.is_live) || videosData.find(v => v.is_featured) || videosData[0]
        setFeaturedVideo(featured)
        setLikes(featured.like_count || 0)
      }
      
      if (liveSettings) {
        const settings: Record<string, string> = {}
        liveSettings.forEach(item => {
          settings[item.key] = item.value
        })
        setLiveContent({
          title: settings.title || liveContent.title,
          description: settings.description || liveContent.description,
          is_live: settings.is_live === 'true',
          stream_url: settings.stream_url || ''
        })
      }
    }
    
    fetchData()
  }, [])

  const filters = [
    { id: "all", label: t("live.filters.all") },
    { id: "emission", label: "Emissions" },
    { id: "interview", label: "Interviews" },
    { id: "reportage", label: "Reportages" },
  ]

  const filteredVideos = activeFilter === "all" 
    ? videos.filter(v => v.id !== featuredVideo?.id)
    : videos.filter(v => v.category === activeFilter && v.id !== featuredVideo?.id)

  const handleLike = async () => {
    if (!featuredVideo) return
    
    const newLikeCount = hasLiked ? likes - 1 : likes + 1
    setLikes(newLikeCount)
    setHasLiked(!hasLiked)
    
    // Update in database
    const supabase = createClient()
    await supabase
      .from('videos')
      .update({ like_count: newLikeCount })
      .eq('id', featuredVideo.id)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      user: 'Vous',
      message: newMessage,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
    setChatMessages([...chatMessages, message])
    setNewMessage('')
  }

  const handleShare = (platform: string) => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const title = featuredVideo?.title || liveContent.title
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'x':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        break
    }
  }

  const selectVideo = (video: Video) => {
    setFeaturedVideo(video)
    setLikes(video.like_count || 0)
    setHasLiked(false)
    setIsPlaying(true) // Auto-play when selecting
    
    // Scroll to player
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
    
    // Update view count
    const supabase = createClient()
    supabase
      .from('videos')
      .update({ view_count: (video.view_count || 0) + 1 })
      .eq('id', video.id)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Live Section */}
        <div className="mb-12">
          {/* Title */}
          <div className="flex items-center gap-2 mb-6">
            <span className={`w-3 h-3 rounded-full ${liveContent.is_live || featuredVideo?.is_live ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
            <h1 className="text-xl font-bold text-foreground">
              {liveContent.is_live || featuredVideo?.is_live ? t("live.title") : 'Replay'} <span className="text-muted-foreground font-normal">| {t("live.subtitle")}</span>
            </h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <div className="relative aspect-video bg-card rounded-lg overflow-hidden group">
                {isPlaying && featuredVideo ? (
                  <iframe
                    src={getVideoEmbedUrl(featuredVideo.video_url, featuredVideo.video_type)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <Image
                      src={featuredVideo?.thumbnail_url || (featuredVideo?.video_type === 'youtube' ? getYouTubeThumbnail(featuredVideo?.video_url || '') : '') || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=450&fit=crop"}
                      alt={featuredVideo?.title || "Live stream"}
                      fill
                      className="object-cover"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Live badge and viewers */}
                    <div className="absolute top-4 right-4 flex items-center gap-3">
                      {(liveContent.is_live || featuredVideo?.is_live) && (
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          {t("live.badge")}
                        </span>
                      )}
                      <span className="bg-black/60 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {featuredVideo?.view_count || 124} {t("live.viewers")}
                      </span>
                    </div>

                    {/* Play button */}
                    <button 
                      className="absolute inset-0 flex items-center justify-center"
                      onClick={() => setIsPlaying(true)}
                    >
                      <div className="w-20 h-20 bg-primary/90 hover:bg-primary rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                        <Play className="w-10 h-10 text-white ml-1" fill="white" />
                      </div>
                    </button>

                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h2 className="text-xl font-bold text-white mb-2">
                        {featuredVideo?.title || liveContent.title}
                      </h2>
                      <p className="text-white/80 text-sm">
                        {featuredVideo?.description || liveContent.description}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Video controls */}
              <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <Button 
                    variant={hasLiked ? "default" : "outline"} 
                    size="sm" 
                    className="gap-2"
                    onClick={handleLike}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {t("live.like")} ({likes})
                  </Button>
                  
                  {/* Share Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Share2 className="w-4 h-4" />
                        {t("live.share")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Partager cette video</DialogTitle>
                      </DialogHeader>
                      <div className="flex justify-center gap-4 py-4">
                        <Button variant="outline" size="icon" onClick={() => handleShare('facebook')}>
                          <Facebook className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleShare('x')}>
                          <XIcon className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleShare('linkedin')}>
                          <Linkedin className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleShare('copy')}>
                          {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <Button 
                  variant={showChat ? "default" : "outline"} 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setShowChat(!showChat)}
                >
                  <MessageCircle className="w-4 h-4" />
                  {t("live.chat")}
                </Button>
              </div>
              
              {/* Chat Section */}
              {showChat && (
                <div className="mt-4 bg-card border border-border rounded-lg overflow-hidden">
                  <div className="p-3 border-b border-border bg-secondary/30">
                    <h3 className="font-semibold text-sm">Chat en direct</h3>
                  </div>
                  <div className="h-64 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                          {msg.user.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-medium text-sm">{msg.user}</span>
                            <span className="text-xs text-muted-foreground">{msg.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-border flex gap-2">
                    <Input 
                      placeholder="Votre message..." 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button size="icon" onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Video playlist */}
            <div className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 tracking-wider">
                A voir aussi
              </h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {videos.slice(0, 6).map((video) => (
                  <button
                    key={video.id}
                    onClick={() => selectVideo(video)}
                    className={`w-full flex gap-3 p-2 rounded-lg transition-colors text-left ${
                      featuredVideo?.id === video.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-secondary'
                    }`}
                  >
                    <div className="relative w-32 aspect-video rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={video.thumbnail_url || (video.video_type === 'youtube' ? getYouTubeThumbnail(video.video_url) : '') || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=120&fit=crop"}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                      {video.duration && (
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                          {video.duration}
                        </span>
                      )}
                      {video.is_live && (
                        <span className="absolute top-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm leading-tight line-clamp-2">
                        {video.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {video.view_count || 0} vues
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* All Videos Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t("live.trainings")}</h2>
              <p className="text-muted-foreground">{t("live.trainingsSubtitle")}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {filteredVideos.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredVideos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => selectVideo(video)}
                  className="group cursor-pointer text-left"
                >
                  <div className="relative aspect-video bg-card rounded-lg overflow-hidden mb-3">
                    <Image
                      src={video.thumbnail_url || (video.video_type === 'youtube' ? getYouTubeThumbnail(video.video_url) : '') || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=250&fit=crop"}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Duration badge */}
                    {video.duration && (
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </span>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {video.view_count || 0} vues • {video.like_count || 0} likes
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucune video disponible pour le moment.</p>
              <p className="text-sm mt-2">Ajoutez des videos via Supabase Studio (table: videos)</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
