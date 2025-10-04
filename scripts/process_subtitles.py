import os
import re
import pysrt
from sqlalchemy import create_engine, Column, Integer, String, Text, text
from sqlalchemy.orm import declarative_base, sessionmaker

# --- Database Setup ---
DATABASE_URL = "postgresql://user:password@localhost/anime_scenes"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Define the Subtitle table model
class Subtitle(Base):
    __tablename__ = "subtitles"
    id = Column(Integer, primary_key=True, index=True)
    series_name = Column(String, index=True)
    episode_number = Column(Integer)
    start_time = Column(String)
    end_time = Column(String)
    dialogue = Column(Text, nullable=False)

# Create the table in the database
Base.metadata.create_all(bind=engine)

# --- ETL Logic ---
def process_and_load_subtitles():
    print("Starting subtitle processing...")
    db = SessionLocal()
    subtitle_dir = os.path.join(os.path.dirname(__file__), '..', 'data')

    # This regex is now updated to match your filenames
    # e.g., "Initial D - 1st Stage - 07 - Pride of a Racer.srt"
    filename_pattern = re.compile(r'(.*?) - \d+.. Stage - (\d+) - .*', re.IGNORECASE)

    for root, dirs, files in os.walk(subtitle_dir):
        for filename in files:
            if filename.endswith(".srt"):
                print(f"Processing file: {filename}...")

                match = filename_pattern.match(filename)
                if not match:
                    print(f"  - Could not parse filename: {filename}. Skipping.")
                    continue

                series_name = match.group(1).strip()
                episode_number = int(match.group(2))

                filepath = os.path.join(root, filename)
                subs = pysrt.open(filepath, encoding='iso-8859-1') # Added encoding for robustness

                for sub in subs:
                    new_sub_entry = Subtitle(
                        series_name=series_name,
                        episode_number=episode_number,
                        start_time=str(sub.start),
                        end_time=str(sub.end),
                        dialogue=sub.text
                    )
                    db.add(new_sub_entry)

    try:
        print("Committing all entries to the database...")
        db.commit()
        print("Successfully loaded all subtitles!")
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Clearing existing data from the subtitles table...")
    db = SessionLocal()
    try:
        db.execute(text("DELETE FROM subtitles;"))
        db.commit()
    finally:
        db.close()

    process_and_load_subtitles()