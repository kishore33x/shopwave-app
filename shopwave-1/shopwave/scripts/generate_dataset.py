from __future__ import annotations

import random
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd


def build_product_catalog() -> dict[str, list[tuple[str, tuple[float, float]]]]:
    return {
        "Electronics": [
            ("Wireless Earbuds", (35, 120)),
            ("Smartphone Case", (10, 35)),
            ("Bluetooth Speaker", (25, 90)),
            ("Laptop Sleeve", (18, 60)),
            ("Smartwatch", (90, 280)),
        ],
        "Clothing": [
            ("Cotton T-Shirt", (8, 25)),
            ("Denim Jeans", (20, 60)),
            ("Running Jacket", (30, 110)),
            ("Sneakers", (35, 140)),
            ("Hoodie", (22, 85)),
        ],
        "Home & Kitchen": [
            ("Non-stick Pan", (15, 65)),
            ("Electric Kettle", (18, 55)),
            ("Storage Container Set", (12, 45)),
            ("Air Fryer", (50, 200)),
            ("Vacuum Cleaner", (70, 260)),
        ],
        "Beauty": [
            ("Face Serum", (12, 70)),
            ("Moisturizer", (10, 45)),
            ("Hair Dryer", (20, 95)),
            ("Lipstick Set", (8, 35)),
            ("Sunscreen", (9, 28)),
        ],
        "Sports": [
            ("Yoga Mat", (12, 50)),
            ("Dumbbell Set", (25, 140)),
            ("Cycling Helmet", (18, 85)),
            ("Football", (10, 40)),
            ("Fitness Tracker", (30, 160)),
        ],
    }


def seasonal_multiplier(order_date: datetime, category: str) -> float:
    month = order_date.month
    base = 1.0

    if month in (11, 12):
        base += 0.22
    elif month in (6, 7):
        base += 0.08

    category_boosts = {
        "Electronics": {11: 0.2, 12: 0.2},
        "Clothing": {12: 0.12, 1: 0.07},
        "Home & Kitchen": {8: 0.08, 11: 0.06},
        "Beauty": {2: 0.06, 5: 0.08},
        "Sports": {1: 0.1, 4: 0.07, 5: 0.07},
    }

    return base + category_boosts.get(category, {}).get(month, 0)


def generate_dataset(rows: int = 5000, seed: int = 42) -> pd.DataFrame:
    random.seed(seed)
    np.random.seed(seed)

    category_weights = {
        "Electronics": 0.24,
        "Clothing": 0.23,
        "Home & Kitchen": 0.2,
        "Beauty": 0.16,
        "Sports": 0.17,
    }

    categories = list(category_weights.keys())
    weights = list(category_weights.values())
    catalog = build_product_catalog()

    start_date = datetime(2024, 1, 1)
    end_date = datetime(2025, 12, 31)
    total_days = (end_date - start_date).days

    records: list[dict[str, object]] = []

    for i in range(rows):
        category = random.choices(categories, weights=weights, k=1)[0]
        product, price_range = random.choice(catalog[category])

        order_date = start_date + timedelta(days=random.randint(0, total_days))

        weekend_factor = 1.12 if order_date.weekday() >= 5 else 1.0
        season_factor = seasonal_multiplier(order_date, category)

        quantity = max(1, int(np.random.poisson(lam=2.6) + 1))

        base_price = random.uniform(*price_range)
        noise = np.random.normal(1.0, 0.07)
        price = max(4.0, round(base_price * season_factor * noise, 2))

        revenue = round(quantity * price * weekend_factor, 2)

        records.append(
            {
                "OrderID": f"ORD-{100000 + i}",
                "ProductName": product,
                "Category": category,
                "Quantity": quantity,
                "Price": round(price, 2),
                "Revenue": revenue,
                "OrderDate": order_date.strftime("%Y-%m-%d"),
            }
        )

    return pd.DataFrame(records)


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    output_path = project_root / "data" / "ecommerce_dataset.csv"

    df = generate_dataset(rows=5000)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)

    print(f"Dataset generated: {output_path}")
    print(f"Rows: {len(df)}")
    print(f"Date range: {df['OrderDate'].min()} to {df['OrderDate'].max()}")


if __name__ == "__main__":
    main()
