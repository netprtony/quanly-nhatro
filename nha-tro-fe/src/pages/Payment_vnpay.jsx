import React, { useState } from "react";

const BANKS = [
  { value: "", label: "Không chọn" },
  { value: "NCB", label: "Ngân hàng NCB" },
  { value: "AGRIBANK", label: "Ngân hàng Agribank" },
  { value: "SCB", label: "Ngân hàng SCB" },
  { value: "SACOMBANK", label: "Ngân hàng SacomBank" },
  { value: "EXIMBANK", label: "Ngân hàng EximBank" },
  { value: "MSBANK", label: "Ngân hàng MSBANK" },
  { value: "NAMABANK", label: "Ngân hàng NamABank" },
  { value: "VNMART", label: "Ví điện tử VnMart" },
  { value: "VIETINBANK", label: "Ngân hàng Vietinbank" },
  { value: "VIETCOMBANK", label: "Ngân hàng VCB" },
  { value: "HDBANK", label: "Ngân hàng HDBank" },
  { value: "DONGABANK", label: "Ngân hàng Đông Á" },
  { value: "TPBANK", label: "Ngân hàng TPBank" },
  { value: "OJB", label: "Ngân hàng OceanBank" },
  { value: "BIDV", label: "Ngân hàng BIDV" },
  { value: "TECHCOMBANK", label: "Ngân hàng Techcombank" },
  { value: "VPBANK", label: "Ngân hàng VPBank" },
  { value: "MBBANK", label: "Ngân hàng MBBank" },
  { value: "ACB", label: "Ngân hàng ACB" },
  { value: "OCB", label: "Ngân hàng OCB" },
  { value: "IVB", label: "Ngân hàng IVB" },
  { value: "VISA", label: "Thanh toán qua VISA/MASTER" },
];

const ORDER_TYPES = [
  { value: "topup", label: "Nạp tiền điện thoại" },
  { value: "billpayment", label: "Thanh toán hóa đơn" },
  { value: "fashion", label: "Thời trang" },
  { value: "other", label: "Khác - Xem thêm tại VNPAY" },
];

export default function Payment_vnpay() {
  const now = new Date();
  const defaultOrderId = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  const defaultDesc = `Thanh toán đơn hàng thời gian: ${now.toLocaleString("vi-VN")}`;

  const [form, setForm] = useState({
    order_type: "billpayment",
    order_id: defaultOrderId,
    amount: 10000,
    order_desc: defaultDesc,
    bank_code: "",
    language: "vn",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Gửi dữ liệu tới backend xử lý thanh toán
    // Ví dụ: fetch("/api/payment", { method: "POST", body: JSON.stringify(form) })
    alert("Thanh toán thành công (demo)!\n" + JSON.stringify(form, null, 2));
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3">Thanh toán VNPAY</h3>
      <form onSubmit={handleSubmit} id="create_form">
        <div className="form-group mb-3">
          <label htmlFor="order_type">Loại hàng hóa</label>
          <select
            name="order_type"
            id="order_type"
            className="form-control"
            value={form.order_type}
            onChange={handleChange}
          >
            {ORDER_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group mb-3">
          <label htmlFor="order_id">Mã hóa đơn</label>
          <input
            className="form-control"
            id="order_id"
            name="order_id"
            type="text"
            value={form.order_id}
            onChange={handleChange}
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="amount">Số tiền</label>
          <input
            className="form-control"
            id="amount"
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            min={0}
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="order_desc">Nội dung thanh toán</label>
          <textarea
            className="form-control"
            cols={20}
            id="order_desc"
            name="order_desc"
            rows={2}
            value={form.order_desc}
            onChange={handleChange}
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="bank_code">Ngân hàng</label>
          <select
            name="bank_code"
            id="bank_code"
            className="form-control"
            value={form.bank_code}
            onChange={handleChange}
          >
            {BANKS.map((bank) => (
              <option key={bank.value} value={bank.value}>{bank.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group mb-3">
          <label htmlFor="language">Ngôn ngữ</label>
          <select
            name="language"
            id="language"
            className="form-control"
            value={form.language}
            onChange={handleChange}
          >
            <option value="vn">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Thanh toán Redirect
        </button>
      </form>
    </div>
  );
}