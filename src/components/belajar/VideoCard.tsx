/**
 * VideoCard — Kartu satu video (dipakai di BelajarScreen).
 * Thumbnail YouTube → tap untuk putar inline; fallback tautan browser.
 */
import { Play } from 'lucide-react'
import type { VideoItem } from '../../lib/types'
import { formatTanggal } from '../../lib/format'

const VALID_YT_HOSTS = ['youtube.com', 'www.youtube.com', 'youtu.be']

function youtubeEmbed(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!VALID_YT_HOSTS.includes(parsed.hostname)) return null
    const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/)
    return m ? `https://www.youtube.com/embed/${m[1]}` : null
  } catch { return null }
}

function youtubeThumbnail(url: string | null): string | null {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/)
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null
}

interface Props {
  v: VideoItem
  playing: boolean
  onPlay: (id: string) => void
}

export default function VideoCard({ v, playing, onPlay }: Props) {
  const embed = v.video_url ? youtubeEmbed(v.video_url) : null
  const thumb = v.thumbnail_url || youtubeThumbnail(v.video_url)

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {thumb && !playing && (
        <button
          onClick={() => embed && onPlay(v.id)}
          disabled={!embed}
          aria-label={`Putar ${v.judul}`}
          className="relative block min-h-[44px] w-full"
        >
          <img
            src={thumb}
            alt=""
            aria-hidden
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            className="aspect-video w-full object-cover"
          />
          {embed && (
            <span className="absolute inset-0 flex items-center justify-center bg-slate-900/30" aria-hidden>
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                <Play className="ml-0.5 h-6 w-6 fill-current" />
              </span>
            </span>
          )}
        </button>
      )}
      {playing && embed ? (
        <div className="aspect-video w-full bg-black">
          <iframe
            src={`${embed}?autoplay=1`}
            title={v.judul}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation"
            className="h-full w-full"
          />
        </div>
      ) : v.video_url && !thumb ? (
        <div className="px-4 pt-4">
          <a
            href={v.video_url}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-[44px] items-center justify-center rounded-xl bg-slate-100 px-4 text-sm font-bold text-slate-700"
          >
            ▶ Tonton di browser
          </a>
        </div>
      ) : null}
      <div className="p-4">
        <h3 className="text-sm font-bold leading-snug text-slate-800">{v.judul}</h3>
        <p className="mt-0.5 truncate text-xs text-slate-500">{v.guru_nama} • {formatTanggal(v.created_at)}</p>
        {v.deskripsi && <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-600">{v.deskripsi}</p>}
      </div>
    </article>
  )
}
