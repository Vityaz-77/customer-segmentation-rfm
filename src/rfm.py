"""
rfm.py - Modul kalkulasi metrik RFM

Berisi fungsi untuk menghitung skor Recency, Frequency, dan Monetary
dari data transaksi yang sudah dibersihkan.
"""

from datetime import datetime

import pandas as pd


def calculate_rfm(
    df: pd.DataFrame,
    reference_date: datetime | None = None,
    n_bins: int = 5,
) -> pd.DataFrame:
    """
    Menghitung metrik RFM dan skor 1–n_bins untuk setiap pelanggan.

    Parameters
    ----------
    df : pd.DataFrame
        DataFrame transaksi yang sudah bersih. Harus memiliki kolom:
        'customer_id', 'transaction_date', 'transaction_id', 'total_amount'.
    reference_date : datetime, optional
        Tanggal referensi untuk menghitung Recency.
        Default: hari setelah tanggal transaksi terbaru.
    n_bins : int, optional
        Jumlah bin/quantile untuk scoring (default 5 → skor 1–5).

    Returns
    -------
    pd.DataFrame
        DataFrame dengan kolom:
        customer_id, Recency, Frequency, Monetary,
        R_Score, F_Score, M_Score
    """
    if reference_date is None:
        reference_date = df["transaction_date"].max() + pd.Timedelta(days=1)

    rfm = df.groupby("customer_id").agg(
        Recency=("transaction_date", lambda x: (reference_date - x.max()).days),
        Frequency=("transaction_id", "count"),
        Monetary=("total_amount", "sum"),
    ).reset_index()

    labels = list(range(1, n_bins + 1))

    # Recency: semakin kecil (baru) → skor makin tinggi (dibalik)
    rfm["R_Score"] = pd.qcut(
        rfm["Recency"].rank(method="first"),
        n_bins,
        labels=list(reversed(labels)),
    ).astype(int)

    # Frequency & Monetary: semakin besar → skor makin tinggi
    rfm["F_Score"] = pd.qcut(
        rfm["Frequency"].rank(method="first"),
        n_bins,
        labels=labels,
    ).astype(int)

    rfm["M_Score"] = pd.qcut(
        rfm["Monetary"].rank(method="first"),
        n_bins,
        labels=labels,
    ).astype(int)

    return rfm
