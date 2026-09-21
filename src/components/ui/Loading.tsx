interface Props {
  message?: string
  full?: boolean
}

export default function Loading({ message = 'Memuat...', full }: Props) {
  return <div className={full ? 'loading loading-full' : 'loading'}>{message}</div>
}
