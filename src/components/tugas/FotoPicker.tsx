import { useRef } from 'react'

interface Props {
  files: File[]
  previews: string[]
  onAdd: (files: FileList | null) => void
  onRemove: (idx: number) => void
  error?: string | null
}

export default function FotoPicker({ files, previews, onAdd, onRemove }: Props) {
  const fotoInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <div style={{ marginTop: '0.6rem' }}>
      <span className="item-meta">📷 Foto Jawaban (maks 5, 8MB/foto)</span>
      <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
        <button type="button" className="btn-secondary" onClick={() => fotoInputRef.current?.click()}>
          🖼️ Pilih Foto
        </button>
        <button type="button" className="btn-secondary" onClick={() => cameraInputRef.current?.click()}>
          📷 Ambil Foto
        </button>
        {files.length > 0 && <span className="item-meta" style={{ alignSelf: 'center' }}>{files.length}/5</span>}
      </div>
      <input ref={fotoInputRef} type="file" accept="image/*" multiple onChange={(e) => onAdd(e.target.files)} style={{ display: 'none' }} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => onAdd(e.target.files)} style={{ display: 'none' }} />
      {previews.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginTop: '8px' }}>
          {previews.map((src, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <img src={src} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <button type="button" onClick={() => onRemove(idx)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '22px', height: '22px', border: 'none', cursor: 'pointer' }}>×</button>
              <div style={{ fontSize: '10px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{files[idx]?.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
