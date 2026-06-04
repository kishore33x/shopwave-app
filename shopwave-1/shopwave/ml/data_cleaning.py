from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


def load_dataset(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)

    expected_columns = {
        "OrderID",
        "ProductName",
        "Category",
        "Quantity",
        "Price",
        "Revenue",
        "OrderDate",
    }
    missing_cols = expected_columns - set(df.columns)
    if missing_cols:
        raise ValueError(f"Missing required columns: {missing_cols}")

    return df


def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    cleaned = df.copy()

    cleaned = cleaned.drop_duplicates(subset=["OrderID"]) 

    cleaned["ProductName"] = cleaned["ProductName"].fillna("Unknown Product")
    cleaned["Category"] = cleaned["Category"].fillna("Unknown")

    cleaned["Quantity"] = pd.to_numeric(cleaned["Quantity"], errors="coerce").fillna(0).clip(lower=0)
    cleaned["Price"] = pd.to_numeric(cleaned["Price"], errors="coerce").fillna(0).clip(lower=0)

    cleaned["OrderDate"] = pd.to_datetime(cleaned["OrderDate"], errors="coerce")
    cleaned = cleaned.dropna(subset=["OrderDate"]).copy()

    # Always recompute revenue to keep the metric consistent.
    cleaned["Revenue"] = (cleaned["Quantity"] * cleaned["Price"]).round(2)

    return cleaned


def build_analytics(df: pd.DataFrame) -> dict[str, object]:
    daily_sales = (
        df.groupby(df["OrderDate"].dt.date)["Revenue"]
        .sum()
        .reset_index()
        .rename(columns={"OrderDate": "date", "Revenue": "revenue"})
    )
    daily_sales["date"] = daily_sales["date"].astype(str)

    category_sales = (
        df.groupby("Category")["Revenue"]
        .sum()
        .reset_index()
        .rename(columns={"Category": "category", "Revenue": "revenue"})
        .sort_values("revenue", ascending=False)
    )

    top_products = (
        df.groupby("ProductName", as_index=False)
        .agg(
            total_quantity=("Quantity", "sum"),
            total_revenue=("Revenue", "sum"),
            category=("Category", "first"),
        )
        .sort_values("total_revenue", ascending=False)
        .head(20)
    )

    total_revenue = float(df["Revenue"].sum())
    total_orders = int(df["OrderID"].nunique())
    avg_order_value = float(total_revenue / max(total_orders, 1))

    summary = {
        "totalRevenue": round(total_revenue, 2),
        "totalOrders": total_orders,
        "averageOrderValue": round(avg_order_value, 2),
    }

    return {
        "sales_summary": summary,
        "daily_sales": daily_sales.to_dict(orient="records"),
        "category_sales": category_sales.to_dict(orient="records"),
        "top_products": top_products.assign(
            total_revenue=top_products["total_revenue"].round(2)
        ).to_dict(orient="records"),
    }


def write_outputs(cleaned_df: pd.DataFrame, analytics: dict[str, object], data_dir: Path) -> None:
    processed_dir = data_dir / "processed"
    processed_dir.mkdir(parents=True, exist_ok=True)

    cleaned_df.assign(OrderDate=cleaned_df["OrderDate"].dt.strftime("%Y-%m-%d")).to_csv(
        data_dir / "ecommerce_dataset_cleaned.csv", index=False
    )

    for key, payload in analytics.items():
        output_file = processed_dir / f"{key}.json"
        with output_file.open("w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    data_dir = project_root / "data"

    raw_dataset_path = data_dir / "ecommerce_dataset.csv"
    if not raw_dataset_path.exists():
        raise FileNotFoundError(
            f"Dataset not found at {raw_dataset_path}. Run scripts/generate_dataset.py first."
        )

    df = load_dataset(raw_dataset_path)
    cleaned = clean_dataset(df)
    analytics = build_analytics(cleaned)
    write_outputs(cleaned, analytics, data_dir)

    print("Data cleaning complete. Processed analytics saved to data/processed/")


if __name__ == "__main__":
    main()
