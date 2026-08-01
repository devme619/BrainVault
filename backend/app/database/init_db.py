from sqlalchemy import text
from app.database.database import engine
from app.database import models

def upgrade_db_schema():
    """
    Ensures PostgreSQL database has subject_topics table and subject_topic_id column on notes.
    """
    models.Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        # Ensure subject_topic_id column exists on notes table
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='notes';")).fetchall()
        cols = [r[0] for r in result]

        if 'subject_topic_id' not in cols:
            print("Adding subject_topic_id column to notes table...")
            conn.execute(text("ALTER TABLE notes ADD COLUMN IF NOT EXISTS subject_topic_id INTEGER REFERENCES subject_topics(id) ON DELETE SET NULL;"))
            conn.commit()
            print("notes table upgraded with subject_topic_id!")

if __name__ == "__main__":
    upgrade_db_schema()
