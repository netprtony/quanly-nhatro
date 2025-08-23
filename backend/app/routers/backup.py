import os
import shutil
import subprocess
from fastapi import APIRouter, Query, HTTPException, BackgroundTasks
from datetime import datetime, timedelta
from typing import List, Optional

router = APIRouter(prefix="/backup", tags=["Backup"])
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DB = os.getenv("MYSQL_DB", "nhatrobaobao")
BACKUP_DIR = os.getenv("BACKUP_DIR", "./backups")
MYSQL_HOST = "localhost"
MYSQL_PORT = 3306
os.makedirs(BACKUP_DIR, exist_ok=True)


@router.post("/backup")
def backup_database():
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        dump_file = os.path.join(BACKUP_DIR, f"backup_{timestamp}.sql")
        binlog_info = os.path.join(BACKUP_DIR, f"binlog_{timestamp}.txt")

        # Backup full DB
        dump_cmd = [
            "mysqldump",
            f"-u{MYSQL_USER}",
            f"-p{MYSQL_PASSWORD}",
            f"-h{MYSQL_HOST}",
            f"-P{MYSQL_PORT}",
            MYSQL_DB,
        ]
        with open(dump_file, "w") as f:
            subprocess.run(dump_cmd, stdout=f, check=True)

        # Lấy thông tin binlog hiện tại
        show_cmd = [
            "mysql",
            f"-u{MYSQL_USER}",
            f"-p{MYSQL_PASSWORD}",
            "-e",
            "SHOW MASTER STATUS;"
        ]
        result = subprocess.run(show_cmd, capture_output=True, text=True, check=True)
        with open(binlog_info, "w") as f:
            f.write(result.stdout)

        return {"message": "Backup thành công", "dump_file": dump_file, "binlog_info": binlog_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/restore")
def restore_database(start_time: str, end_time: str, backup_file: str):
    """
    start_time, end_time: định dạng 'YYYY-MM-DD HH:MM:SS'
    backup_file: đường dẫn tới file dump.sql
    """
    try:
        # 1. Restore full backup
        restore_cmd = [
            "mysql",
            f"-u{MYSQL_USER}",
            f"-p{MYSQL_PASSWORD}",
            MYSQL_DB
        ]
        with open(backup_file, "r") as f:
            subprocess.run(restore_cmd, stdin=f, check=True)

        # 2. Apply binlog trong khoảng thời gian
        binlog_apply_cmd = [
            "mysqlbinlog",
            f"--start-datetime={start_time}",
            f"--stop-datetime={end_time}",
            "--database", MYSQL_DB,
            "mysql-bin.000001"  # thay bằng binlog thực tế (có thể đọc từ binlog_info)
        ]

        apply_mysql_cmd = [
            "mysql",
            f"-u{MYSQL_USER}",
            f"-p{MYSQL_PASSWORD}",
            MYSQL_DB
        ]

        p1 = subprocess.Popen(binlog_apply_cmd, stdout=subprocess.PIPE)
        p2 = subprocess.Popen(apply_mysql_cmd, stdin=p1.stdout)
        p1.stdout.close()
        p2.communicate()

        return {"message": f"Restore thành công đến {end_time}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
def list_backups():
    try:
        if not os.path.exists(BACKUP_DIR):
            raise HTTPException(status_code=404, detail="Thư mục backup chưa tồn tại")

        files = os.listdir(BACKUP_DIR)
        backups = [
            {
                "filename": f,
                "path": os.path.join(BACKUP_DIR, f),
                "size": os.path.getsize(os.path.join(BACKUP_DIR, f)),
                "modified_time": os.path.getmtime(os.path.join(BACKUP_DIR, f)),
            }
            for f in files
            if f.endswith(".sql") or f.endswith(".txt")
        ]

        # Sắp xếp theo thời gian mới nhất
        backups.sort(key=lambda x: x["modified_time"], reverse=True)

        return {"backups": backups}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))