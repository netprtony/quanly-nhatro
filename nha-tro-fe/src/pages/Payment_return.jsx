import React from "react";

export default function PaymentReturn({ result, order_id, amount, order_desc, vnp_TransactionNo, vnp_ResponseCode, msg, title }) {
  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-header fw-bold">
          {title}: {result}
        </div>
        <div className="card-body">
          <p>order_id: {order_id}</p>
          <p>amount: {amount}</p>
          <p>order_desc: {order_desc}</p>
          <p>vnp_TransactionNo: {vnp_TransactionNo}</p>
          {vnp_ResponseCode === "00" ? (
            <p>
              vnp_ResponseCode: {vnp_ResponseCode} - <span className="text-success">Thành công</span>
            </p>
          ) : (
            <p>
              vnp_ResponseCode: {vnp_ResponseCode} - <span className="text-danger">Lỗi</span>
            </p>
          )}
          {msg && (
            <p className="alert alert-warning mt-2">{msg}</p>
          )}
        </div>
      </div>
    </div>
  );
}