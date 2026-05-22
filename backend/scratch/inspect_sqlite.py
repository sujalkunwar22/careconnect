import sqlite3

def inspect_db(db_name):
    print(f"=== Inspecting {db_name} ===")
    conn = sqlite3.connect(db_name)
    cur = conn.cursor()
    try:
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [t[0] for t in cur.fetchall()]
        for table in tables:
            cur.execute(f"SELECT count(*) FROM \"{table}\"")
            count = cur.fetchone()[0]
            if count > 0:
                print(f"  {table}: {count}")
    except Exception as e:
        print(f"  Error: {e}")
    finally:
        conn.close()

inspect_db("db.sqlite3")
inspect_db("db_backup_fallback.sqlite3")
