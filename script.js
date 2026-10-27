
(() => {
    "use strict";

    // ==========================================
    // 1. KONFIGURASI
    // ==========================================

    const config = window.KOEWEH_CONFIG;

    if (!config) {
        console.error("config.js tidak berhasil dimuat.");
        alert("Konfigurasi website tidak ditemukan. Periksa config.js.");
        return;
    }

    const supabaseReady =
        typeof window.supabase !== "undefined" &&
        config.SUPABASE_URL &&
        config.SUPABASE_ANON_KEY;

    const db = supabaseReady
        ? window.supabase.createClient(
            config.SUPABASE_URL,
            config.SUPABASE_ANON_KEY
        )
        : null;

    const cart = [];

    // ==========================================
    // 2. FUNGSI BANTU
    // ==========================================

    const $ = (id) => document.getElementById(id);

    const rupiah = (nominal) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(nominal);

    const escapeHTML = (value) =>
        String(value ?? "").replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

    const getMenu = (id) =>
        config.MENU.find((item) => item.id === Number(id));

    const getQuantity = (id) =>
        cart
            .filter((item) => item.id === Number(id))
            .reduce((total, item) => total + item.qty, 0);

    const getTotal = () =>
        cart.reduce(
            (total, item) => total + item.qty * item.price,
            0
        );

    // ==========================================
    // 3. MENAMPILKAN MENU DAN FOTO PRODUK
    // ==========================================

    function renderMenu() {
        const container = $("daftarMenu");

        if (!container) {
            console.error("Elemen daftarMenu tidak ditemukan.");
            return;
        }

        container.innerHTML = config.MENU.map((item) => {
            const quantity = getQuantity(item.id);

            // PENTING: menggunakan item.Image dari config.js
            const imagePath = item.Image || "";

            const stockAvailable =
                item.stok !== undefined &&
                item.stok !== null &&
                item.stok !== "";

            const stock = Number(item.stok);

            const stockText = stockAvailable
                ? `Stok: ${escapeHTML(item.stok)}`
                : "";

            const outOfStock =
                stockAvailable && (!Number.isFinite(stock) || stock <= 0);

            return `
                <article class="card">

                    <div class="photo">
                        ${
                            imagePath
                                ? `
                                    <img
                                        src="${escapeHTML(imagePath)}"
                                        alt="${escapeHTML(item.nama)}"
                                        loading="lazy"
                                        onerror="
                                            this.style.display='none';
                                            this.nextElementSibling.hidden=false;
                                        "
                                    >
                                `
                                : ""
                        }

                        <div class="placeholder" ${
                            imagePath ? "hidden" : ""
                        }>
                            ♡
                            <small>${escapeHTML(item.nama)}</small>
                        </div>
                    </div>

                    <div class="cardbody">
                        <h3>${escapeHTML(item.nama)}</h3>

                        <p>${escapeHTML(item.deskripsi)}</p>

                        <select
                            id="jenis-${item.id}"
                            aria-label="Pilih jenis ${escapeHTML(item.nama)}"
                        >
                            <option value="frozen">
                                Frozen · ${rupiah(item.hargaFrozen)}
                            </option>

                            <option value="goreng">
                                Sudah digoreng · ${rupiah(item.hargaGoreng)}
                            </option>
                        </select>

                        ${
                            stockText
                                ? `<small class="muted">${stockText}</small>`
                                : ""
                        }

                        ${
                            quantity > 0
                                ? `
                                    <div class="qty">
                                        <button
                                            type="button"
                                            data-card="${item.id}"
                                            data-d="-1"
                                        >−</button>

                                        <b>${quantity}</b>

                                        <button
                                            type="button"
                                            data-card="${item.id}"
                                            data-d="1"
                                            ${outOfStock ? "disabled" : ""}
                                        >+</button>
                                    </div>
                                `
                                : `
                                    <button
                                        type="button"
                                        class="btn primary full"
                                        data-add="${item.id}"
                                        ${outOfStock ? "disabled" : ""}
                                    >
                                        ${
                                            outOfStock
                                                ? "Stok habis"
                                                : "Tambah ke keranjang"
                                        }
                                    </button>
                                `
                        }
                    </div>
                </article>
            `;
        }).join("");
    }

    // ==========================================
    // 4. KERANJANG BELANJA
    // ==========================================

    function renderCart() {
        const cartBadge = $("cartBadge");
        const totalHarga = $("totalHarga");
        const cartItems = $("cartItems");

        const totalQuantity = cart.reduce(
            (total, item) => total + item.qty,
            0
        );

        cartBadge.textContent = totalQuantity;
        totalHarga.textContent = rupiah(getTotal());

        if (cart.length === 0) {
            cartItems.innerHTML = `
                <p class="muted">Keranjang masih kosong.</p>
            `;
            return;
        }

        cartItems.innerHTML = cart.map((item) => {
            const menu = getMenu(item.id);

            return `
                <div class="cartline">
                    <div>
                        <b>${escapeHTML(menu?.nama || "Produk")}</b>

                        <small>
                            ${
                                item.type === "goreng"
                                    ? "Sudah digoreng"
                                    : "Frozen"
                            }
                            · ${rupiah(item.price)} × ${item.qty}
                        </small>

                        <b>${rupiah(item.price * item.qty)}</b>
                    </div>

                    <div class="qty compact">
                        <button
                            type="button"
                            data-cart="${item.id}"
                            data-type="${item.type}"
                            data-d="-1"
                        >−</button>

                        <b>${item.qty}</b>

                        <button
                            type="button"
                            data-cart="${item.id}"
                            data-type="${item.type}"
                            data-d="1"
                        >+</button>
                    </div>
                </div>
            `;
        }).join("");
    }

    function refresh() {
        renderMenu();
        renderCart();
    }

    // ==========================================
    // 5. TAMBAH DAN KURANGI JUMLAH PRODUK
    // ==========================================

    function changeQuantity(id, type, amount) {
        const menu = getMenu(id);

        if (!menu) {
            console.error("Produk tidak ditemukan:", id);
            return;
        }

        const item = cart.find(
            (cartItem) =>
                cartItem.id === Number(id) &&
                cartItem.type === type
        );

        const totalProductQuantity = getQuantity(id);

        // Periksa stok hanya jika stok diatur di config.js
        const stockDefined =
            menu.stok !== undefined &&
            menu.stok !== null &&
            menu.stok !== "";

        if (amount > 0) {
            if (stockDefined) {
                const stock = Number(menu.stok);

                if (
                    !Number.isFinite(stock) ||
                    totalProductQuantity >= stock
                ) {
                    alert("Jumlah pesanan sudah mencapai stok yang tersedia.");
                    return;
                }
            }

            const price =
                type === "goreng"
                    ? menu.hargaGoreng
                    : menu.hargaFrozen;

            if (item) {
                item.qty += 1;
            } else {
                cart.push({
                    id: Number(id),
                    type,
                    qty: 1,
                    price
                });
            }
        } else if (item) {
            item.qty -= 1;

            if (item.qty <= 0) {
                cart.splice(cart.indexOf(item), 1);
            }
        }

        refresh();
    }

    // Klik tombol pada kartu menu
    $("daftarMenu").addEventListener("click", (event) => {
        const addButton = event.target.closest("[data-add]");
        const quantityButton = event.target.closest("[data-card]");

        if (addButton) {
            const id = Number(addButton.dataset.add);
            const type = $(`jenis-${id}`).value;

            changeQuantity(id, type, 1);
            return;
        }

        if (quantityButton) {
            const id = Number(quantityButton.dataset.card);
            const amount = Number(quantityButton.dataset.d);

            if (amount > 0) {
                const type = $(`jenis-${id}`).value;
                changeQuantity(id, type, 1);
            } else {
                // Kurangi satu produk dari jenis yang terakhir
                // tersedia di keranjang.
                const item = cart.find(
                    (cartItem) => cartItem.id === id
                );

                if (item) {
                    changeQuantity(id, item.type, -1);
                }
            }
        }
    });

    // Klik tombol pada keranjang
    $("cartItems").addEventListener("click", (event) => {
        const button = event.target.closest("[data-cart]");

        if (!button) return;

        changeQuantity(
            button.dataset.cart,
            button.dataset.type,
            Number(button.dataset.d)
        );
    });

    // ==========================================
    // 6. INFORMASI PEMBAYARAN DAN FOTO QRIS
    // ==========================================

    function renderPayment() {
        const method = $("metodePembayaran").value;
        const payment = config.PAYMENT;
        const container = $("paymentInstructions");

        if (method === "QRIS") {
            const qrisPath = payment.Image || "";

            container.innerHTML = `
                <b>Pembayaran QRIS</b>

                <p>
                    Scan QRIS resmi Koeweh menggunakan aplikasi
                    pembayaran yang mendukung QRIS.
                </p>

                ${
                    qrisPath
                        ? `
                            <img
                                class="qris"
                                src="${escapeHTML(qrisPath)}"
                                alt="QRIS Pembayaran Koeweh"
                                onerror="
                                    this.style.display='none';
                                    this.nextElementSibling.hidden=false;
                                "
                            >

                            <p hidden>
                                Foto QRIS tidak ditemukan.
                                Periksa lokasi file pada config.js.
                            </p>
                        `
                        : `
                            <p>Lokasi foto QRIS belum diatur.</p>
                        `
                }
            `;
        } else if (method === "Transfer Bank") {
            container.innerHTML = `
                <b>Pembayaran Transfer Bank</b>

                <p>
                    Bank: <b>${escapeHTML(payment.bankName)}</b><br>
                    Rekening: <b>${escapeHTML(payment.accountNumber)}</b><br>
                    Atas nama: <b>${escapeHTML(payment.accountHolder)}</b>
                </p>
            `;
        } else {
            container.innerHTML = `
                <b>Pembayaran COD</b>
                <p>${escapeHTML(payment.codNote)}</p>
            `;
        }
    }

    $("metodePembayaran").addEventListener(
        "change",
        renderPayment
    );
    function tampilkanStrukCustomer(order) {
        const overlay = document.createElement("div");
        overlay.style.cssText =
            "position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;" +
            "display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px";

        const frame = document.createElement("iframe");
        frame.style.cssText =
            "width:380px;max-width:100%;height:80vh;border:0;border-radius:12px;background:#e9e9e9";
        frame.srcdoc = Struk.html(order, {
            status: "MENUNGGU PEMBAYARAN",
            judul: "BUKTI PESANAN",
        });

        const bar = document.createElement("div");
        bar.style.cssText = "display:flex;gap:8px";
        bar.innerHTML = `
            <button class="btn primary" type="button" id="strukCetak">Cetak / Simpan PDF</button>
            <button class="btn light" type="button" id="strukTutup">Tutup</button>`;

        overlay.append(frame, bar);
        document.body.appendChild(overlay);

        bar.querySelector("#strukCetak").onclick = () => frame.contentWindow.print();
        bar.querySelector("#strukTutup").onclick = () => overlay.remove();
    }
    // ==========================================
    // 7. CHECKOUT DAN SIMPAN PESANAN
    // ==========================================

    $("checkoutForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const status = $("statusPesan");

        if (cart.length === 0) {
            status.className = "notice error";
            status.textContent = "Keranjang masih kosong.";
            return;
        }

        if (!db) {
            status.className = "notice error";
            status.textContent =
                "Supabase belum siap. Periksa URL dan anon key di config.js.";
            return;
        }

        const button = $("submitOrder");

        button.disabled = true;
        button.textContent = "Menyimpan...";

        const orderId = crypto.randomUUID();

        const orderCode =
            "KW-" + Date.now().toString().slice(-8);

        const items = cart.map((item) => ({
            id: item.id,
            nama: getMenu(item.id).nama,
            jenis:
                item.type === "goreng"
                    ? "Sudah digoreng"
                    : "Frozen",
            jumlah: item.qty,
            harga_satuan: item.price,
            subtotal: item.qty * item.price
        }));

               const paymentMethod = $("metodePembayaran").value;

        try {
            const orderData = {
                id: orderId,
                order_code: orderCode,
                customer_name: $("nama").value.trim(),
                customer_phone: $("kontak").value.trim(),
                customer_address: $("alamat").value.trim() || "Pickup",
                items,
                total: getTotal(),
                payment_method: paymentMethod,
                payment_status: "pending",
                order_status: "new"
            };

            const { error } = await db.from("orders").insert(orderData);

            if (error) throw error;

            status.className = "notice success";
            status.textContent =
                `Pesanan ${orderCode} berhasil disimpan. ` +
                "Silakan ikuti instruksi pembayaran dan simpan nomor pesanan.";

            cart.splice(0);

            $("checkoutForm").reset();

            renderPayment();
            refresh();

            tampilkanStrukCustomer(orderData);
        } catch (error) {
            console.error("Gagal menyimpan pesanan:", error);

            status.className = "notice error";
            status.textContent =
                "Pesanan gagal disimpan. Periksa koneksi, " +
                "konfigurasi Supabase, dan izin tabel orders.";
        } finally {
            button.disabled = false;
            button.textContent = "Buat pesanan";
        }
    });

    // ==========================================
    // 8. JALANKAN WEBSITE
    // ==========================================

    renderPayment();
    refresh();

})();
