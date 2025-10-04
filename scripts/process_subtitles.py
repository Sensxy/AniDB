import os
import re
import pysubs2
from sqlalchemy import create_engine, Column, Integer, String, Text, text
from sqlalchemy.orm import declarative_base, sessionmaker

# --- Database Setup ---
DATABASE_URL = "postgresql://user:password@localhost/anime_scenes"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Subtitle(Base):
    __tablename__ = "subtitles"
    id = Column(Integer, primary_key=True, index=True)
    series_name = Column(String, index=True)
    episode_number = Column(Integer)
    start_time = Column(String)
    end_time = Column(String)
    dialogue = Column(Text, nullable=False)

Base.metadata.create_all(bind=engine)

def format_time(microseconds):
    seconds = microseconds // 1000000
    milliseconds = (microseconds % 1000000) // 1000
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}"

# --- ETL Logic ---
def process_and_load_subtitles():
    print("Starting subtitle processing...")
    db = SessionLocal()
    subtitle_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    
    # --- THIS IS THE NEW NAME MAP ---
    # Add any new series here. The key should be the folder name (lowercase).
    SERIES_NAME_MAP = {
        'initial d': 'Initial D',
        'nge': 'Neon Genesis Evangelion'
    }

    pattern_initial_d = re.compile(r'.*? - \d+.. Stage - (\d+) - .*', re.IGNORECASE)
    pattern_generic = re.compile(r'^(\d+)', re.IGNORECASE)

    for root, dirs, files in os.walk(subtitle_dir):
        if root == subtitle_dir:
            continue
            
        folder_name = os.path.basename(root).lower()
        # Look up the full name in our map, or default to a title-cased folder name
        series_name = SERIES_NAME_MAP.get(folder_name, folder_name.replace('_', ' ').title())

        for filename in files:
            if filename.lower().endswith(('.ass', '.srt')):
                print(f"Processing file: {filename}...")
                episode_number = None
                
                # Try to parse the episode number from the filename
                match_id = pattern_initial_d.match(filename)
                if match_id:
                    episode_number = int(match_id.group(1))
                else:
                    match_generic = pattern_generic.match(filename)
                    if match_generic:
                        episode_number = int(match_generic.group(1))

                if episode_number is None:
                    print(f"  - Could not parse episode number from: {filename}. Skipping.")
                    continue
                
                filepath = os.path.join(root, filename)
                try:
                    subs = pysubs2.load(filepath, encoding='utf-8')
                    for line in subs:
                        dialogue_text = line.text.strip()
                        if dialogue_text:
                            db.add(Subtitle(
                                series_name=series_name, # Use the pretty name
                                episode_number=episode_number,
                                start_time=str(pysubs2.make_time(ms=line.start)),
                                end_time=str(pysubs2.make_time(ms=line.end)),
                                dialogue=dialogue_text
                            ))
                except Exception as e:
                    print(f"  - ERROR processing file {filename}: {e}. Skipping.")

    try:
        print("Committing all entries to the database...")
        db.commit()
        print("Successfully loaded all subtitles!")
    except Exception as e:
        print(f"An error occurred during commit: {e}")
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