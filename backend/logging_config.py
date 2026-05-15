import json
import logging
import os
from logging.handlers import RotatingFileHandler


class JsonFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "time": self.formatTime(record, self.datefmt),
        }

        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)

        for attr in ("path", "method", "status", "duration_ms", "remote_addr"):
            if hasattr(record, attr):
                payload[attr] = getattr(record, attr)

        return json.dumps(payload, ensure_ascii=True)


def configure_logging():
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    log_dir = os.getenv("LOG_DIR", os.path.join(os.path.dirname(__file__), "logs"))
    log_file = os.getenv("LOG_FILE", "app.log")
    max_bytes = int(os.getenv("LOG_MAX_BYTES", "5242880"))
    backup_count = int(os.getenv("LOG_BACKUP_COUNT", "5"))

    os.makedirs(log_dir, exist_ok=True)
    logger = logging.getLogger()
    logger.setLevel(log_level)

    formatter = JsonFormatter(datefmt="%Y-%m-%dT%H:%M:%S")

    file_handler = RotatingFileHandler(
        os.path.join(log_dir, log_file),
        maxBytes=max_bytes,
        backupCount=backup_count,
    )
    file_handler.setFormatter(formatter)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    logger.handlers.clear()
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    # Keep noisy framework logs lower unless explicitly elevated.
    logging.getLogger("werkzeug").setLevel(log_level)


def get_logger(name):
    return logging.getLogger(name)