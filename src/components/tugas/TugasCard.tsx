import type { TugasItem } from '../../lib/types'
import { formatTanggal, statusLabel } from '../../lib/format'
import Badge from '../ui/Badge'
import FotoGrid from './FotoGrid'

interface Props {
  tugas: TugasItem
  fotoUrls?: string[]
  jawabanFotoUrls?: string[]
  onUnduhLampiran: (id: string) => void
  onUnduhJawaban: (id: string) => void
  onLihatFotoTugas: (t: TugasItem) => void
  onLihatFotoJawaban: (pengumpulanId: string) => void
  onBukaForm: (t: TugasItem) => void
  renderForm?: () => React.ReactNode
}

export default function TugasCard({ tugas: t, fotoUrls, jawabanFotoUrls, onUnduhLampiran, onUnduhJawaban, onLihatFotoTugas, onLihatFotoJawaban, onBukaForm, renderForm }: Props) {
  return (
    <div className="item-card">
      <div className="item-head">
        <strong>{t.judul}</strong>
        <Badge variant={t.pengumpulan ? 'ok' : 'warn'}>{statusLabel(t.pengumpulan?.status ?? null)}</Badge>
      </div>
      <span className="item-meta">{t.mapel_nama} · {t.guru_nama}</span>
      {t.deskripsi && <p className="item-desc">{t.deskripsi}</p>}
      <span className="item-meta">Deadline: <b>{formatTanggal(t.deadline)}</b></span>

      {t.foto_urls && t.foto_urls.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <button className="btn-secondary" onClick={() => onLihatFotoTugas(t)} style={{ marginBottom: '0.4rem' }}>
            🖼️ Lihat Foto Tugas ({t.foto_urls!.length})
          </button>
          {fotoUrls && <FotoGrid urls={fotoUrls} altPrefix="Foto tugas" />}
        </div>
      )}

      {t.pengumpulan?.jawaban_teks && (
        <p className="item-desc" style={{ whiteSpace: 'pre-line' }}>
          <b>Jawaban saya:</b> {t.pengumpulan.jawaban_teks}
        </p>
      )}

      {t.pengumpulan?.foto_urls && t.pengumpulan.foto_urls.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <span className="item-meta">📷 Foto jawaban ({t.pengumpulan.foto_urls.length})</span>
          <button className="btn-secondary" onClick={() => onLihatFotoJawaban(t.pengumpulan!.id)} style={{ marginLeft: '0.5rem' }}>
            Lihat Foto
          </button>
          {jawabanFotoUrls && <FotoGrid urls={jawabanFotoUrls} altPrefix="Foto jawaban" />}
        </div>
      )}

      {t.pengumpulan?.nilai !== null && t.pengumpulan?.nilai !== undefined && (
        <div style={{ marginTop: '0.6rem', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #dcfce7' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d' }}>Nilai: {t.pengumpulan.nilai}/100</span>
          {t.pengumpulan.status === 'dinilai' && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '999px', background: '#16a34a', color: 'white', fontWeight: 700 }}>DINILAI</span>}
        </div>
      )}
      {t.pengumpulan?.feedback && (
        <p className="item-desc" style={{ marginTop: '0.4rem', padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', fontSize: '13px' }}>
          <b style={{ color: '#92400e' }}>Feedback guru:</b> {t.pengumpulan.feedback}
        </p>
      )}

      <div className="item-actions">
        {t.lampiran_url && <button className="btn-secondary" onClick={() => onUnduhLampiran(t.id)}>📎 Lampiran</button>}
        {t.foto_urls && t.foto_urls.length > 0 && !t.lampiran_url && <button className="btn-secondary" onClick={() => onLihatFotoTugas(t)}>🖼️ Foto</button>}
        {t.pengumpulan?.nama_file && <button className="btn-secondary" onClick={() => onUnduhJawaban(t.pengumpulan!.id)}>⬇ Jawaban saya</button>}
        {t.pengumpulan?.foto_urls && t.pengumpulan.foto_urls.length > 0 && <button className="btn-secondary" onClick={() => onLihatFotoJawaban(t.pengumpulan!.id)}>🖼️ Foto Jawaban</button>}
        {t.status === 'published' && <button className="btn-primary" onClick={() => onBukaForm(t)}>{t.pengumpulan ? '🔁 Kumpul ulang' : '📤 Kumpulkan'}</button>}
      </div>

      {renderForm?.()}
    </div>
  )
}
