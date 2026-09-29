# 🛒 Customer Segmentation & RFM Analytics Portfolio

> **End-to-End Exploratory Data Analysis & Customer Segmentation using RFM (Recency, Frequency, Monetary) Modeling + Interactive Web Intelligence Dashboard.**

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg?logo=python&logoColor=white)](https://python.org)
[![Pandas](https://img.shields.io/badge/Pandas-2.0+-darkblue.svg?logo=pandas&logoColor=white)](https://pandas.pydata.org)
[![Chart.js](https://img.shields.io/badge/Dashboard-Chart.js-orange.svg?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Live Interactive Web Dashboard
Proyek ini dilengkapi dengan **Executive Web Dashboard (Dark Glassmorphic UI)** yang dapat diakses secara langsung:
- **Demo Lokal**: Buka [`web/index.html`](web/index.html) langsung di browser Anda, atau akses melalui XAMPP Apache di `http://localhost/EDA/customer-segmentation-rfm/web/`.
- **GitHub Pages**: Siap di-deploy langsung dari folder [`docs/`](docs/) tanpa memerlukan server Python backend!

### Fitur Dashboard Web:
- 📊 **Executive KPI Cards**: Total Revenue, Total Customers, Average Order Value (AOV), Churn Risk Index, dan Dominant Segment.
- 🎯 **Interactive Filtering**: Filter data pelanggan instan berdasarkan segmen (*Champions, Loyal, At Risk, Hibernating, dll*).
- 📈 **4 Visualisasi Interaktif**: Distribusi Proporsi Segmen, Kontribusi Omzet, Rata-rata Skor RFM, dan Matriks Kebaruan vs Spending (Scatter Bubble).
- 📋 **Strategic Action Playbook**: Rekomendasi taktis CRM & channel marketing otomatis per segmen.
- 🔍 **Customer Data Explorer**: Pencarian ID pelanggan, multi-column sorting, pagination, dan ekspor CSV data terfilter.
- 📤 **Custom CSV Upload**: Unggah file transaksi sendiri untuk dihitung RFM-nya secara instan di browser.

---

## 🎯 Ringkasan Hasil Analisis (Business Findings)

Berdasarkan analisis terhadap 300 pelanggan e-commerce:

| Segmen | Pelanggan | Share (%) | Rata-rata Recency | Rata-rata Frequency | Rata-rata Spending | Rekomendasi Taktis Pemasaran |
|---|:---:|:---:|:---:|:---:|:---:|---|
| **Champions** | 39 | 13.0% | 15 hari | 7.5x | Rp 7.359.658 | **VIP Retention**: Program loyalitas eksklusif, private WhatsApp support, early access. |
| **Loyal Customers** | 48 | 16.0% | 16 hari | 5.6x | Rp 3.691.450 | **Upselling**: Promosi bundel dan dorong kenaikan keranjang belanja (AOV). |
| **Potential Loyalists** | 33 | 11.0% | 16 hari | 3.2x | Rp 2.914.529 | **Nurturing**: Voucher pembelian berikutnya dan rekomendasi produk personal. |
| **Need Attention** | 39 | 13.0% | 46 hari | 6.5x | Rp 5.333.011 | **Re-engagement**: Kirim promo flash sale sebelum pelanggan mendingin lebih jauh. |
| **At Risk** | 33 | 11.0% | 94 hari | 7.0x | Rp 5.666.664 | **Critical Win-Back**: Diskon berbatas waktu agresif untuk menyelamatkan pelanggan bernilai tinggi. |
| **Hibernating** | 66 | 22.0% | 154 hari | 2.7x | Rp 2.022.505 | **Low-cost Awareness**: Kampanye email berkala tanpa membuang anggaran CAC tinggi. |
| **Others** | 42 | 14.0% | 85 hari | 3.9x | Rp 3.557.924 | **Exploratory**: Analisis preferensi kategori produk lebih lanjut. |

---

## 📁 Struktur Direktori

```text
customer-segmentation-rfm/
├── data/
│   ├── raw/
│   │   └── transactions_dummy.csv         # Data transaksi mentah
│   └── processed/
│       ├── rfm_segmented_customers.csv    # Hasil scoring & segmen per pelanggan
│       ├── segment_summary.csv            # Agregasi metrik per segmen
│       └── segment_summary.xlsx           # Laporan format Excel
├── docs/                                  # Mirror untuk deployment GitHub Pages
├── notebooks/
│   └── customer_segmentation.ipynb        # Clean notebook orchestrator (memanggil modul src)
├── reports/                               # Visualisasi hasil analisis (PNG)
│   ├── 01_segment_distribution.png
│   ├── 02_rfm_distributions.png
│   ├── 03_rfm_score_heatmap.png
│   ├── 04_segment_avg_rfm.png
│   └── 05_monetary_by_segment.png
├── src/                                   # Pipeline modular Python
│   ├── __init__.py
│   ├── config.py                          # Konfigurasi path & aturan RFM terpusat
│   ├── generate_data.py                   # Generator data dummy realistis
│   ├── cleaner.py                         # Data cleaning & anomaly removal
│   ├── rfm.py                             # Kalkulasi Recency, Frequency, Monetary + Scoring
│   ├── segmentation.py                    # Labeling segmen & agregasi insight
│   └── visualizer.py                      # Generator visualisasi matplotlib/seaborn
├── web/                                   # Live Interactive Web Dashboard
│   ├── index.html                         # Semantic HTML5 & responsive layout
│   ├── style.css                          # Dark glassmorphic design system
│   ├── app.js                             # Client-side filtering, sorting & charts
│   └── data.js                            # Pre-bundled dataset untuk akses offline
└── requirements.txt                       # Dependensi proyek Python
```

---

## 🚀 Cara Menjalankan

### 1. Menjalankan Web Dashboard
- **Cara 1 (Langsung di Browser)**: Cukup klik ganda [`web/index.html`](web/index.html).
- **Cara 2 (XAMPP / Apache)**: Letakkan di `htdocs` lalu akses `http://localhost/EDA/customer-segmentation-rfm/web/`.
- **Cara 3 (Local Python Server)**:
  ```powershell
  python -m http.server 8080 --directory web
  ```
  Buka browser di `http://localhost:8080`.

### 2. Menjalankan Pipeline Analisis Python & Notebook
1. Siapkan virtual environment dan install dependensi:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Generate data dummy baru (opsional):
   ```powershell
   python src/generate_data.py
   ```
3. Ekspor semua chart ke folder `reports/`:
   ```powershell
   python -c "import pandas as pd; from src.visualizer import export_all_charts; from src.config import REPORTS_DIR, DATA_PROCESSED_DIR; rfm = pd.read_csv(DATA_PROCESSED_DIR / 'rfm_segmented_customers.csv'); export_all_charts(rfm, REPORTS_DIR)"
   ```
4. Buka notebook untuk eksplorasi interaktif:
   ```powershell
   jupyter lab notebooks/customer_segmentation.ipynb
   ```

---

## 📊 Metodologi Segmentasi RFM

1. **Recency (R)**: Jumlah hari sejak transaksi terakhir pelanggan hingga `REFERENCE_DATE` (2026-01-01). Semakin kecil nilainya, semakin tinggi skornya (1–5).
2. **Frequency (F)**: Total frekuensi pesanan berhasil. Semakin banyak frekuensinya, semakin tinggi skornya (1–5).
3. **Monetary (M)**: Total nilai belanja (IDR). Semakin besar nominalnya, semakin tinggi skornya (1–5).
4. **Segment Mapping**: Aturan rule-based yang memetakan skor `(R, F, M)` menjadi 7 profil segmen aksi bisnis operasional.
