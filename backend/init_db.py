import sys
from database import engine
from models import Base

def init_database():
    print("Connecting to database and creating tables...")
    try:
        # ONLY create tables that do not exist yet. This is completely
        # non-destructive: existing rows are never touched, so Render
        # restarts/redeploys can never overwrite saved user data.
        Base.metadata.create_all(bind=engine)
        print("All tables created successfully (users, rooms, room_members, expenses, expense_splits, settlements).")
        print("No default/demo data is inserted. Existing database content is preserved.")
    except Exception as e:
        print(f"Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_database()