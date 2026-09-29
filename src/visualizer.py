"""
visualizer.py - Modul visualisasi untuk Customer Segmentation RFM

Berisi fungsi untuk membuat dan menyimpan chart ke folder reports/.
"""

from pathlib import Path

import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
import pandas as pd


# ── Helpers ──────────────────────────────────────────────────────────────────

def _save(fig: plt.Figure, reports_dir: Path, filename: str) -> Path:
    """Simpan figure ke reports_dir dan return path-nya."""
    reports_dir.mkdir(parents=True, exist_ok=True)
    out = reports_dir / filename
    fig.savefig(out, dpi=150, bbox_inches="tight")
    print(f"  [SAVED] {out}")
    return out


def setup_style() -> None:
    """Terapkan style seaborn yang konsisten di semua plot."""
    sns.set_theme(style="whitegrid", palette="Set2")


# ── Chart Functions ───────────────────────────────────────────────────────────

def plot_segment_distribution(
    rfm: pd.DataFrame,
    reports_dir: Path,
    filename: str = "01_segment_distribution.png",
) -> plt.Figure:
    """
    Bar chart distribusi jumlah pelanggan per segmen.

    Parameters
    ----------
    rfm : pd.DataFrame
        DataFrame RFM dengan kolom 'Segment'.
    reports_dir : Path
        Direktori output untuk menyimpan chart.
    filename : str
        Nama file output.

    Returns
    -------
    plt.Figure
    """
    counts = rfm["Segment"].value_counts()

    fig, ax = plt.subplots(figsize=(10, 5))
    sns.barplot(x=counts.index, y=counts.values, hue=counts.index, ax=ax, palette="Set2", legend=False)

    ax.set_title("Distribusi Pelanggan per Segmen", fontsize=14, fontweight="bold", pad=12)
    ax.set_xlabel("Segmen", fontsize=11)
    ax.set_ylabel("Jumlah Pelanggan", fontsize=11)
    ax.tick_params(axis="x", rotation=20)

    for bar in ax.patches:
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.5,
            int(bar.get_height()),
            ha="center",
            va="bottom",
            fontsize=9,
        )

    fig.tight_layout()
    _save(fig, reports_dir, filename)
    return fig


def plot_rfm_distributions(
    rfm: pd.DataFrame,
    reports_dir: Path,
    filename: str = "02_rfm_distributions.png",
) -> plt.Figure:
    """
    Histogram distribusi nilai Recency, Frequency, dan Monetary.

    Parameters
    ----------
    rfm : pd.DataFrame
        DataFrame RFM.
    reports_dir : Path
        Direktori output.
    filename : str
        Nama file output.

    Returns
    -------
    plt.Figure
    """
    fig, axes = plt.subplots(1, 3, figsize=(14, 4))

    metrics = ["Recency", "Frequency", "Monetary"]
    colors = sns.color_palette("Set2", 3)

    for ax, metric, color in zip(axes, metrics, colors):
        ax.hist(rfm[metric], bins=20, color=color, edgecolor="white", linewidth=0.5)
        ax.set_title(f"Distribusi {metric}", fontsize=12, fontweight="bold")
        ax.set_xlabel(metric, fontsize=10)
        ax.set_ylabel("Frekuensi", fontsize=10)

        # Format angka besar pada sumbu x Monetary
        if metric == "Monetary":
            ax.xaxis.set_major_formatter(
                mticker.FuncFormatter(lambda x, _: f"{x/1_000_000:.1f}M")
            )

    fig.suptitle("Distribusi Metrik RFM", fontsize=14, fontweight="bold", y=1.02)
    fig.tight_layout()
    _save(fig, reports_dir, filename)
    return fig


def plot_rfm_heatmap(
    rfm: pd.DataFrame,
    reports_dir: Path,
    filename: str = "03_rfm_score_heatmap.png",
) -> plt.Figure:
    """
    Heatmap rata-rata Monetary per kombinasi R_Score × F_Score.

    Parameters
    ----------
    rfm : pd.DataFrame
        DataFrame RFM dengan kolom R_Score, F_Score, Monetary.
    reports_dir : Path
        Direktori output.
    filename : str
        Nama file output.

    Returns
    -------
    plt.Figure
    """
    pivot = rfm.pivot_table(
        values="Monetary", index="R_Score", columns="F_Score", aggfunc="mean"
    )

    fig, ax = plt.subplots(figsize=(8, 6))
    sns.heatmap(
        pivot,
        annot=True,
        fmt=".0f",
        cmap="YlOrRd",
        linewidths=0.5,
        ax=ax,
        cbar_kws={"label": "Avg Monetary (IDR)"},
    )

    ax.set_title(
        "Rata-rata Monetary per Kombinasi R × F Score",
        fontsize=13,
        fontweight="bold",
        pad=12,
    )
    ax.set_xlabel("F Score (Frequency)", fontsize=11)
    ax.set_ylabel("R Score (Recency)", fontsize=11)

    fig.tight_layout()
    _save(fig, reports_dir, filename)
    return fig


