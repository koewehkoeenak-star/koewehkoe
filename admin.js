(() => {
"use strict";

  const config = KOEWEH_CONFIG;

  const isConfigValid =
    config.SUPABASE_URL.startsWith("https://") &&
    !config.SUPABASE_URL.includes("ISI_") &&
    config.SUPABASE_ANON_KEY &&
    !config.SUPABASE_ANON_KEY.includes("ISI_");

  const db = isConfigValid
    ? supabase.createClient(
        config.SUPABASE_URL,
        config.SUPABASE_ANON_KEY
      )
    : null;

  const $ = (id) => document.getElementById(id);

  const rupiah = (number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]);

  function showMessage(element, text, type = "") {
    element.textContent = text;
    element.className = `notice ${type}`;
  }

  function createOption(value, label, currentValue) {
    const selected = value === currentValue ? "selected" : "";

    return `
      <option value="${value}" ${selected}>
        ${label}
      </option>
    `;
  }

  // Memuat daftar pesanan
  async function loadOrders() {
    if (!db) return;

    $("ordersBody").innerHTML = `
      <tr>
        <td colspan="6">Memuat pesanan...</td>
      </tr>
    `;

    const { data, error } = await db
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      $("ordersBody").innerHTML = `
        <tr>
          <td colspan="6">
            Gagal memuat pesanan. Periksa konfigurasi dan policy RLS.
          </td>
        </tr>
      `;

      showMessage(
        $("adminMessage"),
        "Gagal membaca pesanan. Pastikan policy SELECT sudah benar.",
        "error"
      );

      return;
    }

    showMessage(
      $("adminMessage"),
      `${data.length} pesanan ditemukan.`,
      "success"
    );

    $("ordersBody").innerHTML = data.length
      ? data.map((order) => `
          <tr>
            <td>
              <b>${escapeHTML(order.order_code)}</b>
              <small>
                ${new Date(order.created_at).toLocaleString("id-ID")}
              </small>
            </td>

            <td>
              ${escapeHTML(order.customer_name)}
              <small>${escapeHTML(order.customer_phone)}</small>
              <small>
                ${escapeHTML(order.customer_address || "-")}
              </small>
            </td>

            <td>
              ${(order.items || []).map((item) => `
                ${escapeHTML(item.nama)}
                (${escapeHTML(item.jenis)})
                × ${Number(item.jumlah)}
                — ${rupiah(Number(item.subtotal))}
              `).join("<br>")}

              <br>
              <b>Total ${rupiah(Number(order.total))}</b>
            </td>

            <td>
              ${escapeHTML(order.payment_method)}
              <small>${escapeHTML(order.payment_status)}</small>
            </td>

            <td>
              <label class="status-label">
                Status pesanan
              </label>

              <select data-os="${escapeHTML(order.id)}">
                ${createOption("new", "Pesanan baru", order.order_status)}
                ${createOption("processing", "Diproses", order.order_status)}
                ${createOption("completed", "Selesai", order.order_status)}
                ${createOption("cancelled", "Dibatalkan", order.order_status)}
              </select>

              <label class="status-label">
                Status pembayaran
              </label>

              <select data-ps="${escapeHTML(order.id)}">
                ${createOption("pending", "Menunggu pembayaran", order.payment_status)}
                ${createOption("paid", "Sudah dibayar", order.payment_status)}
                ${createOption("rejected", "Ditolak", order.payment_status)}
              </select>
            </td>

            <td>
              <button
                class="btn primary small"
                data-save="${escapeHTML(order.id)}"
              >
                Simpan
              </button>
            </td>
          </tr>
        `).join("")
      : `
          <tr>
            <td colspan="6">Belum ada pesanan.</td>
          </tr>
        `;
  }

  // Login owner
  $("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!db) {
      showMessage(
        $("loginMessage"),
        "Isi konfigurasi Supabase di config.js.",
        "error"
      );
      return;
    }

    const { error } = await db.auth.signInWithPassword({
      email: $("adminEmail").value.trim(),
      password: $("adminPassword").value,
    });

    if (error) {
      showMessage(
        $("loginMessage"),
        "Login gagal. Periksa email dan password.",
        "error"
      );
      return;
    }

    await updateDashboard();
  });

  // Menampilkan dashboard berdasarkan status login
  async function updateDashboard() {
    if (!db) return;

    const {
      data: { session },
    } = await db.auth.getSession();

    $("loginPanel").hidden = Boolean(session);
    $("dashboardPanel").hidden = !session;

    if (session) {
      await loadOrders();
    }
  }

  // Refresh pesanan
  $("refreshOrders").addEventListener("click", loadOrders);

  // Logout owner
  $("logoutButton").addEventListener("click", async () => {
    if (!db) return;

    await db.auth.signOut();
    await updateDashboard();
  });

// Menyimpan perubahan status pesanan dan pembayaran
  $("ordersBody").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-save]");
    if (!button) return;

    const id = button.dataset.save;
    const orderSelect = document.querySelector(`[data-os="${CSS.escape(id)}"]`);
    const paymentSelect = document.querySelector(`[data-ps="${CSS.escape(id)}"]`);

    if (!db) {
      showMessage($("adminMessage"), "Koneksi Supabase belum tersedia.", "error");
      return;
    }

    if (!orderSelect || !paymentSelect) {
      showMessage($("adminMessage"), "Dropdown status tidak ditemukan. Refresh halaman.", "error");
      return;
    }

    const newOrderStatus = orderSelect.value;
    const newPaymentStatus = paymentSelect.value;
    const perluStruk =
      newOrderStatus === "completed" && newPaymentStatus === "paid";

    // Jendela struk dibuka sekarang (saat klik) supaya tidak diblokir popup blocker
    const strukWindow = perluStruk
      ? window.open("", "_blank", "width=380,height=600")
      : null;

    button.disabled = true;
    showMessage($("adminMessage"), "Sedang menyimpan perubahan...", "");

    try {
      const { data, error } = await db
        .from("orders")
        .update({
          order_status: newOrderStatus,
          payment_status: newPaymentStatus,
        })
        .eq("id", id)
        .select("*");

      if (error) {
        console.error("Kesalahan Supabase:", error);
        showMessage($("adminMessage"), "Gagal menyimpan: " + error.message, "error");
        if (strukWindow) strukWindow.close();
        return;
      }

      if (!data || data.length === 0) {
        showMessage(
          $("adminMessage"),
          "Tidak ada pesanan yang diperbarui. Periksa policy UPDATE Supabase.",
          "error"
        );
        if (strukWindow) strukWindow.close();
        return;
      }

      showMessage(
        $("adminMessage"),
        "Status pesanan dan pembayaran berhasil disimpan!",
        "success"
      );

         if (strukWindow) Struk.cetak(data[0], strukWindow, { status: "LUNAS", judul: "ORDER" });

      await loadOrders();
      $("adminMessage").scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      console.error("Kesalahan saat menyimpan:", err);
      showMessage($("adminMessage"), "Terjadi kesalahan: " + err.message, "error");
      if (strukWindow) strukWindow.close();
    } finally {
      button.disabled = false;
    }
  });
  // Pemeriksaan konfigurasi awal
  if (!isConfigValid) {
    showMessage(
      $("loginMessage"),
      "Isi SUPABASE_URL dan SUPABASE_ANON_KEY di config.js.",
      "error"
    );
  } else {
    updateDashboard();
  }
})();
