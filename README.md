# 🎯 Job Hunting Agent — Personal AI Automation

Personal AI Job Hunting Agent lokal berbasis Python untuk mencari lowongan kerja, menganalisis Job Description, mencocokkan profil dengan skor 7-dimensi terukur, melakukan penyesuaian CV ATS-friendly secara jujur (*truth-preserving CV tailoring*), menyajikan alur persetujuan pengguna (*Assisted Apply*), mencatat riwayat di SQLite lokal, dan sinkronisasi ke Microsoft To Do.

---

## ⚡ Fitur Utama

- **Multi-Platform Job Normalization**: Mendukung integrasi portal kerja (Glints, JobStreet, Dealls, Kalibrr, LinkedIn, Indeed) ke dalam skema seragam `JobPost`.
- **Duplicate Protection**: Memastikan lowongan yang sama (`company + position + job_url`) tidak pernah diproses atau diapply ganda.
- **7-Dimension AI Match Scoring**:
  - Hard Skills Match (35%)
  - Role & Responsibilities Match (20%)
  - Experience Requirement (15%)
  - Location Match (10%)
  - Salary Threshold (10%)
  - Tools & Tech Stack (10%)
- **Truth-Preserving CV Optimizer (Zero Hallucination)**:
  - Resume hanya bersumber dari `profile/profile.json`.
  - Reordering skill dan bullet point berdasarkan relevansi JD.
  - Requirement JD yang belum dimiliki ditandai sebagai **GAP** dan DILARANG dimasukkan ke skill resume.
  - Export ke format ATS-friendly `.docx` (single-column, standard headings, no textboxes) dan snapshot riwayat `.json`.
- **Screening Decision Gate**: Membedakan pertanyaan faktual (otomatis) dan pertanyaan ambigu/kustom (masuk status `NEED_REVIEW` tanpa menebak).
- **Interactive Approval Console**: Terminal UI interaktif berbasis library `rich` dengan kartu detail lowongan, preview CV, opsi Apply / Skip.
- **Web Dashboard (Vercel & Cloud Firestore)**: Antarmuka web modern dengan sistem desain **Warm Bento Glass** (Bento Grid 2.0, Liquid Glass, Sage Deep & Warm Terracotta), dilengkapi API Routes serverless, Firestore CRUD real-time, preview CV interaktif, dan modal import lowongan kustom.
- **Microsoft To Do Integration**: Otomatis membuat task di Microsoft To Do via Microsoft Graph API saat lowongan berhasil diapply.
- **3 Mode Operasi**:
  - `SCOUT`: Hanya mencari, menganalisis, dan menghasilkan CV tanpa apply.
  - `ASSISTED` (*Default*): Berhenti dan meminta persetujuan eksplisit pengguna sebelum submit.
  - `AUTO`: Melakukan submit otomatis hanya jika lolos seluruh kriteria ketat (Score $\ge 85$, lokasi Remote/target, gaji sesuai, kategori sesuai, tanpa pertanyaan kustom).

---

## 🌐 Web Dashboard (Next.js & Vercel)

Aplikasi web berada di subfolder `web/` dan siap dideploy langsung ke **Vercel** dengan database **Cloud Firestore**.

### Menjalankan Web Dashboard Lokal:
```bash
cd web
npm install
npm run dev
```
Buka browser di `http://localhost:3000`.

