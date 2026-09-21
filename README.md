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
