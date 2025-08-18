from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .auth_routes import router as auth_router
from .room_routes import router as room_router
from .roomtype_routes import router as roomtype_router
from .tenant_routes import router as tenant_router
from .contract_routes import router as contract_routes
from .device_routes import router as device_router
from .payment_routes import router as payment_router
from .electricity_routes import router as electricity_router
from .account_routes import router as account_router
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
app.include_router(room_router)
app.include_router(roomtype_router)
app.include_router(contract_routes)
app.include_router(device_router)
app.include_router(payment_router)
app.include_router(electricity_router)
app.include_router(tenant_router)
app.include_router(account_router)
@app.get("/")
def root():
    return {"message": "CORS đã bật thành công"}
