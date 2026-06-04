from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd


def run_eda(df: pd.DataFrame) -> dict[str, object]:
    total_revenue = float(df["Revenue"].sum())
    total_orders = int(df["OrderID"].nunique())
    avg_order_value = float(total_revenue / max(total_orders, 1))

    top_products = (
        df.groupby("ProductName", as_index=False)
        .agg(total_quantity=("Quantity", "sum"), total_revenue=("Revenue", "sum"))
        .sort_values("total_revenue", ascending=False)
        .head(10)
    )

    revenue_by_category = (
        df.groupby("Category", as_index=False)["Revenue"]
        .sum()
        .sort_values("Revenue", ascending=False)
    )

    monthly_sales = (
        df.assign(Month=df["OrderDate"].dt.to_period("M").astype(str))
        .groupby("Month", as_index=False)["Revenue"]
        .sum()
    )

    return {
        "totalRevenue": round(total_revenue, 2),
        "totalOrders": total_orders,
        "averageOrderValue": round(avg_order_value, 2),
        "topSellingProducts": top_products.assign(
            total_revenue=top_products["total_revenue"].round(2)
        ).to_dict(orient="records"),
        "revenueByCategory": revenue_by_category.rename(
            columns={"Category": "category", "Revenue": "revenue"}
        ).to_dict(orient="records"),
        "monthlySalesTrends": monthly_sales.rename(
            columns={"Month": "month", "Revenue": "revenue"}
        ).to_dict(orient="records"),
    }


def generate_charts(df: pd.DataFrame, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)

    revenue_by_category = (
        df.groupby("Category")["Revenue"].sum().sort_values(ascending=False)
    )
    plt.figure(figsize=(8, 5))
    revenue_by_category.plot(kind="bar", color="#0ea5e9")
    plt.title("Revenue by Category")
    plt.xlabel("Category")
    plt.ylabel("Revenue")
    plt.tight_layout()
    plt.savefig(output_dir / "revenue_by_category.png", dpi=160)
    plt.close()

    monthly_sales = (
        df.groupby(df["OrderDate"].dt.to_period("M"))["Revenue"]
        .sum()
        .sort_index()
    )
    plt.figure(figsize=(10, 5))
    plt.plot(monthly_sales.index.astype(str), monthly_sales.values, marker="o", color="#16a34a")
    plt.title("Monthly Sales Trends")
    plt.xlabel("Month")
    plt.ylabel("Revenue")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(output_dir / "monthly_sales_trends.png", dpi=160)
    plt.close()


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

    report = run_eda(df)

    output_json = project_root / "data" / "processed" / "eda_report.json"
    output_json.parent.mkdir(parents=True, exist_ok=True)
    with output_json.open("w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    generate_charts(df, project_root / "data" / "processed" / "eda")

    print("EDA completed. Report and charts written to data/processed/eda/")


if __name__ == "__main__":
    main()
