from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd


def build_future_features(start_date: pd.Timestamp, base_date: pd.Timestamp, days: int) -> pd.DataFrame:
    future_dates = pd.date_range(start=start_date, periods=days, freq="D")

    frame = pd.DataFrame({"date": future_dates})
    frame["day_index"] = (frame["date"] - base_date).dt.days
    frame["day_of_week"] = frame["date"].dt.dayofweek
    frame["month"] = frame["date"].dt.month
    frame["week_of_year"] = frame["date"].dt.isocalendar().week.astype(int)

    return frame


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    model_path = project_root / "ml" / "models" / "sales_model.joblib"

    if not model_path.exists():
        raise FileNotFoundError(
            f"Model not found at {model_path}. Run ml/train_model.py first."
        )

    bundle = joblib.load(model_path)
    model = bundle["model"]
    base_date = pd.Timestamp(bundle["base_date"])
    last_date = pd.Timestamp(bundle["last_date"])

    future = build_future_features(start_date=last_date + pd.Timedelta(days=1), base_date=base_date, days=30)

    predictions = model.predict(future[["day_index", "day_of_week", "month", "week_of_year"]])

    result = [
        {
            "date": row_date.strftime("%Y-%m-%d"),
            "predictedRevenue": round(float(pred), 2),
        }
        for row_date, pred in zip(future["date"], predictions)
    ]

    output_file = project_root / "data" / "processed" / "predictions.json"
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with output_file.open("w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"Predictions written to {output_file}")


if __name__ == "__main__":
    main()
