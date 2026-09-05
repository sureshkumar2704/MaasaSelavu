from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Read DATABASE_URL from environment (e.g. Aiven PostgreSQL/MySQL) or fallback to local SQLite
raw_db_url = os.getenv("DATABASE_URL")

if raw_db_url:
    # Convert postgres:// to postgresql:// if needed for SQLAlchemy 2.0
    if raw_db_url.startswith("postgres://"):
        raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URL = raw_db_url
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
else:
    DB_PATH = os.path.join(os.path.dirname(__file__), "maasaselavu.db")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
