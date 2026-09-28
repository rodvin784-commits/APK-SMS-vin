/**
 * SplashScreen — Layar pembuka sinematik (profesional & dinikmati).
 * Timeline 6.0s: 0–0.7s logo membesar, 0.7–2.5s tahan besar,
 * 2.5–3.1s mengecil (normal), 3.1s logo kecil + TEKS muncul,
 * 3.1–5.6s TAHAN (teks + progress + status), 5.6s fade-out biasa.
 * Untuk pengembang: ubah DURATION => sesuaikan delay animasi di splashCss.
 */
import { useEffect, useState } from 'react'
import logo from '../../assets/logo-bn.png'

interface Props {
  onFinish: () => void // dipanggil App.tsx untuk sembunyikan splash
}

const DURATION = 6000 // ms — sinematik: logo membesar, mengecil, lalu TAHAN kecil ±2 detik

// Pesan status bertahap agar loading terasa hidup & profesional.
const STATUS_MESSAGES = [
  'Menyiapkan portal...',
  'Memuat jadwal & tugas...',
  'Menyusun dashboard...',
  'Hampir selesai...',
]

export default function SplashScreen({ onFinish }: Props) {
  const [out, setOut] = useState(false)
  const [statusIdx, setStatusIdx] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setOut(true), DURATION - 400)
    const t2 = setTimeout(onFinish, DURATION)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onFinish])

  // Pesan status selama fase TAHAN (logo sudah kecil + teks tampil).
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    const t = setTimeout(() => {
      interval = setInterval(() => {
        setStatusIdx((i) => {
          if (i >= STATUS_MESSAGES.length - 1) {
            if (interval) clearInterval(interval)
            return i
          }
          return i + 1
        })
      }, 700)
    }, 3400)
    return () => { clearTimeout(t); if (interval) clearInterval(interval) }
  }, [])

  return (
    <div className={`splash-screen ${out ? 'splash-out' : ''}`}>
      <style>{splashCss}</style>
      <div className="splash-logo-wrapper">
        <div className="splash-ring" />
        <div className="splash-ring r2" />
        <div className="splash-logo-container">
          <img src={logo} alt="Logo SMK Bagimu Negeriku" />
        </div>
      </div>
      <div className="splash-text">
        <h1 className="splash-title">SMK Bagimu Negeriku</h1>
        <p className="splash-subtitle">Portal Siswa • Belajar • Berkarya • Berprestasi</p>
      </div>
      <div className="splash-progress">
        <div className="splash-progress-fill" />
      </div>
      <p className="splash-status"><span key={statusIdx} className="splash-status-text">{STATUS_MESSAGES[statusIdx]}</span></p>
      <div className="splash-loader">
        <span className="splash-dot" />
        <span className="splash-dot d2" />
        <span className="splash-dot d3" />
      </div>
    </div>
  )
}

