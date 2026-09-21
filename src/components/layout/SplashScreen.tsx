import { useEffect } from 'react'
import logo from '../../assets/gambar3.png'

interface Props {
  onFinish: () => void
}

// Durasi animasi 1800ms sesuai kode HTML asli
const DURATION = 1800

export default function SplashScreen({ onFinish }: Props) {
  useEffect(() => {
    const t = setTimeout(onFinish, DURATION)
    return () => clearTimeout(t)
  }, [onFinish])

  return (
    <div className="splash-screen">
      <style>{splashCss}</style>
      <div className="splash-logo-wrapper">
        <div className="splash-logo-container">
          <img src={logo} alt="Logo SMK Bagimu Negeriku" />
        </div>
      </div>
      <p className="splash-title">SMK Bagimu Negeriku</p>
      <p className="splash-subtitle">Portal Siswa</p>
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
  background: radial-gradient(circle at center, #e0f2fe 0%, #38bdf8 50%, #0284c7 100%);
  overflow:hidden;
  position:fixed;
  inset:0;
  z-index:9999;
}
.splash-logo-wrapper{
  position:relative;
  display:flex;
  justify-content:center;
  align-items:center;
}
.splash-logo-wrapper::before{
  content:'';
  position:absolute;
  width:140px;
  height:140px;
  border-radius:50%;
  background:rgba(255,255,255,0.8);
  filter:blur(20px);
  z-index:1;
  animation: splashGlow 1.8s forwards;
}
.splash-logo-container{
  position:relative;
  z-index:2;
  width:140px;
  height:140px;
  display:flex;
  justify-content:center;
  align-items:center;
  border-radius:50%;
  overflow:hidden;
  animation: splashZoom 1.8s forwards;
}
.splash-logo-container img{
  width:100%;
  height:100%;
  object-fit:contain;
  filter: drop-shadow(0 8px 20px rgba(2,132,199,0.3));
}
.splash-logo-container::after{
  content:'';
  position:absolute;
  top:-50%;
  left:-150%;
  width:50%;
  height:200%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%);
  transform: rotate(25deg);
  animation: splashShine 1.8s forwards;
}
.splash-title{
  margin-top:18px;
  font-size:18px;
  font-weight:800;
  color:#0c4a6e;
  letter-spacing:0.3px;
}
.splash-subtitle{
  font-size:13px;
  color:#075985;
  opacity:0.9;
}
@keyframes splashZoom{
  0%{ transform:scale(0.8); opacity:0; animation-timing-function:cubic-bezier(0.25,1,0.5,1); }
  40%{ transform:scale(3.8); opacity:1; animation-timing-function:linear; }
  80%{ transform:scale(3.8); opacity:1; animation-timing-function:ease-in; }
  100%{ transform:scale(1); opacity:1; }
}
@keyframes splashGlow{
  0%{ transform:scale(0.8); opacity:0; }
  40%{ transform:scale(3.8); opacity:0.9; }
  80%{ transform:scale(3.8); opacity:0.9; }
  100%{ transform:scale(1); opacity:0.5; }
}
@keyframes splashShine{
  0%,40%{ left:-150%; }
  65%{ left:150%; }
  100%{ left:150%; }
}
`
