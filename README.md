# AniDB 

AniDB is a full-stack search engine for finding anime scenes by dialogue. This project features a Python data pipeline that processes raw subtitle files and leverages PostgreSQL's full-text search for high-performance queries.

## Tech Stack
* **Backend:** Python, Flask, SQLAlchemy
* **Frontend:** React
* **Database:** PostgreSQL with Full-Text Search (`tsvector`, GIN index)
* **Containerization:** Docker, Docker Compose

## Features
* **Dialogue Search:** Perform powerful, near-instantaneous searches for dialogue across multiple anime series.
* **ETL Pipeline:** A Python script extracts, transforms, and loads data from raw `.srt` files into the database.
* **Optimized Performance:** Uses advanced PostgreSQL indexing to ensure queries are fast, even on a large dataset.