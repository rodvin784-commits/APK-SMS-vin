import { useEffect, useState } from 'react'
import { fetchNotifikasi, tandaiNotifikasiDibaca } from '../lib/api'
import type { NotifikasiItem } from '../lib/types'
import { formatTanggalJam, mapErrorMessage } from '../lib/format'
import Loading from '../components/ui/Loading'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { MdNotificationsNone } from 'react-icons/md'

interface Props { onCountChange?: (count: number) => void }

export default function NotifikasiScreen({ onCountChange }: Props) {
  const [items, setItems] = useState<NotifikasiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [muatUlang, setMuatUlang] = useState(0)

  useEffect(() => {
    async function init() {
      try {
        const { items, belumDibaca } = await fetchNotifikasi()
        setItems(items)
        setError(null)
        onCountChange?.(belumDibaca)
      } catch (err) {
        setError(mapErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [onCountChange, muatUlang])

  const muat = () => {
    setLoading(true)
    setMuatUlang((k) => k + 1)
  }

  const tandaiSemua = async () => {
    const belum = items.filter((n) => !n.is_read).map((n) => n.id)
    if (belum.length === 0) return
    try {
      await tandaiNotifikasiDibaca(belum)
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
      onCountChange?.(0)
    } catch (err) {
      setError(mapErrorMessage(err))
    }
  }

  if (loading) return <Loading message="Memuat notifikasi..." />

  return (
    <div className="screen">
      <div className="screen-toolbar">
        <span className="item-meta">{items.filter((n) => !n.is_read).length} belum dibaca</span>
        <Button variant="secondary" onClick={tandaiSemua}>✓ Tandai semua dibaca</Button>
      </div>

      {error && <Alert variant="error" action={<Button variant="secondary" onClick={muat}>Coba lagi</Button>}>{error}</Alert>}

      {items.length === 0 ? (
        <EmptyState message="Belum ada notifikasi." icon={<MdNotificationsNone size={42} color="#cbd5e1" />} />
      ) : (
        items.map((n) => (
          <div key={n.id} className={`item-card ${n.is_read ? 'notif-read' : 'notif-unread'}`}>
            <div className="item-head">
              <strong>{n.judul}</strong>
              {!n.is_read && <span className="badge badge-warn">Baru</span>}
            </div>
            {n.pesan && <p className="item-desc">{n.pesan}</p>}
            <small className="item-tanggal">{formatTanggalJam(n.created_at)}</small>
          </div>
        ))
      )}
    </div>
  )
}
