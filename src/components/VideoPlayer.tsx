interface VideoPlayerProps {
  src: string
  poster?: string
}

export function VideoPlayer({ src, poster }: VideoPlayerProps) {
  return (
    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
      <video
        src={src}
        poster={poster}
        controls
        controlsList="nodownload"
        preload="metadata"
        className="w-full h-full object-contain"
        playsInline
      >
        您的浏览器不支持视频播放
      </video>
    </div>
  )
}
