"""
src package - Customer Segmentation RFM

Modul-modul yang tersedia:
- generate_data  : Generator data transaksi dummy
- cleaner        : Pembersihan data (missing value, duplikat, outlier)
- rfm            : Kalkulasi metrik Recency, Frequency, Monetary
- segmentation   : Logika segmentasi pelanggan berbasis skor RFM
- visualizer     : Pembuatan dan ekspor chart ke folder reports/
- config         : Konfigurasi terpusat (path, parameter, konstanta)
"""

from . import generate_data, cleaner, rfm, segmentation, visualizer, config  # noqa: F401