### Deploy ke Vercel:
1. Hubungkan repositori GitHub ini di [Vercel](https://vercel.com/new).
2. Set **Root Directory** ke `web`.
3. Masukkan Environment Variables sesuai `web/.env.example` (Firebase Project).
4. Klik **Deploy**!

---

## 🏗️ Struktur Proyek

```text
d:/Project/2026/Hunting Job/
├── app.py                     # Entry point CLI (scout / search / pending / report)
├── requirements.txt           # Dependensi Python
├── pytest.ini                 # Konfigurasi pengujian Pytest
├── .env.example               # Template environment variables
├── profile/
│   ├── profile.json           # Master profil, riwayat kerja, dan skill pengguna
│   └── preferences.json       # Preferensi target role, lokasi, gaji min, excluded keywords
├── cv/
│   ├── master/                # Master base resume
│   └── generated/             # Folder output resume ter-tailor per tanggal (YYYY-MM-DD)
├── database/
│   ├── db.py                  # SQLite DatabaseManager dengan proteksi duplikat & context manager
│   ├── models.py              # Pydantic models (JobPost, ApplicationStatus)
│   └── jobs.db                # Database SQLite lokal
├── agent/
│   ├── orchestrator.py        # Workflow coordinator (Search -> Match -> Tailor -> Approve)
│   ├── job_filter.py          # Evaluasi kriteria BVA & Equivalence Partitioning
│   ├── job_matcher.py         # Perhitungan match score & gap analysis
│   ├── cv_builder.py          # Engine CV ATS & generator dokumen DOCX
│   ├── screening.py           # Evaluasi pertanyaan screening (Decision Table)
│   └── approval.py            # Terminal Dashboard UI via Rich
├── browser/
│   ├── base.py                # Base class scraper & parser utilitas
│   ├── glints.py              # Glints adapter
│   └── jobstreet.py           # JobStreet adapter
├── ai/
│   ├── client.py              # Gemini AI REST client dengan fallback deterministik offline
│   ├── prompts.py             # Prompt ekstraksi JD & aturan zero-hallucination
│   └── schemas.py             # Pydantic schemas untuk respon AI
├── integrations/
│   └── microsoft_todo.py      # Microsoft Graph API sync
└── tests/                     # Test suite lengkap (33 unit & integration tests)
```

---

## 🚀 Panduan Memulai

### 1. Prasyarat
- Python 3.10+ (Diuji pada Python 3.14)
- Google Chrome atau Microsoft Edge terpasang di sistem Windows.

### 2. Setup Virtual Environment
```bash
# Buat dan aktifkan venv
python -m venv .venv
.\.venv\Scripts\activate

# Install dependensi
pip install -r requirements.txt
```

### 3. Konfigurasi Environment (`.env`)
Salin template `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi jika ingin mengaktifkan live Gemini API atau Microsoft To Do:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

MICROSOFT_CLIENT_ID=
MICROSOFT_TENANT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TODO_LIST_NAME=Job Applications

JOB_AGENT_MODE=ASSISTED
```
*(Catatan: Jika API key tidak diisi, agent tetap bekerja menggunakan parser deterministik dan penyimpanan SQLite lokal)*.

---

## 💻 Penggunaan CLI

### 1. Menjalankan Pencarian Mode Scout (Tanpa Apply)
```bash
python app.py scout --query "QA Engineer"
```

### 2. Menjalankan Pencarian Mode Assisted Apply (Default)
```bash
python app.py search
```

### 3. Meninjau & Menyetujui Lowongan yang Menunggu Approval
```bash
python app.py pending
```
Pilihan aksi:
- `a`: **Apply** (Status berubah menjadi `APPLIED`, sinkron ke Microsoft To Do)
- `s`: **Skip** (Status berubah menjadi `SKIPPED`)
- `v`: **View** URL lowongan
- `q`: Keluar

### 4. Melihat Laporan Harian (Daily Report)
```bash
python app.py report
```

---

## 🧪 Pengujian (SQA ISTQB & TDD)

Seluruh komponen dibangun menggunakan pendekatan **Strict TDD (Test-Driven Development)** dengan standar **ISTQB**:
- **Equivalence Partitioning & Boundary Value Analysis (BVA)** pada gaji, tahun pengalaman, dan skor klasifikasi.
- **Decision Table Testing** pada logika auto-apply dan pertanyaan screening.
- **State Transition Testing** pada lifecycle status lamaran.

Jalankan seluruh test suite dengan coverage:
```bash
pytest --cov=agent --cov=database --cov=integrations --cov=ai
```

Hasil: **33 passing tests (100% pass rate)** dengan coverage $\ge 84\%$.
