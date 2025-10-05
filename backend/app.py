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
    try:
        # Get the page number from the request, default to 1
        page = int(request.args.get('page', 1))
    except ValueError:
        page = 1

    limit = 50  # We will show 50 results per page
    offset = (page - 1) * limit

    if not query:
        return jsonify({"total_count": 0, "results": []})

    formatted_query = " & ".join(query.strip().split())
    db = SessionLocal()
    try:
        # First query: Get the total count of all matching results
        count_sql = text("""
            SELECT COUNT(*) FROM subtitles 
            WHERE dialogue_tsv @@ to_tsquery('english', :query);
        """)
        total_count = db.execute(count_sql, {"query": formatted_query}).scalar_one_or_none() or 0

        # Second query: Get the actual results for the current page using LIMIT and OFFSET
        results_sql = text("""
            SELECT series_name, episode_number, start_time, dialogue 
            FROM subtitles 
            WHERE dialogue_tsv @@ to_tsquery('english', :query)
            ORDER BY series_name, episode_number, start_time
            LIMIT :limit OFFSET :offset;
        """)
        result = db.execute(results_sql, {"query": formatted_query, "limit": limit, "offset": offset})
        scenes = [dict(row) for row in result.mappings()]

        # Return the new response format
        return jsonify({"total_count": total_count, "results": scenes})
    finally:
        db.close()