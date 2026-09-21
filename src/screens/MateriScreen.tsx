import { useEffect, useState } from 'react'
import { downloadMateri, fetchMateri } from '../lib/api'
import type { MateriItem } from '../lib/types'
import { formatTanggal, mapErrorMessage } from '../lib/format'
import { cacheMateri, getCachedMateri } from '../lib/cache'

export default function MateriScreen() {
  const [materi, setMateri] = useState<MateriItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [muatUlang, setMuatUlang] = useState(0)

  useEffect(() => {
    async function init() {
      const cached = getCachedMateri()
      try {
        const data = await fetchMateri()
        setMateri(data)
        cacheMateri(data)
        setError(null)
      } catch (err) {
        if (cached) {
          setMateri(cached)
          setError('Menampilkan data cache (offline). ' + mapErrorMessage(err))
        } else {
          setError(mapErrorMessage(err))
        }
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

  if (loading) return <div className="loading">Memuat materi...</div>
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
      {materi.length === 0 ? (
        <p className="kosong">Belum ada materi.</p>
      ) : (
        materi.map((m) => (
          <div key={m.id} className="item-card">
            <div className="item-head">
              <strong>{m.judul}</strong>
            </div>
            <span className="item-meta">{m.mapel_nama} · {m.guru_nama}</span>
            {m.deskripsi && <p className="item-desc">{m.deskripsi}</p>}
            <div className="item-actions">
              {m.file_url ? (
                <button
                  className="btn-secondary"
                  onClick={async () => {
                    try {
                      const { url } = await downloadMateri(m.id)
                      window.open(url, '_blank')
                    } catch (err) {
                      setError(mapErrorMessage(err))
                    }
                  }}
                >
                  ⬇ {m.nama_file ?? 'Unduh file'}
                </button>
              ) : (
                <span className="item-meta">Tanpa file</span>
              )}
              <small className="item-tanggal">{formatTanggal(m.created_at)}</small>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
