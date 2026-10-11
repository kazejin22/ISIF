import type { Mission } from "./types";

// Indonesian edition of src/game/missions.ts. Same ids, flags, points and
// dialogue graph — only the player-facing text is translated. Keep the two in sync.

const heistMission: Mission = {
  id: "video-call-heist",
  number: 1,
  codename: "OPERASI CERMIN",
  title: "Panggilan Video $25 Juta",
  tagline: "CFO-mu minta transfer mendesak dan rahasia. Benarkah itu dia?",
  location: "Hong Kong",
  year: 2024,
  caseId: "hk-arup-2024",
  skill: "Mengenali penipuan CEO & deepfake di panggilan video",
  briefing: [
    "Kamu bekerja di tim keuangan kantor Meridian Engineering di Hong Kong.",
    "Pagi ini masuk email dari Chief Financial Officer (CFO) di London. Lalu ada panggilan video. Menjelang sore, seseorang ingin memindahkan uang jutaan dolar.",
    "Pada 2024, seorang karyawan di perusahaan teknik sungguhan mentransfer sekitar US$25 juta setelah panggilan video yang semua 'rekan kerjanya' ternyata deepfake. Jangan sampai terulang.",
  ],
  stages: [
    {
      kind: "hunt",
      title: "Periksa emailnya",
      brief: "Klik setiap bagian email yang merupakan tanda bahaya. Hati-hati — mengklik bagian yang aman akan mengurangi poin.",
      maxPoints: 400,
      email: {
        from: {
          id: "from",
          text: "David Chen (CFO) <d.chen@meridian-engineerlng.com>",
          flag: true,
          explain: "Domain tiruan: “engineerlng” memakai huruf L, bukan I. Domain aslinya meridian-engineering.com.",
        },
        subject: {
          id: "subject",
          text: "MENDESAK & RAHASIA — pembayaran akuisisi harus hari ini",
          flag: true,
          explain: "Desakan ditambah kerahasiaan di judul email adalah taktik tekanan klasik: membuatmu melewati pengecekan yang biasa.",
        },
        body: [
          { id: "greet", text: "Halo, terima kasih lagi atas kerja bagusmu di laporan kuartalan.", flag: false, explain: "Basa-basi ramah itu wajar — penipu memang meniru gaya ini, tapi ini sendiri bukan tanda bahaya." },
          { id: "secret", text: "Kami sedang menyelesaikan akuisisi rahasia. Tolong jangan bicarakan ini dengan siapa pun di kantor, termasuk atasanmu.", flag: true, explain: "Isolasi: memintamu menyembunyikan pembayaran dari atasanmu sendiri berarti melewati kontrol yang melindungimu." },
          { id: "deadline", text: "Dananya harus masuk ke rekening mitra kami dalam dua jam ke depan, atau kesepakatannya batal.", flag: true, explain: "Tenggat buatan. Akuisisi sungguhan butuh berminggu-minggu dan melewati tim hukum serta keuangan." },
          { id: "accounts", text: "Detail penerimanya akan saya berikan di panggilan — lima rekening baru di Pacific Crest Trading Ltd.", flag: true, explain: "Penerima baru yang tidak dikenal dan dipecah ke beberapa rekening adalah cara uang curian dipindahkan dengan cepat." },
          { id: "call", text: "Ikut panggilan video bersama saya dan penasihat hukum kami pukul 15.00 HKT agar kami bisa menjelaskannya.", flag: false, explain: "Panggilan itu hal biasa — tapi dalam serangan ini, panggilannya sendirilah yang deepfake. Tetap waspada di tahap berikutnya." },
          { id: "sig", text: "Salam, David Chen — Chief Financial Officer, London", flag: false, explain: "Tanda tangan biasa. Tanda tangan mudah ditiru, jadi tidak membuktikan apa pun." },
        ],
        attachment: {
          id: "attach",
          text: "📎 Link_rapat_AMAN.html",
          flag: true,
          explain: "Lampiran HTML, bukan undangan kalender biasa, bisa mengarah ke halaman login palsu atau rapat yang tidak bisa kamu verifikasi.",
        },
      },
    },
    {
      kind: "observe",
      title: "Ikuti panggilan video",
      brief: "Ada empat orang di panggilan ini. Baca apa yang terjadi dan centang semua yang menunjukkan deepfake.",
      maxPoints: 300,
      scene: "video-call",
      transcript: [
        { speaker: "“David Chen”", line: "Terima kasih sudah bergabung. Koneksiku jelek, jadi kualitas kameraku kurendahkan." },
        { speaker: "Kamu", line: "Tidak apa-apa. Satu pertanyaan dulu — bagaimana makan malam tim di Sai Kung bulan lalu?" },
        { speaker: "“David Chen”", line: "Maaf, suaramu putus-putus. Kita fokus saja — waktunya mepet." },
        { speaker: "“Penasihat hukum”", line: "(mengangguk, tidak bicara sepatah kata pun selama panggilan)" },
        { speaker: "“David Chen”", line: "Semua yang di sini sudah setuju. Lima rekeningnya kukirim sekarang. Transfer satu per satu." },
      ],
      items: [
        { id: "lowq", text: "Dia bersikeras memakai kualitas video rendah karena “koneksi jelek”.", suspicious: true, explain: "Resolusi rendah menyembunyikan jejak deepfake di sekitar wajah dan mulut." },
        { id: "dodge", text: "Dia menghindari pertanyaan pribadimu soal makan malam tim.", suspicious: true, explain: "Deepfake bisa meniru wajah dan suara, tapi tidak bisa meniru kenangan bersama. Pertanyaan pribadi adalah tes yang kuat." },
        { id: "silent", text: "Peserta lain tidak pernah bicara dan hampir tidak bergerak.", suspicious: true, explain: "Memalsukan banyak orang secara langsung itu sulit, jadi peserta tambahan sering berupa video diam yang diulang." },
        { id: "lips", text: "Gerak bibirnya tampak sedikit tertinggal dari ucapannya.", suspicious: true, explain: "Gerak bibir yang tidak pas adalah tanda umum pertukaran wajah atau suara secara langsung." },
        { id: "office", text: "Dia tampak duduk di sebuah kantor.", suspicious: false, explain: "Latar belakang mudah dipalsukan, tapi juga sangat wajar — bukan bukti apa pun." },
        { id: "english", text: "Dia berbahasa Inggris dengan lancar dan berlogat Inggris.", suspicious: false, explain: "Kloning suara meniru logat dengan baik, jadi logat yang familier tidak membuktikan apa pun — tapi juga tidak mencurigakan." },
      ],
    },
    {
      kind: "choice",
      title: "Ambil keputusan",
      brief: "“CFO” sedang menunggu. Apa yang kamu lakukan?",
      maxPoints: 300,
      options: [
        { id: "pay", text: "Transfer uangnya — CFO dan tim hukum sudah setuju di video.", points: 0, feedback: "Persis begini US$25 juta yang asli hilang: 15 transfer setelah panggilan palsu yang meyakinkan." },
        { id: "reply", text: "Balas email itu dan minta David mengonfirmasi secara tertulis.", points: 60, feedback: "Lebih baik daripada membayar, tapi balasannya langsung kembali ke penipu, yang dengan senang hati akan “mengonfirmasi”." },
        { id: "askcall", text: "Minta foto kartu identitasnya di panggilan yang sama.", points: 60, feedback: "Apa pun yang ditunjukkan lewat saluran yang dikuasai penyerang juga bisa dipalsukan." },
        { id: "verify", text: "Akhiri panggilan, telepon David di nomor dari direktori perusahaan, dan beri tahu atasanmu.", points: 300, feedback: "Sempurna. Memverifikasi lewat saluran yang KAMU pilih (nomor yang sudah dikenal) mengalahkan deepfake yang paling meyakinkan sekalipun." },
      ],
    },
  ],
  lessons: [
    "Desakan + kerahasiaan + rekening bank baru = berhenti dan verifikasi, setiap kali.",
    "Verifikasi lewat saluran yang kamu pilih, seperti nomor telepon yang sudah dikenal, bukan yang diberikan si peminta.",
    "Tanyakan sesuatu yang hanya diketahui orang aslinya. Deepfake meniru wajah dan suara, bukan kenangan.",
    "Kualitas video rendah, peserta yang diam, dan gerak bibir yang tidak pas adalah tanda bahaya saat panggilan.",
  ],
};

