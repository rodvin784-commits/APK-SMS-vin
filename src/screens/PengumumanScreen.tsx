import { useEffect, useState } from 'react'
import { fetchPengumuman } from '../lib/api'
import type { PengumumanItem } from '../lib/types'
import { formatTanggal, mapErrorMessage } from '../lib/format'
import Loading from '../components/ui/Loading'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { MdCampaign } from 'react-icons/md'

export default function PengumumanScreen() {
  const [items, setItems] = useState<PengumumanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [muatUlang, setMuatUlang] = useState(0)

  useEffect(() => {
    async function init() {
      try {
        const data = await fetchPengumuman()
        setItems(data)
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

  if (loading) return <Loading message="Memuat pengumuman..." />
  if (error) {
    return (
      <div className="screen">
        <Alert variant="error" action={<Button variant="secondary" onClick={muat}>Coba lagi</Button>}>{error}</Alert>
      </div>
    )
  }

  if (items.length === 0) return <div className="screen"><EmptyState message="Belum ada pengumuman." icon={<MdCampaign size={42} color="#cbd5e1" />} /></div>

  return (
    <div className="screen">
      {items.map((p) => (
        <div key={p.id} className="item-card">
          <div className="item-head"><strong>{p.judul}</strong></div>
          <span className="item-meta">{p.guru_nama}</span>
          <p className="item-desc">{p.isi}</p>
          <small className="item-tanggal">{formatTanggal(p.created_at)}</small>
        </div>
      ))}
    </div>
  )
}
