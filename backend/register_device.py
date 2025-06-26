import secrets
from models import Device
from database import SessionLocal, engine, Base

Base.metadata.create_all(bind=engine)
db = SessionLocal()

def register_device(name):
    api_key = secrets.token_hex(16)
    device = Device(name=name, api_key=api_key)
    db.add(device)
    db.commit()
    print(f"Device '{name}' registered with API key: {api_key}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python register_device.py")
    else:
        register_device(sys.argv[1]) 