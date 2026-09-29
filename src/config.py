"""
config.py - Konfigurasi terpusat untuk proyek Customer Segmentation RFM

Semua parameter analisis, nama segmen, bobot skor, dan path file
didefinisikan di sini agar mudah diubah tanpa menyentuh logika utama.
"""

from datetime import datetime
from pathlib import Path

# ============================================================
# PROJECT PATHS
# ============================================================
PROJECT_ROOT = Path(__file__).resolve().parent.parent

DATA_RAW_DIR = PROJECT_ROOT / "data" / "raw"
DATA_PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
REPORTS_DIR = PROJECT_ROOT / "reports"

RAW_DATA_PATH = DATA_RAW_DIR / "transactions_dummy.csv"
RFM_OUTPUT_PATH = DATA_PROCESSED_DIR / "rfm_segmented_customers.csv"
SEGMENT_SUMMARY_CSV_PATH = DATA_PROCESSED_DIR / "segment_summary.csv"
SEGMENT_SUMMARY_XLSX_PATH = DATA_PROCESSED_DIR / "segment_summary.xlsx"

# ============================================================
# RFM ANALYSIS SETTINGS
# ============================================================

# Tanggal referensi untuk menghitung Recency
# Ubah ke datetime.today() jika ingin menggunakan tanggal hari ini
REFERENCE_DATE = datetime(2026, 1, 1)

# Jumlah quantile/bin untuk scoring RFM (1–5)
RFM_SCORE_BINS = 5

# ============================================================
# SEGMENTATION RULES
# ============================================================

# Label segmen berdasarkan kombinasi RFM Score
# Key: tuple (R_score range, F_score range, M_score range) — gunakan di notebook/modul segmentasi
SEGMENT_LABELS = {
    "Champions": "R >= 4 AND F >= 4",
    "Loyal Customers": "F >= 3 AND M >= 3",
    "Potential Loyalists": "R >= 3 AND F <= 3",
    "At Risk": "R <= 2 AND F >= 3",
    "Lost Customers": "R == 1 AND F <= 2",
    "New Customers": "R >= 4 AND F == 1",
    "Others": "Sisa pelanggan yang tidak masuk kategori lain",
}

# ============================================================
# VISUALIZATION SETTINGS
# ============================================================
FIGURE_DPI = 150
FIGURE_SIZE_DEFAULT = (10, 6)
FIGURE_SIZE_WIDE = (14, 6)
FIGURE_SIZE_SQUARE = (8, 8)

COLOR_PALETTE = "Set2"
STYLE = "seaborn-v0_8-whitegrid"

# ============================================================
# DATA GENERATION SETTINGS
# ============================================================
RANDOM_SEED = 42
N_CUSTOMERS = 300
N_TOTAL_ROWS = 1500
N_DUPLICATE_ROWS = 5

CATEGORIES = ["Electronics", "Fashion", "Home & Living", "Groceries", "Beauty"]
CATEGORY_PROBABILITIES = [0.15, 0.35, 0.20, 0.20, 0.10]

BASE_PRICES = {
    "Electronics": 1_200_000,
    "Fashion": 250_000,
    "Home & Living": 350_000,
    "Groceries": 75_000,
    "Beauty": 150_000,
}

PAYMENT_METHODS = ["Credit Card", "E-Wallet", "Bank Transfer", "COD"]
N_MISSING_PAYMENT = 30
N_MISSING_CATEGORY = 15
