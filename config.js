/* Isi konfigurasi Supabase dan detail pembayaran. Jangan pernah gunakan service_role key di browser. */
window.KOEWEH_CONFIG={
 SUPABASE_URL:"https://cskkedxsprnosmygalfp.supabase.co",
 SUPABASE_ANON_KEY:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNza2tlZHhzcHJub3NteWdhbGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MTAzMzcsImV4cCI6MjEwODQ4NjMzN30.SyVM_OooaVlzJngEc4-NpFP8hcDpobCorgnfpyERvGk",
 PAYMENT:{
    Image:"foto/qris.jpg",
    bankName:"BSI",
    accountNumber:"0999999999",
    accountHolder:"ABYASA",
    codNote:"Bayar saat pesanan diterima."
      },
 MENU:[
  { id: 1, nama: "Risol Sosis", Image: "foto/risol-sosis.jpg",
        deskripsi: "Risol renyah dengan isian sosis yang gurih dan lezat dengan mayones yang menciptakan rasa manis sehingga rasa balance [dapat ditambah saos jika suka]. harga tertera untuk 1 pack isi 10pcs.",
        hargaFrozen: 30000, hargaGoreng: 35000 },
      { id: 2, nama: "Risol Ragout", Image: "foto/risol-ragout.jpg",
        deskripsi: "Kulit risol yang lembut dan renyah di luar, berisi ragout creamy dengan perpaduan ayam dan sayuran yang gurih. Setiap gigitan menghadirkan rasa lembut, lezat, dan bikin nagih! harga tertera untuk 1 pack isi 10pcs.",
        hargaFrozen: 25000, hargaGoreng: 30000 },
      { id: 3, nama: "Risol Blackpaper",Image: "foto/risol-Blackpaper.jpg",
        deskripsi: "Sensasi risol gurih dengan isian bercita rasa lada hitam yang khas. Aromanya menggoda, rasanya kaya rempah dengan sentuhan pedas hangat, dibalut kulit renyah yang bikin susah berhenti ngemil. harga tertera untuk 1 pack isi 10pcs.",
        hargaFrozen: 25000, hargaGoreng: 30000 } ,
         { id: 4, nama: "Risol Geprek", Image: "foto/risol-geprek.jpg",
        deskripsi: "Buat pencinta pedas, risol geprek hadir dengan isian bercita rasa ayam geprek yang gurih dan pedas menggigit. Kulitnya renyah dengan sensasi pedas yang menggugah selera di setiap gigitan!. harga tertera untuk 1 pack isi 10pcs.",
        hargaFrozen: 30000, hargaGoreng: 35000 },
      { id: 5, nama: "Risol Bolognese", Image: "foto/risol-bolognese.jpg",
        deskripsi: "Perpaduan kulit risol renyah dengan isian saus bolognese bercita rasa tomat dan daging yang gurih. Rasanya kaya, sedikit asam segar, dan menghadirkan sensasi ala Italia dalam setiap gigitan! harga tertera untuk 1 pack isi 10pcs.",
        hargaFrozen: 30000, hargaGoreng: 35000 },
      { id: 6, nama: "Curry puff", Image: "foto/curry-puff.jpg",
        deskripsi: " Pastry berlapis dengan kulit renyah dan isian kari berbumbu yang kaya rasa. Perpaduan rempah aromatik dan isian gurih menjadikan camilan ini nikmat disantap selagi hangat. harga tertera untuk 1 pack isi 10pcs.",
        hargaFrozen: 30000, hargaGoreng: 35000 }
      ]
};