const realOrFakeMission: Mission = {
  id: "real-or-synthetic",
  number: 2,
  codename: "OPERASI PIKSEL",
  title: "Asli atau Sintetis?",
  tagline: "Delapan gambar. Masing-masing delapan detik keraguan. Percayai latihanmu.",
  location: "Global",
  year: 2025,
  skill: "Mengenali gambar buatan AI",
  briefing: [
    "Sebuah ruang redaksi butuh bantuanmu: gambar terus berdatangan, dan beberapa di antaranya tidak pernah dipotret siapa pun.",
    "Untuk setiap gambar, tentukan: foto asli, atau buatan generator gambar? Kecepatan penting, dan jawaban benar berturut-turut memberi bonus beruntun.",
    "Perhatikan tulisan, tangan, wajah di latar belakang, dan apa pun yang tidak cocok dengan waktu atau tempatnya.",
  ],
  stages: [
    {
      kind: "real-or-fake",
      title: "Pilah barang buktinya",
      brief: "Foto asli atau buatan AI?",
      maxPoints: 1000,
      secondsPerRound: 15,
      rounds: [
        { id: "r1", src: "/game/rof/e1.jpg", answer: "real", explain: "Asli. Abu vulkanik di Yogyakarta setelah letusan Kelud 2014. Label “BERAS BULOG” di karung terbaca sempurna, dan debu serta jejaknya berantakan secara alami.", credit: "Foto: Crisco 1492 / Wikimedia Commons, CC BY-SA 3.0" },
        { id: "r2", src: "/game/rof/e2.png", answer: "ai", explain: "AI (Midjourney v4). Pelat nomor “1107ES 6119” tidak bermakna, logo mobilnya bukan merek sungguhan, dan tekstur “vintage”-nya rata seperti filter.", credit: "Gambar: Chikorita / Wikimedia Commons, CC BY-SA 4.0" },
        { id: "r3", src: "/game/rof/e3.jpg", answer: "real", explain: "Asli. Penyembur api di Indonesia. Tampak terlalu dramatis, tapi apinya punya detail acak yang sesuai fisika, dan tangan serta jari kakinya benar secara anatomi. Spektakuler bukan berarti palsu!", credit: "Foto: Firman Hakim / Wikimedia Commons, CC BY-SA 4.0" },
        { id: "r4", src: "/game/rof/e4.png", answer: "ai", explain: "AI (Midjourney). Tulisan di lencana sekolah tidak terbaca, siswa di latar belakang mengulang wajah dan pose yang sama, dan meja-meja di belakang menyatu satu sama lain.", credit: "Gambar: Midjourney / Wikimedia Commons, domain publik" },
        { id: "r5", src: "/game/rof/e5.jpg", answer: "real", explain: "Asli. Stasiun metro Ana Rosa, São Paulo. Papan petunjuknya (“Vila Prudente”, “Vila Madalena”) adalah nama tempat sungguhan yang terbaca, dan pegangan tangannya mengikuti perspektif yang konsisten.", credit: "Foto: Wilfredor / Wikimedia Commons, CC BY-SA 4.0" },
        { id: "r6", src: "/game/rof/e6.jpg", answer: "ai", explain: "AI. Abraham Lincoln wafat pada 1865, jauh sebelum ada ponsel pintar. Cek konteks lebih ampuh daripada memelototi piksel: pencahayaannya sempurna, tapi adegannya mustahil.", credit: "Gambar: Dennis Sylvester Hurd / Wikimedia Commons, domain publik" },
        { id: "r7", src: "/game/rof/e7.jpg", answer: "real", explain: "Asli. Penjual ikan di Maracaibo, Venezuela. Gigi yang tidak rata, kerutan dalam, bulu dada, dan pola kotak-kotak kemejanya tetap konsisten — detail tidak sempurna yang biasanya dihaluskan AI.", credit: "Foto: Wilfredor / Wikimedia Commons, CC0" },
        { id: "r8", src: "/game/rof/e8.jpg", answer: "ai", explain: "AI (Apple Image Playground). Seberkas cahaya jatuh dari awan ke puncak gunung, ada dua kabin yang identik, dan pegunungannya tampak halus seperti lukisan.", credit: "Gambar: Apple Intelligence / Wikimedia Commons, domain publik" },
      ],
    },
  ],
  lessons: [
    "Baca setiap tulisan. AI masih sering mengacaukan papan nama, lencana, dan pelat nomor.",
    "Periksa latar belakang: kerumunan dengan wajah berulang atau meleleh adalah tanda kuat AI.",
    "Tanyakan “apakah ini mungkin?” Gambar sempurna dari adegan yang mustahil pasti palsu.",
    "Foto asli sering berantakan, dan spektakuler bukan berarti palsu. Kalau ragu, cari sumbernya.",
  ],
};

