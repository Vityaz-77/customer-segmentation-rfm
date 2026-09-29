"""
segmentation.py - Modul segmentasi pelanggan berbasis RFM

Berisi fungsi untuk memetakan skor RFM menjadi label segmen
yang mudah dibaca untuk keperluan analisis bisnis.
"""

import pandas as pd


def assign_segment(row: pd.Series) -> str:
    """
    Menentukan label segmen berdasarkan skor R, F, M satu baris.

    Aturan segmentasi (prioritas dari atas ke bawah):
    - Champions       : R >= 4 AND F >= 4 AND M >= 4
    - Loyal Customers : R >= 4 AND F >= 3
    - Potential Loyalists : R >= 4 AND F <= 2
    - Need Attention  : R == 3 AND F >= 3
    - At Risk         : R <= 2 AND F >= 4
    - Hibernating     : R <= 2 AND F <= 2
    - Others          : Sisa pelanggan yang tidak masuk kategori di atas

    Parameters
    ----------
    row : pd.Series
        Satu baris DataFrame RFM, harus memiliki kolom
        'R_Score', 'F_Score', 'M_Score'.

    Returns
    -------
    str
        Label segmen pelanggan.
    """
    r, f, m = row["R_Score"], row["F_Score"], row["M_Score"]

    if r >= 4 and f >= 4 and m >= 4:
        return "Champions"
    if r >= 4 and f >= 3:
        return "Loyal Customers"
    if r >= 4 and f <= 2:
        return "Potential Loyalists"
    if r == 3 and f >= 3:
        return "Need Attention"
    if r <= 2 and f >= 4:
        return "At Risk"
    if r <= 2 and f <= 2:
        return "Hibernating"
    return "Others"


def segment_customers(rfm: pd.DataFrame) -> pd.DataFrame:
    """
    Menambahkan kolom 'Segment' ke DataFrame RFM dan mengurutkan hasilnya.

    Parameters
    ----------
    rfm : pd.DataFrame
        DataFrame hasil calculate_rfm() dengan kolom
        R_Score, F_Score, M_Score.

    Returns
    -------
    pd.DataFrame
        DataFrame RFM dengan kolom tambahan 'Segment',
        diurutkan berdasarkan Segment (ascending) dan Monetary (descending).
    """
    rfm = rfm.copy()
    rfm["Segment"] = rfm.apply(assign_segment, axis=1)
    rfm = rfm.sort_values(
        ["Segment", "Monetary"], ascending=[True, False]
    ).reset_index(drop=True)
    return rfm


def segment_summary(rfm: pd.DataFrame) -> pd.DataFrame:
    """
    Menghasilkan tabel ringkasan per segmen berisi jumlah pelanggan,
    persentase, rata-rata Recency, Frequency, dan Monetary.

    Parameters
    ----------
    rfm : pd.DataFrame
        DataFrame RFM yang sudah memiliki kolom 'Segment'.

    Returns
    -------
    pd.DataFrame
        Tabel ringkasan per segmen.
    """
    summary = (
        rfm.groupby("Segment")
        .agg(
            Jumlah_Pelanggan=("customer_id", "count"),
            Avg_Recency=("Recency", "mean"),
            Avg_Frequency=("Frequency", "mean"),
            Avg_Monetary=("Monetary", "mean"),
        )
        .round(2)
        .reset_index()
    )

    total = len(rfm)
    summary["Persentase"] = (summary["Jumlah_Pelanggan"] / total * 100).round(1)

    # Urutkan dari pelanggan terbanyak
    summary = summary.sort_values("Jumlah_Pelanggan", ascending=False).reset_index(
        drop=True
    )

    return summary
