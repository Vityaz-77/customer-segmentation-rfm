"""
cleaner.py - Modul pembersihan data transaksi

Berisi fungsi untuk membersihkan data transaksi mentah:
- Menghapus duplikat
- Menangani missing values
- Memperbaiki outlier (negative amount, zero quantity)
"""

import numpy as np
import pandas as pd


def clean_transactions(df: pd.DataFrame) -> pd.DataFrame:
    """
    Membersihkan DataFrame transaksi dari:
    - Baris duplikat
    - Missing values pada kolom 'category' dan 'payment_method'
    - Quantity <= 0 (diganti median)
    - Total amount negatif (diganti median)

    Parameters
    ----------
    df : pd.DataFrame
        DataFrame transaksi mentah.

    Returns
    -------
    pd.DataFrame
        DataFrame yang sudah bersih, siap untuk analisis RFM.
    """
    df_clean = df.copy()

    # Hapus duplikat
    df_clean = df_clean.drop_duplicates().reset_index(drop=True)

    # Isi missing value kategorik
    df_clean["category"] = df_clean["category"].fillna("Unknown")
    df_clean["payment_method"] = df_clean["payment_method"].fillna("Unknown")

    # Perbaiki quantity <= 0 → ganti dengan median
    df_clean.loc[df_clean["quantity"] <= 0, "quantity"] = np.nan
    df_clean["quantity"] = df_clean["quantity"].fillna(df_clean["quantity"].median())

    # Perbaiki total_amount negatif → ganti dengan median
    df_clean.loc[df_clean["total_amount"] < 0, "total_amount"] = np.nan
    df_clean["total_amount"] = df_clean["total_amount"].fillna(
        df_clean["total_amount"].median()
    )

    # Pastikan kolom tanggal bertipe datetime
    df_clean["transaction_date"] = pd.to_datetime(df_clean["transaction_date"])

    return df_clean


def cleaning_report(df_before: pd.DataFrame, df_after: pd.DataFrame) -> None:
    """
    Mencetak laporan ringkas sebelum dan sesudah pembersihan data.

    Parameters
    ----------
    df_before : pd.DataFrame
        DataFrame sebelum dibersihkan.
    df_after : pd.DataFrame
        DataFrame setelah dibersihkan.
    """
    print("=" * 50)
    print("DATA CLEANING REPORT")
    print("=" * 50)

    print("\nBefore cleaning:")
    print(f"  Shape             : {df_before.shape}")
    print(f"  Duplicate rows    : {df_before.duplicated().sum()}")
    print(f"  Missing values    :\n{df_before.isna().sum().to_string()}")
    print(f"  Negative amount   : {(df_before['total_amount'] < 0).sum()}")
    print(f"  Quantity <= 0     : {(df_before['quantity'] <= 0).sum()}")

    print("\nAfter cleaning:")
    print(f"  Shape             : {df_after.shape}")
    print(f"  Duplicate rows    : {df_after.duplicated().sum()}")
    print(f"  Missing values    :\n{df_after.isna().sum().to_string()}")
    print(f"  Negative amount   : {(df_after['total_amount'] < 0).sum()}")
    print(f"  Quantity <= 0     : {(df_after['quantity'] <= 0).sum()}")
    print("=" * 50)