const voiceMission: Mission = {
  id: "mom-help-me",
  number: 3,
  codename: "OPERASI GEMA",
  title: "“Ma, Tolong Aku!”",
  tagline: "Putrimu menjerit di telepon. Seorang pria minta uang. Waktumu hanya hitungan detik.",
  location: "Arizona, AS",
  year: 2023,
  caseId: "us-kidnap-voice-2023",
  skill: "Bertahan dari telepon penipuan kloning suara",
  briefing: [
    "Kamu adalah Sarah. Putrimu Emma, 15 tahun, sedang latihan ski dua jam perjalanan dari rumah.",
    "Ponselmu berdering dari nomor tak dikenal. Pada 2023, seorang ibu di Arizona menerima telepon persis seperti ini: suara putrinya menangis, lalu seorang pria meminta tebusan. Putrinya ternyata aman. Suara itu kemungkinan besar kloning AI.",
    "Dalam simulasi ini kamu hanya punya beberapa detik untuk memilih setiap jawaban. Tetap tenang, dan berpikirlah.",
  ],
  stages: [
    {
      kind: "dialogue",
      title: "Panggilan masuk",
      brief: "Pilih jawabanmu sebelum waktunya habis.",
      maxPoints: 1000,
      secondsPerChoice: 15,
      timeoutChoice: { text: "(Kamu membeku, tidak bisa bicara.)", next: "pressure", points: 0, feedback: "Membeku itu wajar. Penipu mengandalkan kepanikan. Tarik napas: kamu boleh berhenti sejenak." },
      start: "open",
      nodes: {
        open: {
          id: "open",
          lines: [
            { speaker: "voice", text: "Ma?! Ma, aku kacau… tolong, tolong aku!" },
            { speaker: "caller", text: "Dengar. Putrimu ada di tanganku. Jangan hubungi siapa pun. Kirim US$15.000 dalam 30 menit, atau kamu tidak akan melihatnya lagi." },
          ],
          choices: [
            { text: "“Oke, oke! Bilang caranya kirim uang.”", next: "pay", points: 0, feedback: "Langsung setuju memberi penipu kendali penuh. Kepanikan adalah senjatanya." },
            { text: "“Kembalikan teleponnya ke putriku. Emma — siapa nama anjing pertama kita?”", next: "question", points: 250, feedback: "Bagus sekali. Pertanyaan yang hanya bisa dijawab Emma asli adalah tes tercepat untuk suara kloning." },
            { text: "Tutup telepon dan hubungi ponsel Emma langsung.", next: "callEmma", points: 550, feedback: "Insting yang hebat. Memverifikasi lewat saluranmu sendiri mematahkan penipuan ini." },
            { text: "“Siapa ini? Aku akan lapor polisi!”", next: "threat", points: 100, feedback: "Melibatkan polisi itu benar, tapi mengumumkannya ke penelepon hanya menambah tekanan." },
          ],
        },
        pressure: {
          id: "pressure",
          lines: [
            { speaker: "caller", text: "Kamu masih di sana? Setiap menit yang kamu buang, dia menderita. Pergi ke toko dan beli kartu hadiah. SEKARANG." },
          ],
          choices: [
            { text: "Bisukan panggilan, lalu kirim pesan ke Emma dan pelatihnya dari ponselmu.", next: "textEmma", points: 250, feedback: "Pemulihan yang cerdas: biarkan sambungan tetap terbuka sambil kamu memverifikasi." },
            { text: "Ambil kunci dan menyetir ke toko.", next: "store", points: 0, feedback: "Kartu hadiah, kripto, dan transfer kawat adalah pembayaran favorit penipu: hampir mustahil dibatalkan." },
          ],
        },
        pay: {
          id: "pay",
          lines: [
            { speaker: "caller", text: "Pintar. Beli kartu hadiah — $15.000 — lalu bacakan kodenya. Jangan tutup telepon sama sekali. Kalau kamu tutup, dia yang menanggung." },
          ],
          choices: [
            { text: "Bilang kamu harus ambil kunci mobil, lalu kirim pesan ke Emma dan pelatihnya.", next: "textEmma", points: 200, feedback: "Pemulihan yang bagus. Alasan singkat memberimu waktu untuk memverifikasi." },
            { text: "Lakukan persis seperti yang dia katakan.", next: "store", points: 0, feedback: "Menahanmu tetap di telepon adalah taktik kendali. Itu mencegahmu mengecek apakah Emma benar-benar aman." },
          ],
        },
        question: {
          id: "question",
          lines: [
            { speaker: "caller", text: "Dia tidak bisa bicara sekarang!" },
            { speaker: "voice", text: "Ma, tolong, turuti saja dia… aku takut sekali…" },
            { speaker: "narrator", text: "“Suara” itu tidak menjawab pertanyaanmu. Ia hanya mengulang kalimat emosional." },
          ],
          choices: [
            { text: "Ajak dia terus bicara sambil kamu kirim pesan ke Emma dan pelatihnya.", next: "textEmma", points: 400, feedback: "Sesuai buku panduan. Kloning tidak bisa menjawab pertanyaan pribadi, dan kamu memverifikasi bersamaan." },
            { text: "Itu pasti suaranya. Setuju untuk membayar.", next: "pay", points: 0, feedback: "Kloning suara bisa dibuat hanya dari beberapa detik audio di media sosial. Suara yang familier bukan bukti." },
          ],
        },
        threat: {
          id: "threat",
          lines: [
            { speaker: "caller", text: "Lapor polisi dan dia hilang. Kamu punya 25 menit." },
          ],
          choices: [
            { text: "Tutup telepon dan hubungi ponsel Emma.", next: "callEmma", points: 300, feedback: "Langkah yang tepat: verifikasi dulu, dengan caramu sendiri." },
            { text: "Minta maaf dan tanya cara membayar.", next: "pay", points: 0, feedback: "Ancaman dirancang agar kamu menurut. Jangan biarkan." },
          ],
        },
        textEmma: {
          id: "textEmma",
          lines: [
            { speaker: "narrator", text: "Ponselmu bergetar. Pesan dari Emma: “Ma?? Aku lagi latihan, pelatihku di sebelahku. Kenapa?” 💬" },
          ],
          choices: [
            { text: "Tutup telepon, lalu laporkan panggilan itu ke polisi dan operator selulermu.", next: "safeReport", points: 300, feedback: "Laporan membantu polisi menghubungkan kasus dan memperingatkan orang lain." },
            { text: "Tutup telepon dan lupakan saja — Emma aman.", next: "safeQuiet", points: 100, feedback: "Emma aman, tapi penipu akan mencoba keluarga berikutnya. Melapor itu penting." },
          ],
        },
        callEmma: {
          id: "callEmma",
          lines: [
            { speaker: "daughter", text: "Ma? Aku lagi latihan. Ada apa? Mama kedengarannya panik." },
            { speaker: "narrator", text: "Emma aman. Suara di panggilan pertama itu palsu." },
          ],
          choices: [
            { text: "Laporkan panggilan itu ke polisi, lalu sepakati kata sandi keluarga dengan Emma.", next: "safeReport", points: 400, feedback: "Akhir yang sempurna: lapor, dan buat kata sandi keluarga untuk keadaan darurat berikutnya." },
            { text: "Tarik napas, peluk Emma nanti, lalu lanjutkan hari.", next: "safeQuiet", points: 150, feedback: "Kamu aman, tapi laporan dan kata sandi keluarga akan melindungimu lain kali." },
          ],
        },
        store: {
          id: "store",
          lines: [
            { speaker: "narrator", text: "Kamu membacakan kode kartu hadiah senilai $15.000. Penelepon menutup telepon. Sepuluh menit kemudian Emma menelepon dari tempat latihan — dia tidak pernah dalam bahaya. Uangnya hilang." },
          ],
          ending: { title: "Tertipu", good: false },
        },
        safeReport: {
          id: "safeReport",
          lines: [
            { speaker: "narrator", text: "Kamu melaporkan nomornya. Polisi bilang tiga keluarga lain menerima telepon yang sama minggu ini. Keluargamu sekarang punya kata sandi rahasia untuk keadaan darurat sungguhan." },
          ],
          ending: { title: "Penipuan dikalahkan", good: true },
        },
        safeQuiet: {
          id: "safeQuiet",
          lines: [
            { speaker: "narrator", text: "Emma aman dan tidak ada uang yang hilang. Para penipu pindah ke nomor berikutnya di daftar mereka." },
          ],
          ending: { title: "Aman — tapi tidak dilaporkan", good: true },
        },
      },
    },
  ],
  lessons: [
    "Kepanikan adalah senjata penipu. Tidak apa-apa berhenti sejenak dan menarik napas.",
    "Tutup telepon dan hubungi orang tersayangmu langsung di nomor yang kamu kenal.",
    "Ajukan pertanyaan yang hanya bisa dijawab orang aslinya, dan sepakati kata sandi keluarga.",
    "Kartu hadiah, kripto, dan transfer kawat adalah tanda bahaya. Keadaan darurat sungguhan tidak membutuhkannya.",
    "Suara yang familier bukan bukti: beberapa detik audio dari media sosial bisa cukup untuk mengkloningnya.",
  ],
};

