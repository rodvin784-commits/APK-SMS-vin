interface Props {
  urls: string[]
  altPrefix: string
}

export default function FotoGrid({ urls, altPrefix }: Props) {
  if (urls.length === 0) return null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginTop: '6px' }}>
      {urls.map((url, idx) => (
        <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
          <img src={url} alt={`${altPrefix} ${idx + 1}`} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
        </a>
      ))}
    </div>
  )
}
