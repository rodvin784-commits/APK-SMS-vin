import { useEffect, useState } from 'react'
import { fetchVideo } from '../lib/api'
import type { VideoItem } from '../lib/types'
import { formatTanggal, mapErrorMessage } from '../lib/format'

const VALID_YT_HOSTS = ['youtube.com', 'www.youtube.com', 'youtu.be']

// Ubah link YouTube biasa menjadi embed; validasi hostname terlebih dahulu.
function youtubeEmbed(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!VALID_YT_HOSTS.includes(parsed.hostname)) return null
    const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/)
    return m ? `https://www.youtube.com/embed/${m[1]}` : null
  } catch {
    return null
  }
}

// Memeriksa apakah URL berasal dari host YouTube yang valid.
function isYoutubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return VALID_YT_HOSTS.includes(parsed.hostname)
  } catch {
    return false
  }
}

export default function VideoScreen() {
  const [video, setVideo] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVideo()
      .then(setVideo)
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat video.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Memuat video...</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="screen">
      {video.length === 0 ? (
        <p className="kosong">Belum ada video pembelajaran.</p>
      ) : (
        video.map((v) => {
          const embed = v.video_url ? youtubeEmbed(v.video_url) : null
          return (
            <div key={v.id} className="item-card">
              {embed ? (
                <div className="video-frame">
                  <iframe
                    src={embed}
                    title={v.judul}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                v.video_url && (
                  <a className="btn-secondary" href={v.video_url} target="_blank" rel="noreferrer">
                    ▶ Tonton di browser
                  </a>
                )
              )}
              <div className="item-head">
                <strong>{v.judul}</strong>
              </div>
              <span className="item-meta">{v.mapel_nama} · {v.guru_nama}</span>
              {v.deskripsi && <p className="item-desc">{v.deskripsi}</p>}
              <small className="item-tanggal">{formatTanggal(v.created_at)}</small>
            </div>
          )
        })
      )}
    </div>
  )
}
