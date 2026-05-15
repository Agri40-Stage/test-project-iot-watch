from typing import Tuple, Optional

def _to_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None

def _to_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None

def validate_latitude(value, default: Optional[float] = None) -> Tuple[Optional[float], Optional[str]]:
    if value is None:
        if default is None:
            return None, "Missing latitude"
        return float(default), None

    v = _to_float(value)
    if v is None:
        return None, "Invalid latitude format"
    if v < -90 or v > 90:
        return None, "Latitude must be between -90 and 90"
    return v, None


def validate_longitude(value, default: Optional[float] = None) -> Tuple[Optional[float], Optional[str]]:
    if value is None:
        if default is None:
            return None, "Missing longitude"
        return float(default), None

    v = _to_float(value)
    if v is None:
        return None, "Invalid longitude format"
    if v < -180 or v > 180:
        return None, "Longitude must be between -180 and 180"
    return v, None


def validate_day(value, default: Optional[int] = 1, min_val: int = 1, max_val: int = 5) -> Tuple[Optional[int], Optional[str]]:
    if value is None:
        return int(default), None
    v = _to_int(value)
    if v is None:
        return None, "Invalid day format"
    if v < min_val or v > max_val:
        return None, f"Day must be between {min_val} and {max_val}"
    return v, None
