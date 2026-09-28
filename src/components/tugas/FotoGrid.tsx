interface Props {
  urls: string[]
  altPrefix: string
}

export default function FotoGrid({ urls, altPrefix }: Props) {
  if (urls.length === 0) return null
  return (
    <div className="foto-grid">
      {urls.map((url, idx) => (
        <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
          <img src={url} alt={`${altPrefix} ${idx + 1}`} loading="lazy" />
        </a>
      ))}
    </div>
  )
}
