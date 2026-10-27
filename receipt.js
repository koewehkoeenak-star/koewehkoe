const Struk = (() => {
  const rupiah = (n) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", maximumFractionDigits: 0,
    }).format(n);

  const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);

  // Alamat lengkap logo, supaya terbaca juga di jendela struk
  const LOGO_URL = new URL("foto/logo.png", window.location.href).href;

  function barcode(text) {
    const bits = "101" + String(text).split("")
      .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0")).join("") + "101";
    const bars = bits.split("")
      .map((b, i) => (b === "1" ? `<rect x="${i * 2}" y="0" width="2" height="60"/>` : ""))
      .join("");
    return `<svg viewBox="0 0 ${bits.length * 2} 60" preserveAspectRatio="none"
      width="100%" height="60" fill="#111">${bars}</svg>`;
  }

  // opts.status : "LUNAS" atau "MENUNGGU PEMBAYARAN"
  // opts.judul  : "ORDER" atau "BUKTI PESANAN"
  function html(order, opts = {}) {
    const status = opts.status || "LUNAS";
    const judul = opts.judul || "ORDER";
    const pad = (n) => String(n).padStart(2, "0");
    const items = order.items || [];
    const totalQty = items.reduce((s, i) => s + Number(i.jumlah || 0), 0);

    const baris = items.map((item) => `
      <tr>
        <td class="qty">${pad(Number(item.jumlah))}</td>
        <td>${esc(item.nama)}<br><em class="sub">(${esc(item.jenis)})</em></td>
        <td class="right">${rupiah(Number(item.subtotal))}</td>
      </tr>`).join("");

    const catatan =
      order.customer_address && order.customer_address !== "Pickup"
        ? `<div><b>CATATAN</b> ${esc(order.customer_address)}</div>`
        : "";

    const now = new Date();
    const tanggal = now.toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    }).toUpperCase();
    const jam = now.toLocaleTimeString("id-ID");

    return `<!doctype html>
<html><head><meta charset="utf-8">
<title>Struk ${esc(order.order_code)}</title>
<style>
  @page { margin: 8mm; }
  * { box-sizing: border-box; }
  body { margin:0; padding:16px; background:#e9e9e9;
    font-family:"Courier New",Courier,monospace; font-size:13px; color:#222;
    -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .paper { width:320px; margin:0 auto; padding:28px 22px 26px; text-align:left;
    background:
      linear-gradient(115deg, rgba(0,0,0,.04) 0%, transparent 18%, rgba(255,255,255,.7) 32%, transparent 50%, rgba(0,0,0,.035) 68%, transparent 85%),
      linear-gradient(20deg, transparent 40%, rgba(0,0,0,.03) 55%, transparent 70%),
      #f6f6f6;
    box-shadow:0 2px 10px rgba(0,0,0,.2); }
  .logo { text-align:center; margin-bottom:16px; }
  .logo img { display:block; margin:0 auto; width:90px; height:auto; }
  .head { font-weight:bold; line-height:1.6; }
  hr { border:none; border-top:1px dashed #333; margin:14px 0; }
  table { width:100%; border-collapse:collapse; }
  th { text-align:left; padding-bottom:4px; }
  td { padding:3px 0; vertical-align:top; }
  .qty { width:34px; }
  .right { text-align:right; white-space:nowrap; }
  .sub { color:#666; font-size:11px; font-style:normal; }
  .total td { font-weight:bold; font-size:14px; }
  .info b { display:inline-block; min-width:82px; }
  .info div { line-height:1.7; }
  .thanks { text-align:center; color:#666; margin:14px 0 12px; letter-spacing:1px; }
  .barcode { padding:0 6px; }
  @media print { body { background:#fff; padding:0; } .paper { box-shadow:none; } }
</style></head>
<body>
  <div class="paper">

    <div class="logo">
      <img src="${LOGO_URL}" alt="Koeweh">
    </div>

    <div class="head">${esc(judul)} #${esc(order.order_code)}<br>${tanggal}</div>
    <hr>

    <table>
      <thead><tr><th>QTY</th><th>ITEM</th><th class="right">HARGA</th></tr></thead>
      <tbody>${baris}</tbody>
    </table>
    <hr>

    <table>
      <tr><td>ITEM COUNT</td><td class="right">${pad(totalQty)}</td></tr>
      <tr><td>TOTAL DISCOUNT</td><td class="right">Rp 0</td></tr>
      <tr class="total"><td>TOTAL</td><td class="right">${rupiah(Number(order.total))}</td></tr>
    </table>
    <hr>

    <div class="info">
      <div><b>CUSTOMER</b> ${esc(order.customer_name)}</div>
      <div><b>TELP</b> ${esc(order.customer_phone)}</div>
      <div><b>METODE</b> ${esc(order.payment_method)}</div>
      <div><b>AMBIL</b> PICKUP (AMBIL SENDIRI)</div>
      ${catatan}
      <div><b>STATUS</b> ${esc(status)}</div>
      <div><b>WAKTU</b> ${jam}</div>
    </div>
    <hr>

    <div class="thanks">TERIMA KASIH SUDAH MEMESAN</div>
    <div class="barcode">${barcode(order.order_code)}</div>

  </div>
</body></html>`;
  }

  // Dipakai admin: tulis ke jendela baru lalu print
  function cetak(order, w, opts) {
    w.document.open();
    w.document.write(html(order, opts));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 600);
  }

  return { html, cetak };
})();