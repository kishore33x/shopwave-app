from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split


def build_feature_table(df: pd.DataFrame) -> pd.DataFrame:
    daily = (
        df.groupby(df["OrderDate"].dt.date)["Revenue"]
        .sum()
        .reset_index()
        .rename(columns={"OrderDate": "date", "Revenue": "revenue"})
    )

    daily["date"] = pd.to_datetime(daily["date"])
    daily = daily.sort_values("date").reset_index(drop=True)

    daily["day_index"] = (daily["date"] - daily["date"].min()).dt.days
    daily["day_of_week"] = daily["date"].dt.dayofweek
    daily["month"] = daily["date"].dt.month
    daily["week_of_year"] = daily["date"].dt.isocalendar().week.astype(int)

    return daily


def train_model(daily: pd.DataFrame) -> tuple[RandomForestRegressor, dict[str, float]]:
    X = daily[["day_index", "day_of_week", "month", "week_of_year"]]
    y = daily["revenue"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, shuffle=False
    )

    model = RandomForestRegressor(n_estimators=300, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    metrics = {
        "mae": float(mean_absolute_error(y_test, preds)),
        "rmse": float(mean_squared_error(y_test, preds) ** 0.5),
        "r2": float(r2_score(y_test, preds)),
    }

    return model, metrics


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    dataset_path = project_root / "data" / "ecommerce_dataset_cleaned.csv"

    if not dataset_path.exists():
        raise FileNotFoundError(
            f"Cleaned dataset not found at {dataset_path}. Run ml/data_cleaning.py first."
        )

    df = pd.read_csv(dataset_path)
    df["OrderDate"] = pd.to_datetime(df["OrderDate"], errors="coerce")
    df = df.dropna(subset=["OrderDate"]).copy()

    daily = build_feature_table(df)
    model, metrics = train_model(daily)

    model_bundle = {
        "model": model,
        "base_date": daily["date"].min(),
        "last_date": daily["date"].max(),
    }

    model_dir = project_root / "ml" / "models"
    model_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(model_bundle, model_dir / "sales_model.joblib")

    metrics_path = project_root / "data" / "processed" / "model_metrics.json"
    with metrics_path.open("w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print("Model trained and saved to ml/models/sales_model.joblib")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
