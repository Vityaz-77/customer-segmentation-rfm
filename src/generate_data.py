from pathlib import Path
from datetime import datetime, timedelta

import numpy as np
import pandas as pd


def generate_transactions(output_path: str | None = None) -> pd.DataFrame:
    np.random.seed(42)

    project_root = Path(__file__).resolve().parent.parent
    if output_path is None:
        output_path = project_root / "data" / "raw" / "transactions_dummy.csv"
    else:
        output_path = Path(output_path)

    n_total_rows = 1500
    n_duplicate_rows = 5
    n_base_rows = n_total_rows - n_duplicate_rows

    customer_ids = [f"CUST-{str(i).zfill(4)}" for i in range(1, 301)]
    chosen_customers = np.array(customer_ids + list(np.random.choice(customer_ids, size=n_base_rows - len(customer_ids), replace=True)))
    np.random.shuffle(chosen_customers)

    start_date = datetime(2025, 1, 1)
    end_date = datetime(2025, 12, 31)
    date_range = (end_date - start_date).days
    random_dates = [start_date + timedelta(days=int(np.random.randint(0, date_range + 1))) for _ in range(n_base_rows)]

    categories = ["Electronics", "Fashion", "Home & Living", "Groceries", "Beauty"]
    chosen_categories = np.random.choice(categories, size=n_base_rows, p=[0.15, 0.35, 0.20, 0.20, 0.10])

    quantities = np.random.choice([1, 2, 3, 4, 5, 8, 10], size=n_base_rows, p=[0.5, 0.25, 0.1, 0.07, 0.04, 0.02, 0.02])
    base_prices = {
        "Electronics": 1200000,
        "Fashion": 250000,
        "Home & Living": 350000,
        "Groceries": 75000,
        "Beauty": 150000,
    }
    unit_prices = [int(base_prices[cat] * np.random.uniform(0.7, 1.4)) for cat in chosen_categories]
    total_amounts = [q * p for q, p in zip(quantities, unit_prices)]

    df = pd.DataFrame(
        {
            "transaction_id": [f"TRX-{str(i).zfill(5)}" for i in range(1, n_base_rows + 1)],
            "customer_id": chosen_customers,
            "transaction_date": random_dates,
            "category": chosen_categories,
            "quantity": quantities,
            "unit_price": unit_prices,
            "total_amount": total_amounts,
            "payment_method": np.random.choice(["Credit Card", "E-Wallet", "Bank Transfer", "COD"], size=n_base_rows),
        }
    )

    payment_missing_idx = np.random.choice(df.index, size=30, replace=False)
    category_missing_idx = np.random.choice(df.index.difference(payment_missing_idx), size=15, replace=False)
    df.loc[payment_missing_idx, "payment_method"] = np.nan
    df.loc[category_missing_idx, "category"] = np.nan

    duplicate_rows = df.sample(n=n_duplicate_rows, random_state=42)
    df = pd.concat([df, duplicate_rows], ignore_index=True)

    df.loc[10, "total_amount"] = -150000
    df.loc[25, "quantity"] = 0

    df.to_csv(output_path, index=False)
    return df


if __name__ == "__main__":
    data = generate_transactions()
    print(f"File 'transactions_dummy.csv' berhasil dibuat ({len(data)} baris).")