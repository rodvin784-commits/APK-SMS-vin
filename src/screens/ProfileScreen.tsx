/**
 * ProfileScreen — Profil siswa (view-only, sesuai struktur: screens/ + lib/api Me + components/ui Card).
 * Data dari props `me` (sudah ada di App.tsx), tidak fetch ulang. Edit → hubungi admin.
 */
import type { Me } from '../lib/types'
import { Card } from '../components/ui/Card'

export default function ProfileScreen({ me }: { me: Me }) {
  const jurusan = me.kelas.jurusan_nama ? `${me.kelas.jurusan_kode ?? ''} - ${me.kelas.jurusan_nama}` : 'Tanpa Jurusan'
  return (
    <div className="screen">
      <Card>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#0369a1', overflow: 'hidden' }}>
            {me.siswa.foto_url ? <img src={me.siswa.foto_url} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (me.siswa.nama_lengkap?.charAt(0) ?? 'S')}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{me.siswa.nama_lengkap ?? '-'}</h2>
            <p className="item-meta" style={{ margin: 0 }}>NIS {me.siswa.nis ?? '-'} · {me.siswa.email ?? '-'}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${me.siswa.status !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{me.siswa.status !== false ? 'Aktif' : 'Nonaktif'}</span>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          <div className="item-card" style={{ margin: 0 }}><strong>Kelas</strong><div className="item-meta">{me.kelas.nama_kelas ?? '-'} {me.kelas.tingkat ? `(Tingkat ${me.kelas.tingkat})` : ''} · {me.kelas.tahun_ajaran ?? '-'}</div></div>
          <div className="item-card" style={{ margin: 0 }}><strong>Jurusan</strong><div className="item-meta">{jurusan}</div></div>
          <div className="item-card" style={{ margin: 0 }}><strong>Email</strong><div className="item-meta">{me.siswa.email ?? '-'}</div></div>
        </div>
        <p style={{ fontSize: 12, color: '#64748b', marginTop: 12, textAlign: 'center' }}>Edit data? Hubungi admin sekolah.</p>
      </Card>
    </div>
  )
}