const splashCss = `
.splash-screen{
  height:100svh;
  height:100dvh;
  width:100%;
  margin:0 auto;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  padding:0 20px;
  background:
    radial-gradient(420px 320px at 50% 38%, rgba(255,255,255,.9), transparent 60%),
    radial-gradient(700px 500px at 50% 100%, rgba(14,116,144,.12), transparent 60%),
    linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 45%, #bae6fd 100%);
  overflow:hidden;
  position:fixed;
  inset:0;
  z-index:9999;
  transition: opacity .5s ease;
}
/* Out normal: fade biasa tanpa efek scale */
.splash-out{ opacity:0; pointer-events:none; }
.splash-logo-wrapper{
  position:relative;
  width:148px; height:148px;
  display:flex; justify-content:center; align-items:center;
}
.splash-ring{
  position:absolute; inset:0;
  border-radius:50%;
  border:1.5px solid rgba(2,132,199,.14);
  box-shadow:0 0 0 14px rgba(2,132,199,.06), 0 0 0 28px rgba(2,132,199,.03);
  will-change:transform, opacity;
  animation: splashRing 6s cubic-bezier(.4,0,.2,1) forwards;
}
/* Ring kedua: pulse berdenyut selama logo hold agar hidup */
.splash-ring.r2{
  inset:-10px;
  border-color:rgba(2,132,199,.1);
  box-shadow:none;
  animation: splashRingPulse 1.8s ease-in-out 2;
}
.splash-logo-wrapper::before{
  content:'';
  position:absolute;
  width:148px; height:148px;
  border-radius:50%;
  background:rgba(255,255,255,.92);
  filter:blur(22px);
  z-index:1;
  will-change:transform, opacity;
  animation: splashGlow 6s cubic-bezier(.4,0,.2,1) forwards;
}
.splash-logo-container{
  position:relative;
  z-index:2;
  width:132px; height:132px;
  display:flex; justify-content:center; align-items:center;
  border-radius:28px;
  background:#fff;
  border:1px solid rgba(186,230,253,.9);
  box-shadow:0 12px 32px rgba(2,132,199,.18), 0 1px 0 rgba(255,255,255,1) inset;
  overflow:hidden;
  will-change:transform, opacity;
  animation: splashZoom 6s cubic-bezier(.4,0,.2,1) forwards;
}
.splash-logo-container img{
  width:86%; height:86%;
  object-fit:contain;
  filter: drop-shadow(0 6px 16px rgba(2,132,199,.18));
}
.splash-logo-container::after{
  content:'';
  position:absolute;
  top:-50%; left:-150%;
  width:42%; height:200%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,.75) 50%, rgba(255,255,255,0) 100%);
  transform: rotate(22deg);
  animation: splashShine 6s ease forwards;
}
.splash-text{ margin-top:22px; text-align:center; opacity:0; animation: splashTextIn .6s 3.3s both cubic-bezier(.22,1,.36,1); }
.splash-title{
  font-family:'Plus Jakarta Sans','Inter',sans-serif;
  font-size:20px; font-weight:800; color:#0f172a;
  letter-spacing:-.03em; line-height:1.1; margin:0;
}
.splash-subtitle{
  font-size:11.5px; color:#0369a1; font-weight:600;
  letter-spacing:.5px; text-transform:uppercase;
  margin:6px 0 0; opacity:.85;
}
.splash-loader{ display:flex; gap:6px; margin-top:14px; opacity:0; animation: splashLoaderIn .5s 3.7s both ease; }
.splash-dot{
  width:6px; height:6px; border-radius:50%; background:#0284c7;
  opacity:.9; animation: splashDot 1s infinite;
}
.splash-dot.d2{ animation-delay:.15s; opacity:.7; }
.splash-dot.d3{ animation-delay:.3s; opacity:.5; }
@keyframes splashZoom{
  0%{ transform:scale(.7); opacity:0; }
  12%{ transform:scale(2.2); opacity:1; }
  42%{ transform:scale(2.2); opacity:1; }
  52%{ transform:scale(1); opacity:1; }
  100%{ transform:scale(1); opacity:1; }
}
@keyframes splashGlow{
  0%{ transform:scale(.7); opacity:0; }
  12%{ transform:scale(2.2); opacity:1; }
  42%{ transform:scale(2.2); opacity:1; }
  52%{ transform:scale(1); opacity:.55; }
  100%{ transform:scale(1); opacity:.55; }
}
@keyframes splashRing{
  0%{ transform:scale(.7); opacity:0; }
  12%{ transform:scale(2.2); opacity:1; }
  42%{ transform:scale(2.2); opacity:.9; }
  52%{ transform:scale(1); opacity:.6; }
  100%{ transform:scale(1); opacity:.6; }
}
@keyframes splashRingPulse{
  0%,100%{ transform:scale(1); opacity:.5; }
  50%{ transform:scale(1.12); opacity:1; }
}
@keyframes splashShine{
  0%,12%{ left:-150%; }
  38%{ left:155%; }
  100%{ left:155%; }
}
/* Progress bar: mengisi halus selama tahan-kecil agar loading terasa progresif */
.splash-progress{
  width:min(220px, 60vw); height:5px; border-radius:999px;
  background:rgba(2,132,199,.14);
  margin-top:18px; overflow:hidden;
  opacity:0; animation: splashLoaderIn .5s 3.6s both ease;
}
.splash-progress-fill{
  height:100%; width:0; border-radius:999px;
  background:linear-gradient(90deg, #0ea5e9, #0284c7);
  will-change:width;
  /* Mengisi selama fase TAHAN (3.4s → 5.4s) */
  animation: splashProgress 2s 3.4s both cubic-bezier(.3,.6,.4,1);
}
@keyframes splashProgress{
  0%{ width:0; }
  30%{ width:38%; }
  55%{ width:62%; }
  75%{ width:84%; }
  92%{ width:96%; }
  100%{ width:100%; }
}
.splash-status{
  font-size:12px; color:#0369a1; font-weight:600; letter-spacing:.2px;
  margin:10px 0 0; min-height:18px; text-align:center;
  opacity:0; animation: splashLoaderIn .5s 3.5s both ease;
}
/* Tiap ganti pesan: crossfade lembut (tanpa delay — delay hanya untuk muncul pertama) */
.splash-status-text{ display:inline-block; animation: splashMsgIn .35s both ease; }
@keyframes splashMsgIn{ from{ opacity:0; transform:translateY(5px); } to{ opacity:1; transform:none; } }
@keyframes splashTextIn{ from{ opacity:0; transform:translateY(8px);} to{opacity:1; transform:none;} }
@keyframes splashLoaderIn{ from{ opacity:0;} to{opacity:1;} }
@keyframes splashDot{ 0%,100%{ transform:translateY(0); opacity:.9;} 50%{ transform:translateY(-4px); opacity:1;} }
`
