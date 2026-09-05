'use client'

import {useState} from 'react'
import {urlFor} from '@sanity-lib/lib/image'

export type VideoTile = {title?: string; url?: string; thumbnail?: any}

/** Pulls the id out of a watch, share, or embed URL. */
export function youTubeId(url?: string): string | undefined {
  if (!url) return undefined
  const m = url.match(/(?:youtu\.be\/|\/embed\/|[?&]v=)([A-Za-z0-9_-]{6,})/)
  return m?.[1]
}

/**
 * Click-to-play facade: shows YouTube's own thumbnail (or a CMS override)
 * and only mounts the iframe once the viewer asks for it, so four players
 * don't load with the page.
 */
function VideoCard({video}: {video: VideoTile}) {
  const [playing, setPlaying] = useState(false)
  const id = youTubeId(video.url)
  if (!id) return null

  const custom = urlFor(video.thumbnail)?.width(480).height(270).url()
  const poster = custom || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

  return (
    <div className="relative overflow-hidden rounded-sm border border-neutral-200 bg-neutral-900">
      <div className="aspect-video">
        {playing ? (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={video.title || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${video.title || 'video'}`}
            className="group relative block h-full w-full"
          >
            <img src={poster} alt="" className="h-full w-full object-cover opacity-85 transition-opacity group-hover:opacity-100" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform group-hover:scale-110">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
      {video.title && (
        <div className="truncate bg-neutral-900 px-3 py-2 text-[11px] font-medium text-white">{video.title}</div>
      )}
    </div>
  )
}

export function VideoStrip({videos}: {videos?: VideoTile[]}) {
  if (!videos?.length) return null
  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {videos.map((v, i) => (
        <VideoCard key={i} video={v} />
      ))}
    </div>
  )
}
