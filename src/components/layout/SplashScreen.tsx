/**
 * SplashScreen — Layar pembuka animasi logo (hanya logo selama zoom, teks muncul belakangan agar tidak tabrakan).
 * Timeline: 0–1.51s logo scale 2.2, 1.58s teks fade-in, 1.72s loader fade-in, total 2.1s lalu callback onFinish.
 * Untuk pengembang: ubah DURATION => sesuaikan delay animasi di splashCss (.splash-text 1.58s, .splash-loader 1.72s).
 */
import { useEffect, useState } from 'react'
import logo from '../../assets/logo-bn.png'

interface Props {
  onFinish: () => void // dipanggil App.tsx untuk sembunyikan splash
}

const DURATION = 2100 // ms — total durasi splash sebelum hilang

export default function SplashScreen({ onFinish }: Props) {
  const [out, setOut] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setOut(true), DURATION - 280)
    const t2 = setTimeout(onFinish, DURATION)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onFinish])

  return (
    <div className={`splash-screen ${out ? 'splash-out' : ''}`}>
      <style>{splashCss}</style>
      <div className="splash-logo-wrapper">
        <div className="splash-ring" />
        <div className="splash-logo-container">
          <img src={logo} alt="Logo SMK Bagimu Negeriku" />
        </div>
      </div>
      <div className="splash-text">
        <h1 className="splash-title">SMK Bagimu Negeriku</h1>
        <p className="splash-subtitle">Portal Siswa • Belajar • Berkarya • Berprestasi</p>
      </div>
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
  width:100%;
  max-width:480px;
  margin:0 auto;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  background:
    radial-gradient(420px 320px at 50% 38%, rgba(255,255,255,.9), transparent 60%),
    radial-gradient(700px 500px at 50% 100%, rgba(14,116,144,.12), transparent 60%),
    linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 45%, #bae6fd 100%);
  overflow:hidden;
  position:fixed;
  inset:0;
  z-index:9999;
  transition: opacity .28s ease, transform .28s ease;
}
.splash-out{ opacity:0; transform:scale(1.02); pointer-events:none; }
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
  animation: splashRing 2.1s ease forwards;
}
.splash-logo-wrapper::before{
  content:'';
  position:absolute;
  width:148px; height:148px;
  border-radius:50%;
  background:rgba(255,255,255,.92);
  filter:blur(22px);
  z-index:1;
  animation: splashGlow 2.1s ease forwards;
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
  animation: splashZoom 2.1s cubic-bezier(.16,1,.3,1) forwards;
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
  animation: splashShine 2.1s ease forwards;
}
.splash-text{ margin-top:22px; text-align:center; opacity:0; animation: splashTextIn .55s 1.58s both cubic-bezier(.16,1,.3,1); }
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
.splash-loader{ display:flex; gap:6px; margin-top:18px; opacity:0; animation: splashLoaderIn .45s 1.72s both ease; }
.splash-dot{
  width:6px; height:6px; border-radius:50%; background:#0284c7;
  opacity:.9; animation: splashDot 1s infinite;
}
.splash-dot.d2{ animation-delay:.15s; opacity:.7; }
.splash-dot.d3{ animation-delay:.3s; opacity:.5; }
@keyframes splashZoom{
  0%{ transform:scale(.72); opacity:0; }
  28%{ transform:scale(2.2); opacity:1; }
  72%{ transform:scale(2.2); opacity:1; }
  100%{ transform:scale(1); opacity:1; }
}
@keyframes splashGlow{
  0%{ transform:scale(.72); opacity:0; }
  28%{ transform:scale(2.2); opacity:1; }
  72%{ transform:scale(2.2); opacity:1; }
  100%{ transform:scale(1); opacity:.55; }
}
@keyframes splashRing{
  0%{ transform:scale(.72); opacity:0; }
  30%{ transform:scale(2.2); opacity:1; }
  72%{ transform:scale(2.2); opacity:.9; }
  100%{ transform:scale(1); opacity:.6; }
}
@keyframes splashShine{
  0%,28%{ left:-150%; }
  52%{ left:155%; }
  100%{ left:155%; }
}
@keyframes splashTextIn{ from{ opacity:0; transform:translateY(8px);} to{opacity:1; transform:none;} }
@keyframes splashLoaderIn{ from{ opacity:0;} to{opacity:1;} }
@keyframes splashDot{ 0%,100%{ transform:translateY(0); opacity:.9;} 50%{ transform:translateY(-4px); opacity:1;} }
`
