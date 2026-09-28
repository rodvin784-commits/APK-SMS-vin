# APK Siswa — Portal Pelajar

Aplikasi mobile siswa berbasis React + Vite yang terhubung ke API Next.js.

## Prasyarat

- Node.js 20+
- Backend Next.js berjalan (project `project-tim-vin-vines`)

## Setup

1. Install dependensi:

   ```bash
   npm install
   ```

2. Salin `.env.example` ke `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

3. Isi variabel berikut di `.env.local`:

   ```
   VITE_SUPABASE_URL=https://<project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-key>
   VITE_API_BASE_URL=http://localhost:3000
   ```

   Untuk perangkat fisik, ganti `localhost` dengan IP LAN komputer (mis. `http://192.168.1.10:3000`).

## Perintah

| Perintah           | Keterangan                         |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Menjalankan dev server (HMR)       |
| `npm run build`    | Build untuk produksi (`tsc -b` + vite) |
| `npm run preview`  | Preview hasil build secara lokal   |
| `npm run lint`     | ESLint                             |
| `npm run test:run` | Vitest sekali jalan                |

> **Catatan:** `npm run typecheck` (`tsc --noEmit`) TIDAK memeriksa apa pun karena `tsconfig.json` root bersifat solution-style (`"files": []`). Gunakan `npm run build` (memakai `tsc -b`) untuk typecheck yang sebenarnya.

## Login Google (OAuth @smk.belajar.id)

Alur: tombol di `LoginScreen` → browser sistem (plugin `@capacitor/browser`) → Google → deep link `com.vin.siswa://login-callback` → `App.tsx` (`appUrlOpen`) tukar code/token jadi sesi → cek siswa via `/api/siswa/me` → Welcome → Dashboard. Akun wajib dibuat Admin dulu (email persis + NIS + kelas); Supabase menautkan identitas Google via email terverifikasi.

Prasyarat yang tidak bisa dari kode (wajib sekali):

1. Supabase Dashboard → Authentication → URL Configuration → Redirect URLs → tambah persis `com.vin.siswa://login-callback`
2. Deep link sudah dipasang di `android/app/src/main/AndroidManifest.xml` (scheme `com.vin.siswa`, host `login-callback`)

## Build APK Android

```bash
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug "-Dorg.gradle.java.home=C:\Program Files\Android\Android Studio\jbr"
```

> Gradle 8.14.3 tidak jalan di Java 25 (`Unsupported class file major version 69`) — wajib pakai JBR 21 Android Studio seperti contoh di atas.
> Hasil: `android/app/build/outputs/apk/debug/app-debug.apk`. Install via `adb install -r` (LDPlayer: Settings → ADB → koneksi lokal, `adb connect localhost:5555`) atau drag file ke jendela emulator.

Riwayat perubahan besar: `UPDATE_BERIKUT.md` §13 di project web (`project-tim-vin-vines/UPDATE_BERIKUT.md`).
