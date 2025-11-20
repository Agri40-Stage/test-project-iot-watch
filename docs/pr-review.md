## PR Review Comment – backend/services/weather_fetcher.py

**Location:** `backend/services/weather_fetcher.py`, `get_current_temperature` (retry block around the SQLite insert)

The retry strategy for a locked SQLite database currently performs a recursive call (`return get_current_temperature()`). If the lock persists for a while, the recursion depth can grow quickly and eventually raise a `RecursionError`, effectively killing the background collector. Could we swap this for an explicit retry loop with a bounded number of attempts (e.g. 5) before bubbling up the failure? That would keep the stack flat and still preserve the retry behaviour. This is especially important once the polling interval is reduced because the window for lock contention widens.

