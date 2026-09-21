import { useEffect, useState } from 'react'
import { downloadMateri, fetchMateri } from '../lib/api'
import type { MateriItem } from '../lib/types'
import { formatTanggal, mapErrorMessage } from '../lib/format'
import { cacheMateri, getCachedMateri } from '../lib/cache'
import { Card, CardHead, CardMeta, CardDesc, CardActions } from '../components/ui/Card'
import Alert from '../components/ui/Alert'
import Loading from '../components/ui/Loading'
import Button from '../components/ui/Button'

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

  if (loading) return <Loading message="Memuat materi..." />
  if (error) {
    return (
      <div className="screen">
        <Alert variant="error">{error}</Alert>
        <Button onClick={muat}>Coba lagi</Button>
      </div>
    )
  }

  return (
    <div className="screen">
      {materi.length === 0 ? (
        <p className="kosong">Belum ada materi.</p>
      ) : (
        materi.map((m) => (
          <Card key={m.id}>
            <CardHead><strong>{m.judul}</strong></CardHead>
            <CardMeta>{m.mapel_nama} · {m.guru_nama}</CardMeta>
            {m.deskripsi && <CardDesc>{m.deskripsi}</CardDesc>}
            <CardActions>
              {m.file_url ? (
                <Button
                  variant="secondary"
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
                </Button>
              ) : (
                <span className="item-meta">Tanpa file</span>
              )}
              <small className="item-tanggal">{formatTanggal(m.created_at)}</small>
            </CardActions>
          </Card>
        ))
      )}
    </div>
  )
}
