# syntax=docker/dockerfile:1.7
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Hỗ trợ build mysqlclient (nếu dùng), hoặc dùng PyMySQL cho nhẹ
RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential default-libmysqlclient-dev curl \
 && rm -rf /var/lib/apt/lists/*

# Cài requirements (file requirements.txt đang ở root)
COPY requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt

# Copy mã nguồn backend
COPY backend/app /app/app
# Copy start.sh nếu có
COPY backend/start.sh /app/start.sh
# Chuyển CRLF -> LF và cấp quyền chạy; nếu bạn không dùng start.sh sẽ fallback CMD uvicorn bên dưới
RUN if [ -f /app/start.sh ]; then sed -i 's/\r$//' /app/start.sh && chmod +x /app/start.sh; fi

EXPOSE 8000

# Ưu tiên chạy script của bạn; nếu không có thì chạy uvicorn trực tiếp
CMD [ "bash", "-lc", "if [ -f /app/start.sh ]; then /app/start.sh; else uvicorn app.main:app --host 0.0.0.0 --port 8000; fi" ]