from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .auth_routes import router as auth_router
from .room_routes import router as room_router
app = FastAPI()

# ✅ Cấu hình CORS:
origins = [
    "http://localhost:5173",  # React Vite FE
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
@app.get("/")
def root():
    return {"message": "CORS đã bật thành công"}
