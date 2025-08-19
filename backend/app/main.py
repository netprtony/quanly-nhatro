from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from fastapi import FastAPI
from app.routers import (
    auth_router,
    account_router,
    contract_router,
    device_router,
    electricity_router,
    invoice_router,
    payment_router,
    # protected_router,
    reservation_router,
    room_router,
    roomtype_router,
    tenant_router,
)
app = FastAPI()

# ✅ Cấu hình CORS:
origins = [
    "http://localhost:3000",  # React Vite FE
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,              # Cho phép các origin này
    allow_credentials=True,
    allow_methods=["*"],                # Cho phép tất cả method: GET, POST, PUT...
    allow_headers=["*"],                # Cho phép tất cả headers
)

# Đăng ký router
app.include_router(auth_router)
app.include_router(account_router)
app.include_router(contract_router)
app.include_router(device_router)
app.include_router(electricity_router)
app.include_router(invoice_router)
app.include_router(payment_router)
# app.include_router(protected_router)
app.include_router(reservation_router)
app.include_router(room_router)
app.include_router(roomtype_router)
app.include_router(tenant_router)
@app.get("/")
def root():
    return {"message": "CORS đã bật thành công"}
