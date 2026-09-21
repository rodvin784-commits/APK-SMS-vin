import { useEffect, useState } from 'react'
import { fetchNilai } from '../lib/api'
import type { NilaiItem } from '../lib/types'
import { mapErrorMessage } from '../lib/format'
import Loading from '../components/ui/Loading'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { MdEmojiEvents } from 'react-icons/md'

export default function NilaiScreen() {
  const [nilai, setNilai] = useState<NilaiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [muatUlang, setMuatUlang] = useState(0)

  useEffect(() => {
    async function init() {
      try {
        const data = await fetchNilai()
        setNilai(data)
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

  if (loading) return <Loading message="Memuat nilai..." />
  if (error) {
    return (
      <div className="screen">
        <Alert variant="error" action={<Button variant="secondary" onClick={muat}>Coba lagi</Button>}>{error}</Alert>
      </div>
    )
  }

  if (nilai.length === 0) return <div className="screen"><EmptyState message="Belum ada nilai." icon={<MdEmojiEvents size={42} color="#cbd5e1" />} /></div>

  return (
    <div className="screen">
      {nilai.map((n) => (
        <div key={n.id} className="item-card">
          <div className="item-head">
            <strong>{n.mapel_nama}</strong>
            <span className="badge badge-ok">{n.nilai_akhir ?? '—'}</span>
          </div>
          <span className="item-meta">{n.guru_nama} · {n.semester} · {n.tahun_ajaran}</span>
          <div className="nilai-grid">
            <div><small>Tugas</small><b>{n.tugas ?? '—'}</b></div>
            <div><small>UTS</small><b>{n.uts ?? '—'}</b></div>
            <div><small>UAS</small><b>{n.uas ?? '—'}</b></div>
          </div>
        </div>
      ))}
    </div>
  )
}
