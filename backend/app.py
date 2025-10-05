from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# --- App and Database Configuration ---
app = Flask(__name__)
CORS(app) # Allow requests from our React frontend

DATABASE_URL = "postgresql://user:password@localhost/anime_scenes"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# --- API Endpoint to get all unique series names ---
@app.route('/api/series')
def get_series():
    db = SessionLocal()
    try:
        # Query for the distinct series names, ordered alphabetically
        sql_query = text("""
            SELECT DISTINCT series_name 
            FROM subtitles 
            ORDER BY series_name;
        """)
        result = db.execute(sql_query)
        # Flatten the list of results into a simple list of strings
        series_names = [row[0] for row in result]
        return jsonify(series_names)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


# --- Main API Endpoint for Searching ---
@app.route('/api/search')
def search_subtitles():
    # Get all query parameters from the URL
    query = request.args.get('q', '')
    series = request.args.get('series', '')
    try:
        episode = int(request.args.get('episode', 0))
    except ValueError:
        episode = 0
    try:
        page = int(request.args.get('page', 1))
    except ValueError:
        page = 1

    limit = 50  # Results per page
    offset = (page - 1) * limit
    
    # Start building the WHERE clauses and parameters for the SQL query dynamically
    where_clauses = []
    params = {}

    if query:
        where_clauses.append("dialogue_tsv @@ to_tsquery('english', :query)")
        params['query'] = " & ".join(query.strip().split())
    
    if series:
        where_clauses.append("series_name = :series")
        params['series'] = series

    if episode > 0:
        where_clauses.append("episode_number = :episode")
        params['episode'] = episode

    # If there are no search criteria, return empty results
    if not where_clauses:
        return jsonify({"total_count": 0, "results": []})

    full_where_clause = " AND ".join(where_clauses)
    db = SessionLocal()
    try:
        # Query 1: Get the total count of all matching results with the filters
        count_sql = text(f"SELECT COUNT(*) FROM subtitles WHERE {full_where_clause};")
        total_count = db.execute(count_sql, params).scalar_one_or_none() or 0

        # Query 2: Get the actual results for the current page with filters and pagination
        results_sql = text(f"""
            SELECT series_name, episode_number, start_time, dialogue 
            FROM subtitles 
            WHERE {full_where_clause}
            ORDER BY series_name, episode_number, start_time
            LIMIT :limit OFFSET :offset;
        """)
        params.update({"limit": limit, "offset": offset}) # Add limit and offset for this query
        result = db.execute(results_sql, params)
        scenes = [dict(row) for row in result.mappings()]
        
        # Return the data in the final paginated format
        return jsonify({"total_count": total_count, "results": scenes})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

if __name__ == '__main__':
    app.run(debug=True)
    
  