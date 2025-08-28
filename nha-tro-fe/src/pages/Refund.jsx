import React, { useState } from "react";

export default function Refund() {
  const [form, setForm] = useState({
    order_id: "",
    TransactionType: "02",
    amount: "",
    trans_date: "",
    order_desc: "",
  });
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Gửi dữ liệu tới backend xử lý hoàn tiền
    // Ví dụ: const res = await fetch("/api/refund", { method: "POST", body: JSON.stringify(form) });
    // const data = await res.json();
    // setResponse(data);
    // Demo:
    setResponse({
      order_id: form.order_id,
      TransactionType: form.TransactionType,
      amount: form.amount,
      trans_date: form.trans_date,
      order_desc: form.order_desc,
      vnp_ResponseCode: "00",
      vnp_Message: "Hoàn tiền thành công (demo)",
    });
  };

  return (
    <div className="container py-4">
      <h3 className="mb-3">Hoàn tiền VNPAY</h3>
      <form id="create_form" onSubmit={handleSubmit}>
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
          <label htmlFor="trantype">Kiểu hoàn tiền</label>
          <select
            name="TransactionType"
            id="trantype"
            className="form-control"
            value={form.TransactionType}
            onChange={handleChange}
          >
            <option value="02">Hoàn tiền toàn phần</option>
            <option value="03">Hoàn tiền một phần</option>
          </select>
        </div>
        <div className="form-group mb-3">
          <label htmlFor="amount">Số tiền hoàn trả</label>
          <input
            className="form-control"
            id="amount"
            name="amount"
            type="text"
            value={form.amount}
            onChange={handleChange}
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="trans_date">Thời gian giao dịch thanh toán</label>
          <input
            className="form-control"
            id="trans_date"
            name="trans_date"
            type="text"
            value={form.trans_date}
            onChange={handleChange}
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="order_desc">Nội dung/lý do hoàn trả</label>
          <input
            className="form-control"
            id="order_desc"
            name="order_desc"
            type="text"
            value={form.order_desc}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Refund
        </button>
      </form>
      {response && (
        <div className="mt-4">
          <h5>Kết quả hoàn tiền:</h5>
          {Object.entries(response).map(([key, val]) => (
            <div className="form-group mb-2" key={key}>
              <label>
                {key} : {val}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}