const electionMission: Mission = {
  id: "election-eve",
  number: 4,
  codename: "OPERASI SENYAP",
  title: "Malam Sebelum Pemilu",
  tagline: "48 jam sebelum pemungutan suara, klip audio mengejutkan menjadi viral. Sang kandidat tidak boleh menanggapi.",
  location: "Eropa Tengah",
  year: 2023,
  caseId: "sk-election-2023",
  skill: "Memverifikasi audio politik yang viral",
  briefing: [
    "Dua hari sebelum pemilu nasional, masa tenang resmi dimulai: kandidat tidak boleh berkampanye atau menanggapi secara terbuka.",
    "Sebuah rekaman menyebar di media sosial. Isinya seolah menangkap kandidat oposisi Mira Novak dan seorang jurnalis merencanakan kecurangan pemilu.",
    "Pada 2023, klip palsu persis seperti ini viral di Slowakia selama masa tenang pemilunya. Grup chat keluargamu sudah membagikannya.",
  ],
  stages: [
    {
      kind: "observe",
      title: "Periksa unggahannya",
      brief: "Centang semua yang membuat unggahan ini mencurigakan — bukan sekadar hal yang tidak kamu sukai.",
      maxPoints: 350,
      scene: "social-post",
      transcript: [
        { speaker: "@TruthLeaks_2023 · bergabung 3 hari lalu", line: "🚨 BOCOR: Novak ketahuan berencana MEMBELI SUARA. Sebarkan sebelum dihapus!! 🎧 [audio 0:58]" },
        { speaker: "Audio", line: "“…TPS di wilayah timur kita yang urus, uangnya sudah siap…” (nada datar, desis latar yang rata, jeda aneh antarkata)" },
        { speaker: "Statistik", line: "52.000 suka · 18.000 dibagikan dalam 3 jam · diunggah Jumat 23.40, saat masa tenang" },
      ],
      items: [
        { id: "new", text: "Akun ini baru dibuat 3 hari lalu.", suspicious: true, explain: "Akun yang baru dibuat tanpa riwayat sering dibuat khusus untuk meluncurkan disinformasi." },
        { id: "timing", text: "Diunggah saat masa tenang, ketika kandidat tidak boleh menanggapi.", suspicious: true, explain: "Waktunya dipilih agar bantahan sulit dilakukan, secara hukum maupun praktis, sebelum orang memilih." },
        { id: "audio", text: "Suaranya datar, dengan desis latar yang rata dan jeda aneh.", suspicious: true, explain: "Noise yang seragam, jeda yang tidak alami, dan emosi datar adalah ciri audio sintetis atau hasil potong-sambung." },
        { id: "urgent", text: "“Sebarkan sebelum dihapus!!”", suspicious: true, explain: "Mendesak orang membagikan dengan cepat dirancang untuk mendahului pemeriksa fakta." },
        { id: "likes", text: "Unggahan ini punya 52.000 suka.", suspicious: false, explain: "Popularitas bukan bukti. Unggahan viral bisa benar atau salah — jumlah suka mengukur perhatian, bukan kebenaran." },
        { id: "bias", text: "Kamu memang sudah tidak suka partai kandidat ini.", suspicious: false, explain: "Pendapatmu sendiri bukan bukti tentang klip itu — tapi justru alasan untuk lebih berhati-hati sebelum memercayainya." },
      ],
    },
    {
      kind: "order",
      title: "Rencanakan verifikasimu",
      brief: "Susun langkah verifikasi ini dalam urutan terbaik. Ketuk sebuah langkah untuk menaikkannya.",
      maxPoints: 350,
      steps: [
        { id: "pause", text: "Berhenti — jangan bagikan atau teruskan dulu.", why: "Setiap kali dibagikan, klipnya menyebar lebih jauh. Berhenti tidak merugikan apa pun." },
        { id: "source", text: "Cari pengunggah pertama dan kapan klip itu pertama kali muncul.", why: "Mengetahui siapa yang pertama mengunggah, dan kapan, banyak mengungkap niatnya." },
        { id: "factcheck", text: "Cari di situs pemeriksa fakta dan media berita tepercaya.", why: "Pemeriksa fakta profesional (mis. AFP Fact Check) sering menganalisis klip viral dalam hitungan jam." },
        { id: "response", text: "Cari pernyataan dari orang-orang yang katanya ada di rekaman itu.", why: "Kedua orang dalam klip Slowakia yang asli langsung membantah keasliannya." },
        { id: "analysis", text: "Cek analisis ahli atau forensik terhadap audionya.", why: "Forensik audio bisa mendeteksi potong-sambung dan suara sintetis, tapi anggap alat deteksi sebagai satu petunjuk, bukan putusan." },
        { id: "report", text: "Laporkan unggahan itu ke platform sebagai kemungkinan media yang dimanipulasi.", why: "Laporan membantu platform memberi label atau membatasi konten pada masa-masa sensitif." },
      ],
    },
    {
      kind: "choice",
      title: "Grup chat keluargamu",
      brief: "Pamanmu baru saja mengunggah klip itu dengan tulisan “Tidak bisa dipercaya!! Sebarkan ke mana-mana!”. Apa balasanmu?",
      maxPoints: 300,
      options: [
        { id: "share", text: "“Wah, aku teruskan ke teman-temanku juga.”", points: 0, feedback: "Membagikan klip yang belum diverifikasi saat pemilu bisa mengubah pilihan orang, meski ralatnya datang belakangan." },
        { id: "attack", text: "“Paman gampang banget dibohongi.”", points: 50, feedback: "Instingnya benar, nadanya salah. Mempermalukan orang justru membuat mereka makin membela klip itu." },
        { id: "ignore", text: "Diam saja dan bisukan grupnya.", points: 80, feedback: "Tidak ikut menyebarkan itu bagus, tapi keluargamu mungkin tetap memercayainya." },
        { id: "kind", text: "“Ini diunggah akun yang umurnya baru 3 hari, saat masa tenang, dan pemeriksa fakta bilang ada tanda manipulasi AI. Kita tunggu berita yang sudah diverifikasi dulu sebelum menyebarkan, ya.”", points: 300, feedback: "Sempurna: tenang, buktinya spesifik, dan ada tindakan alternatif. Begini cara menghentikan misinformasi." },
      ],
    },
  ],
  lessons: [
    "Waktu adalah taktik: konten palsu yang dirilis saat targetnya tidak bisa menanggapi dirancang untuk mengalahkan kebenaran.",
    "Popularitas dan pendapatmu sendiri bukan bukti.",
    "Berhenti, telusuri sumbernya, lalu cek pemeriksa fakta sebelum membagikan.",
    "Koreksi orang dengan ramah dan bukti yang spesifik. Cara ini lebih berhasil daripada mempermalukan.",
  ],
};

export const MISSIONS_ID: Mission[] = [heistMission, realOrFakeMission, voiceMission, electionMission];
