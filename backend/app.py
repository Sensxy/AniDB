from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

app = Flask(__name__)
CORS(app)

DATABASE_URL = "postgresql://user:password@localhost/anime_scenes"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@app.route('/api/search')
def search_subtitles():
    query = request.args.get('q', '')
    if not query:
        return jsonify([])

    # Format query for tsquery (e.g., 'hello world' -> 'hello & world')
    formatted_query = " & ".join(query.strip().split())
    db = SessionLocal()
    try:
        sql_query = text("""
            SELECT series_name, episode_number, start_time, dialogue 
            FROM subtitles 
            WHERE dialogue_tsv @@ to_tsquery('english', :query)
            ORDER BY series_name, episode_number, start_time
            LIMIT 50;
        """)
        result = db.execute(sql_query, {"query": formatted_query})
        scenes = [dict(row) for row in result.mappings()]
        return jsonify(scenes)
    finally:
        db.close()