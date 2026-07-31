from sqlalchemy import text
from app.database.database import engine
from app.database import models

def upgrade_db_schema():
    """
    Ensures PostgreSQL database has all required columns on 'notes' table
    (user_id, file_url, file_type, file_name, extracted_text, text_content, created_at).
    """
    with engine.connect() as conn:
        # Check current columns on 'notes' table
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='notes';")).fetchall()
        cols = [r[0] for r in result]

        if not cols:
            # Table doesn't exist yet, create it
            models.Base.metadata.create_all(bind=engine)
            print("PostgreSQL tables created cleanly!")
            return

        # If table exists but user_id is missing, add all new columns
        if 'user_id' not in cols:
            print("Upgrading PostgreSQL 'notes' table schema to add user_id and file columns...")
            conn.execute(text("ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;"))
            conn.execute(text("ALTER TABLE notes ADD COLUMN IF NOT EXISTS file_url VARCHAR;"))
            conn.execute(text("ALTER TABLE notes ADD COLUMN IF NOT EXISTS file_type VARCHAR;"))
            conn.execute(text("ALTER TABLE notes ADD COLUMN IF NOT EXISTS file_name VARCHAR;"))
            conn.execute(text("ALTER TABLE notes ADD COLUMN IF NOT EXISTS extracted_text VARCHAR;"))
            conn.execute(text("ALTER TABLE notes ADD COLUMN IF NOT EXISTS text_content VARCHAR;"))
            conn.execute(text("ALTER TABLE notes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"))
            conn.commit()
            print("PostgreSQL 'notes' table upgraded successfully!")

if __name__ == "__main__":
    upgrade_db_schema()
