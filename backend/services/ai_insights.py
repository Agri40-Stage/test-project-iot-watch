import json
import os
from datetime import datetime, timedelta, timezone
from statistics import mean

try:
    from openai import OpenAI
except ModuleNotFoundError:  # pragma: no cover
    OpenAI = None


_ai_cache = {
    "content": None,
    "expires_at": None,
}


def _rule_based_summary(readings):
    temperatures = [row["temperature"] for row in readings]
    humidities = [row["humidity"] for row in readings if row["humidity"] is not None]

    last_temp = temperatures[-1]
    temp_delta = last_temp - temperatures[0] if len(temperatures) > 1 else 0
    direction = "rising" if temp_delta > 0.3 else "falling" if temp_delta < -0.3 else "stable"

    humidity_phrase = ""
    if humidities:
        last_humidity = humidities[-1]
        humidity_phrase = f" Relative humidity is at {last_humidity:.1f}%."

    return (
        f"Temperature is {direction} with the latest reading at {last_temp:.1f}°C "
        f"(min {min(temperatures):.1f}°C / max {max(temperatures):.1f}°C)."
        f"{humidity_phrase}"
    )


def _call_openai(prompt, api_key):
    if not api_key or not OpenAI:
        return None

    client = OpenAI(api_key=api_key)
    response = client.responses.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        input=prompt,
        temperature=0.2,
    )
    if response and response.output:
        return response.output[0].content[0].text
    return None


def get_ai_insights(readings, timezone_label="UTC"):
    """Return an AI generated insight string for the provided readings."""
    global _ai_cache

    now = datetime.now(timezone.utc)
    if _ai_cache["content"] and _ai_cache["expires_at"] and now < _ai_cache["expires_at"]:
        return _ai_cache["content"]

    if not readings:
        insight = {
            "insight": "No telemetry available yet. The collector will populate data after the first successful poll.",
            "generatedAt": now.isoformat(),
            "source": "rule-based",
            "highlights": {},
        }
        _ai_cache = {"content": insight, "expires_at": now + timedelta(minutes=5)}
        return insight

    trimmed = list(reversed(readings))[-12:]
    prompt_payload = [
        {
            "time": row["timestamp"],
            "temperature": round(row["temperature"], 2),
            "humidity": round(row["humidity"], 2) if row["humidity"] is not None else None,
        }
        for row in trimmed
    ]

    rule_summary = _rule_based_summary(trimmed)
    openai_api_key = os.getenv("OPENAI_API_KEY")

    ai_summary = _call_openai(
        f"You are an IoT assistant. Summarize these readings (timezone {timezone_label}):\n"
        f"{json.dumps(prompt_payload, indent=2)}\n"
        f"Provide a short insight with recommended action.",
        openai_api_key,
    )

    insight = {
        "insight": ai_summary or rule_summary,
        "generatedAt": now.isoformat(),
        "source": "openai" if ai_summary else "rule-based",
        "highlights": {
            "min": min(row["temperature"] for row in trimmed),
            "max": max(row["temperature"] for row in trimmed),
            "avg": mean(row["temperature"] for row in trimmed),
        },
    }

    _ai_cache = {"content": insight, "expires_at": now + timedelta(minutes=5)}
    return insight

