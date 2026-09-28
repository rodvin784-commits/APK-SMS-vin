/**
 * ProfileScreen — Profil siswa (view-only, sesuai struktur: screens/ + lib/api Me + components/ui Card).
 * Data dari props `me` (sudah ada di App.tsx), tidak fetch ulang. Edit → hubungi admin.
 */
import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import type { Me } from '../lib/types'
import { Card } from '../components/ui/Card'
import { toTitleCase } from '../lib/format'
import { supabase } from '../lib/supabase'
import { API_BASE_URL } from '../lib/env'

export default function ProfileScreen({ me, onLogout }: { me: Me; onLogout: () => void }) {
  const jurusan = me.kelas.jurusan_nama ? `${me.kelas.jurusan_kode ?? ''} - ${me.kelas.jurusan_nama}` : 'Tanpa Jurusan'
  const [curr, setCurr] = useState('')
  const [next, setNext] = useState('')
  const [msg, setMsg] = useState<{type:'success'|'error', text:string}|null>(null)
  const [saving, setSaving] = useState(false)
  const [remaining, setRemaining] = useState(1)
  const [used, setUsed] = useState(0)
  useEffect(()=>{
    (async()=>{
      const { data:{session}} = await supabase.auth.getSession()
      const token=session?.access_token
      if(!token) return
      const r=await fetch(`${API_BASE_URL}/api/profile/change-password`, {headers:{Authorization:`Bearer ${token}`}})
      const j=await r.json().catch(()=>null)
      if(j){ setUsed(j.used ?? 0); setRemaining(j.remaining ?? 1)}
    })()
  },[])
  const submit = async (e: React.FormEvent)=>{
    e.preventDefault()
    setSaving(true); setMsg(null)
    const { data:{session}} = await supabase.auth.getSession()
    const token=session?.access_token
    if(!token){ setMsg({type:'error', text:'Sesi habis'}); setSaving(false); return}
    const r=await fetch(`${API_BASE_URL}/api/profile/change-password`, {method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({currentPassword: curr, newPassword: next})})
    const j=await r.json().catch(()=>null)
    if(r.ok){ setMsg({type:'success', text: j.message}); setUsed(1); setRemaining(0); setCurr(''); setNext('') }
    else setMsg({type:'error', text: j?.error ?? 'Gagal'})
    setSaving(false)
  }
  return (
    <div className="screen">
      <Card>
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-100 text-[28px] font-extrabold text-sky-700">
            {me.siswa.foto_url ? <img src={me.siswa.foto_url} alt="foto" className="h-full w-full object-cover" /> : (me.siswa.nama_lengkap?.charAt(0) ?? 'S')}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{toTitleCase(me.siswa.nama_lengkap) || '-'}</h2>
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
      <button
        onClick={onLogout}
        aria-label="Keluar dari akun"
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-4 text-sm font-bold text-red-600"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Keluar dari Akun
      </button>
      <Card>
        <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 800 }}>Ganti Sandi (1x)</h3>
        <p className="item-meta" style={{ margin: '0 0 8px' }}>Sisa: {remaining} / 1 {used>=1 && <span style={{color:'#e11d48'}}>sudah dipakai</span>}</p>
        {msg && <div className={`mb-2 rounded-xl px-3 py-2 text-[13px] font-medium ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{msg.text}</div>}
        <form onSubmit={submit} className="grid gap-2">
          <input type="password" placeholder="Password lama" value={curr} onChange={e=>setCurr(e.target.value)} required className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          <input type="password" placeholder="Password baru (min 6)" value={next} onChange={e=>setNext(e.target.value)} required disabled={remaining===0} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50" />
          <button type="submit" disabled={saving || remaining===0} className="min-h-[44px] rounded-xl bg-slate-900 px-3 text-[13px] font-bold text-white transition-opacity disabled:opacity-50">{saving?'Menyimpan...': remaining===0 ? 'Sudah 1x — Hubungi admin' : 'Ganti Sandi'}</button>
        </form>
      </Card>
    </div>
  )
}
