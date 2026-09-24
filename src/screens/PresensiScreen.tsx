import { useEffect, useState } from 'react'
import { fetchPresensi } from '../lib/api'
import type { PresensiItem } from '../lib/types'
import { formatTanggal, mapErrorMessage } from '../lib/format'
import Loading from '../components/ui/Loading'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { MdOutlineCalendarMonth } from 'react-icons/md'

const STATUS_COLOR: Record<string, string> = {
  hadir: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  izin: 'bg-blue-50 text-blue-700 border-blue-100',
  sakit: 'bg-amber-50 text-amber-700 border-amber-100',
  alpha: 'bg-rose-50 text-rose-700 border-rose-100',
}

export default function PresensiScreen() {
  const [data, setData] = useState<PresensiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    async function init() {
      try {
        const res = await fetchPresensi()
        setData(res)
        setError(null)
      } catch (err) {
        setError(mapErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [reload])

  if (loading) return <Loading message="Memuat presensi..." />
  if (error) return <div className="screen"><Alert variant="error" action={<Button variant="secondary" onClick={() => { setLoading(true); setReload(k=>k+1)}}>Coba lagi</Button>}>{error}</Alert></div>
  if (data.length===0) return <div className="screen"><EmptyState message="Belum ada data presensi." icon={<MdOutlineCalendarMonth size={42} color="#cbd5e1" />} /></div>

  const hadir = data.filter(d=>d.status==='hadir').length
  return (
    <div className="screen">
      <div className="item-card" style={{display:'flex', gap:12, alignItems:'center'}}>
        <span className="item-meta">{data.length} entri · {hadir} hadir</span>
      </div>
      {data.map(v=> (
        <div key={v.id} className="item-card">
          <div className="item-head" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <strong>{v.mapel_nama ?? 'Mapel'} · {formatTanggal(v.tanggal)}</strong>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLOR[v.status] ?? 'bg-gray-100'}`}>{v.status}</span>
          </div>
          <span className="item-meta">{v.guru_nama ?? 'Guru'}</span>
          {v.keterangan && <p className="item-desc">{v.keterangan}</p>}
        </div>
      ))}
    </div>
  )
}
