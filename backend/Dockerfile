FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Biến môi trường (PORT, DB_URL, ...)
ENV PYTHONUNBUFFERED=1

CMD ["sh", "start.sh"]