def plot_segment_avg_rfm(
    rfm: pd.DataFrame,
    reports_dir: Path,
    filename: str = "04_segment_avg_rfm.png",
) -> plt.Figure:
    """
    Grouped bar chart rata-rata R, F, M Score per segmen.

    Parameters
    ----------
    rfm : pd.DataFrame
        DataFrame RFM dengan kolom Segment, R_Score, F_Score, M_Score.
    reports_dir : Path
        Direktori output.
    filename : str
        Nama file output.

    Returns
    -------
    plt.Figure
    """
    avg = (
        rfm.groupby("Segment")[["R_Score", "F_Score", "M_Score"]]
        .mean()
        .round(2)
        .reset_index()
    )
    avg_melted = avg.melt(id_vars="Segment", var_name="Metric", value_name="Avg Score")

    fig, ax = plt.subplots(figsize=(12, 5))
    sns.barplot(
        data=avg_melted,
        x="Segment",
        y="Avg Score",
        hue="Metric",
        palette="Set2",
        ax=ax,
    )

    ax.set_title(
        "Rata-rata Skor R, F, M per Segmen",
        fontsize=13,
        fontweight="bold",
        pad=12,
    )
    ax.set_xlabel("Segmen", fontsize=11)
    ax.set_ylabel("Rata-rata Skor (1–5)", fontsize=11)
    ax.set_ylim(0, 5.5)
    ax.tick_params(axis="x", rotation=20)
    ax.legend(title="Metrik")

    fig.tight_layout()
    _save(fig, reports_dir, filename)
    return fig


def plot_monetary_by_segment(
    rfm: pd.DataFrame,
    reports_dir: Path,
    filename: str = "05_monetary_by_segment.png",
) -> plt.Figure:
    """
    Box plot distribusi Monetary per segmen.

    Parameters
    ----------
    rfm : pd.DataFrame
        DataFrame RFM dengan kolom Segment, Monetary.
    reports_dir : Path
        Direktori output.
    filename : str
        Nama file output.

    Returns
    -------
    plt.Figure
    """
    order = rfm.groupby("Segment")["Monetary"].median().sort_values(ascending=False).index

    fig, ax = plt.subplots(figsize=(12, 5))
    sns.boxplot(
        data=rfm,
        x="Segment",
        y="Monetary",
        order=order,
        palette="Set2",
        ax=ax,
    )

    ax.set_title(
        "Distribusi Monetary per Segmen",
        fontsize=13,
        fontweight="bold",
        pad=12,
    )
    ax.set_xlabel("Segmen", fontsize=11)
    ax.set_ylabel("Total Spending (IDR)", fontsize=11)
    ax.yaxis.set_major_formatter(
        mticker.FuncFormatter(lambda x, _: f"{x/1_000_000:.1f}M")
    )
    ax.tick_params(axis="x", rotation=20)

    fig.tight_layout()
    _save(fig, reports_dir, filename)
    return fig


# ── Convenience: export all ───────────────────────────────────────────────────

def export_all_charts(rfm: pd.DataFrame, reports_dir: Path) -> None:
    """
    Generate dan simpan semua chart sekaligus ke reports_dir.

    Parameters
    ----------
    rfm : pd.DataFrame
        DataFrame RFM lengkap dengan kolom Segment.
    reports_dir : Path
        Direktori output untuk semua chart.
    """
    setup_style()
    print(f"\nExporting charts to: {reports_dir}")

    plot_segment_distribution(rfm, reports_dir)
    plot_rfm_distributions(rfm, reports_dir)
    plot_rfm_heatmap(rfm, reports_dir)
    plot_segment_avg_rfm(rfm, reports_dir)
    plot_monetary_by_segment(rfm, reports_dir)

    print("\nSemua chart berhasil diekspor.")
    plt.close("all")
