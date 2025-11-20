## Issue: Implement Bounded Retry Logic for SQLite Writer

- **Type:** bug
- **Severity:** medium
- **Location:** `backend/services/weather_fetcher.py` – `get_current_temperature`

### Description
The current implementation retries locked SQLite writes by calling `get_current_temperature()` recursively. When the DB remains locked (e.g., long-running SELECT + background insert), the recursion chain can grow indefinitely until Python raises `RecursionError`, which terminates the collector thread. At that point no new telemetry is persisted and every secured endpoint starts returning stale data.

### Steps to Reproduce
1. Start the backend normally.
2. Open a Python shell and hold a transaction on `temperature_data` (`BEGIN IMMEDIATE; SELECT ...` without committing).
3. Observe the background thread logging repeated retries and eventually crashing with `RecursionError`.

### Expected
The collector should retry a finite number of times (with exponential backoff) and log a clear error without blowing the stack.

### Proposed Fix
Replace the recursive retry with a small loop (3-5 attempts) and exponential backoff, e.g.:
```python
for attempt in range(5):
    try:
        # insert
        break
    except sqlite3.OperationalError as exc:
        if "locked" not in str(exc).lower():
            raise
        time.sleep(0.1 * (attempt + 1))
else:
    logger.error("Aborting insert after multiple locked retries")
```

This keeps the stack flat and surfaces failures if the DB stays locked longer than expected.

