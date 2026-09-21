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

function youtubeThumbnail(url: string | null): string | null {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/)
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null
}

function thumbFor(v: VideoItem): string | null {
  return v.thumbnail_url || youtubeThumbnail(v.video_url)
}

export default function VideoScreen() {
  const [video, setVideo] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [muatUlang, setMuatUlang] = useState(0)
  const [playingId, setPlayingId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const data = await fetchVideo()
        setVideo(data)
        setError(null)
      } catch (err) {
        setError(mapErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [muatUlang])

  const muat = () => {
    setLoading(true)
    setMuatUlang((k) => k + 1)
  }

  if (loading) return <div className="loading">Memuat video...</div>
  if (error) {
    return (
      <div className="screen">
        <div className="alert alert-error">{error}</div>
        <button className="btn-primary" onClick={muat}>Coba lagi</button>
      </div>
    )
  }

  return (
    <div className="screen">
      {video.length === 0 ? (
        <p className="kosong">Belum ada video pembelajaran.</p>
      ) : (
        video.map((v) => {
          const embed = v.video_url ? youtubeEmbed(v.video_url) : null
          const thumb = thumbFor(v)
          const isPlaying = playingId === v.id
          return (
            <div key={v.id} className="item-card">
              {thumb && !isPlaying && (
                <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '10px', overflow: 'hidden', background: '#111', marginBottom: '0.6rem', cursor: embed ? 'pointer' : 'default' }} onClick={() => embed && setPlayingId(v.id)}>
                  <img src={thumb} alt={v.judul} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  {embed && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239,68,68,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: 'white' }}>▶</div>
                    </div>
                  )}
                </div>
              )}
              {isPlaying && embed ? (
                <div className="video-frame">
                  <iframe
                    src={`${embed}?autoplay=1`}
                    title={v.judul}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                  />
                </div>
              ) : v.video_url && !thumb ? (
                <a className="btn-secondary" href={v.video_url} target="_blank" rel="noreferrer" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                  ▶ Tonton di browser
                </a>
              ) : null}
              {thumb && isPlaying && v.video_url && (
                <a className="btn-secondary" href={v.video_url} target="_blank" rel="noreferrer" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                  ↗ Buka di YouTube
                </a>
              )}
              {thumb && !isPlaying && v.video_url && (
                <a className="btn-secondary" href={v.video_url} target="_blank" rel="noreferrer" style={{ marginBottom: '0.5rem', display: 'inline-block', marginLeft: '0.5rem' }}>
                  ↗ Buka link
                </a>
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
