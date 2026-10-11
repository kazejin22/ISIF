import type { FeedCard } from "./firewallData";

// Indonesian edition of the Firewall posts (same ids and answers as firewallData.ts).
// Kept short on purpose: the text has to fit on the floating 3D cards.

type CardText = Pick<FeedCard, "app" | "sender" | "headline" | "clues" | "lesson" | "coach">;

export const FIREWALL_CARDS_ID: Record<string, CardText> = {
  t1: {
    app: "WhatsApp", sender: "Nomor tak dikenal +62 812-7731-xxxx",
    headline: "Ma, ini nomor baruku. HP-ku rusak. Tolong transfer Rp 2.000.000 sekarang, penting!",
    clues: ["Nomor baru tak dikenal", "Minta uang mendesak"],
    lesson: "Penipu menyamar jadi keluarga dengan “nomor baru”. Telepon nomor lamanya dulu.",
    coach: "Nomor tak dikenal + minta uang mendesak = penipuan klasik.  TEBAS!",
  },
  t2: {
    app: "Instagram", sender: "BMKG (akun resmi terverifikasi)",
    headline: "Peringatan hujan lebat di Jakarta akhir pekan ini. Hindari daerah rawan banjir.",
    clues: ["Lembaga resmi terverifikasi", "Peringatan sama di media besar"],
    lesson: "Info lembaga resmi yang dikonfirmasi media lain itu tepercaya — boleh dibagikan!",
    coach: "Lembaga resmi + dikonfirmasi berita = tepercaya.  BIARKAN LEWAT (jangan ditebas).",
  },

  // Suspicious — slash
  s1: { app: "SMS", sender: "BANK-INFO", headline: "Rekening Anda DIBLOKIR. Verifikasi dalam 1 jam: bit.ly/bnk-verify", clues: ["Tautan dipendekkan", "Tenggat 1 jam"], lesson: "Bank tidak pernah meminta verifikasi lewat tautan pendek atau dengan tenggat." },
  s2: { app: "Iklan Instagram", sender: "@crypto.giveaway.official", headline: "Miliarder terkenal bagi-bagi kripto: kirim 1 koin, dapat 2!", clues: ["Video seleb tampak janggal", "Terlalu bagus untuk jadi nyata"], lesson: "Bagi-bagi hadiah seleb di iklan adalah penipuan deepfake favorit." },
  s3: { app: "X (Twitter)", sender: "@BreakingNews24_7 · dibuat 2 hari lalu", headline: "AUDIO BOCOR: kandidat mengaku curang pemilu. Sebarkan sebelum dihapus!", clues: ["Akun dibuat 2 hari lalu", "“Sebarkan sebelum dihapus”"], lesson: "Akun baru yang mendesak orang menyebarkan dibuat untuk mendahului pemeriksa fakta." },
  s4: { app: "Facebook", sender: "Viral Hari Ini", headline: "FOTO: hiu berenang di jalan tol yang banjir!", clues: ["Tanpa fotografer atau tanggal", "Foto sama muncul di banjir lama"], lesson: "Foto bencana viral sering foto palsu lama. Cari gambarnya terbalik." },
  s5: { app: "Email", sender: "support@paypa1-secure.com", headline: "Ada login tidak biasa. Masukkan kata sandi di sini agar akun tetap aktif.", clues: ["Domain tiruan: paypa1", "Meminta kata sandi"], lesson: "Domain tiruan yang meminta kata sandi adalah phishing." },
  s6: { app: "Grup WhatsApp", sender: "Diteruskan berkali-kali", headline: "Dokter memastikan: air lemon hangat menyembuhkan semua virus.", clues: ["Tanpa nama dokter atau studi", "“Diteruskan berkali-kali”"], lesson: "Obat ajaib tanpa sumber yang jelas tidak bisa dipercaya." },
  s7: { app: "Panggilan video", sender: "“CEO” · kamera buram", headline: "Transfer dananya ke pemasok baru hari ini. Jangan bilang siapa-siapa.", clues: ["Rahasia + mendesak", "Video buram, suara agak aneh"], lesson: "Pembayaran rahasia dan mendesak adalah penipuan CEO. Verifikasi lewat telepon." },
  s8: { app: "TikTok Shop", sender: "@promo.hp.murah", headline: "iPhone baru cuma Rp 1.500.000! Sisa 3 — bayar transfer bank sekarang.", clues: ["Harga jauh di bawah pasar", "Hanya transfer bank"], lesson: "Harga jauh di bawah pasar dengan pembayaran transfer saja adalah penipuan." },
  s9: { app: "Situs web", sender: "gov-bansos-daftar.net", headline: "Daftarkan NIK untuk menerima bansos Rp 5.000.000.", clues: ["Bukan situs .go.id", "Meminta NIK-mu"], lesson: "Layanan pemerintah asli memakai domain .go.id." },
  s10: { app: "Telegram", sender: "HR Lowongan Kerja", headline: "Dapat Rp 500.000/hari cuma like video! Bayar Rp 100.000 untuk daftar.", clues: ["Bayar dulu di awal", "Penghasilan tidak masuk akal"], lesson: "Pekerjaan yang meminta bayaran di awal adalah penipuan." },
  s11: { app: "Instagram", sender: "@newsupdate_id · unggahan pertama hari ini", headline: "FOTO: penyanyi terkenal ditangkap di bandara!", clues: ["Tulisan di foto acak", "Akun baru, tanpa sumber"], lesson: "Tulisan acak di foto sering berarti gambarnya buatan AI." },
  s12: { app: "SMS", sender: "+62 857-xxxx", headline: "Selamat! Anda menang motor. Bayar pajak Rp 300.000 untuk klaim.", clues: ["Kamu tidak pernah ikut undian", "Bayar untuk klaim hadiah"], lesson: "Hadiah asli tidak pernah meminta bayaran untuk diklaim." },

  // Credible — let pass
  c1: { app: "Situs sekolah", sender: "smpn5.sch.id", headline: "Jadwal ujian akhir bulan depan sudah diumumkan.", clues: ["Domain resmi sekolah", "Sama dengan pengumuman guru"], lesson: "Domain resmi yang cocok dengan info dari sumber lain itu tepercaya." },
  c2: { app: "Berita", sender: "Reuters · AP · Antara", headline: "Bank sentral mempertahankan suku bunga.", clues: ["Diberitakan banyak media", "Mengutip pernyataan resmi"], lesson: "Pemberitaan yang luas dan konsisten adalah tanda kuat kredibilitas." },
  c3: { app: "Cek fakta", sender: "AFP Fact Check", headline: "Foto viral “hiu di jalan tol” adalah foto palsu lama.", clues: ["Pemeriksa fakta dikenal", "Menunjukkan sumber aslinya"], lesson: "Cek fakta yang membongkar hoaks justru harus dibiarkan lewat." },
  c4: { app: "Instagram", sender: "Polisi (akun resmi terverifikasi)", headline: "Waspada penipuan telepon kloning suara. Hubungi 110 untuk melapor.", clues: ["Akun resmi terverifikasi", "Memberi tahu cara mengecek"], lesson: "Peringatan yang memberi tahu cara verifikasi itu tepercaya." },
  c5: { app: "Berita kampus", sender: "Humas universitas", headline: "Studi: siswa yang tidur 8 jam mendapat nilai ujian lebih tinggi.", clues: ["Menautkan studi yang terbit", "Peneliti disebutkan namanya"], lesson: "Studi terbit yang ditautkan dengan penulis jelas adalah tanda yang baik." },
  c6: { app: "Situs pemkot", sender: "jakarta.go.id", headline: "Museum Nasional buka kembali hari Minggu, gratis.", clues: ["Domain resmi .go.id", "Tanggal dan tempat jelas"], lesson: "Detail spesifik di domain resmi itu tepercaya." },
  c7: { app: "Berita", sender: "Berita lokal · oleh wartawan A. Rahman", headline: "Tiga perpustakaan umum baru dibuka di kota.", clues: ["Nama wartawan jelas", "Ada foto peresmiannya"], lesson: "Wartawan yang disebut namanya bertanggung jawab atas beritanya." },
  c8: { app: "Situs web", sender: "kemkes.go.id", headline: "Pekan vaksinasi gratis mulai Senin di puskesmas.", clues: ["Domain resmi pemerintah", "Juga diberitakan media besar"], lesson: "Situs resmi yang dikonfirmasi media independen itu tepercaya." },
  c9: { app: "Instagram", sender: "Akun resmi klub (terverifikasi)", headline: "Klub mengumumkan pelatih kepala baru dalam konferensi pers.", clues: ["Akun resmi terverifikasi", "Ada video konferensi pers"], lesson: "Akun resmi dengan rekaman acaranya itu tepercaya." },
  c10: { app: "Notifikasi aplikasi", sender: "KAI Access (aplikasi resmi)", headline: "Jadwal kereta berubah selama musim liburan.", clues: ["Aplikasi resmi", "Info sama di situs perusahaan"], lesson: "Informasi yang bisa kamu cek di situs resmi itu tepercaya." },
  c11: { app: "X (Twitter)", sender: "BNPB (akun resmi terverifikasi)", headline: "Status gunung api naik: jauhi zona bahaya 5 km.", clues: ["Lembaga bencana resmi", "Dikonfirmasi berita lokal"], lesson: "Peringatan bencana resmi yang dikonfirmasi berita lokal itu tepercaya." },
  c12: { app: "Email", sender: "noreply@ruangguru.com", headline: "Jadwal kelasmu minggu ini sudah tersedia di aplikasi.", clues: ["Domain perusahaan asli", "Tidak ada tautan minta kata sandi"], lesson: "Pesan dari domain asli yang tidak meminta kata sandi itu aman." },
};

export const FIREWALL_RULES_ID = {
  slash: [
    "Akun tak dikenal atau baru dibuat",
    "Minta uang atau kata sandi dengan mendesak",
    "Terlalu bagus untuk jadi nyata",
    "Tautan tiruan atau dipendekkan",
    "Tanpa sumber, atau “sebarkan sebelum dihapus”",
  ],
  pass: [
    "Akun resmi atau terverifikasi",
    "Domain resmi (.go.id, .sch.id)",
    "Dikonfirmasi beberapa media",
    "Wartawan atau pemeriksa fakta jelas",
  ],
};
