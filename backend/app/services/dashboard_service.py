import calendar
from datetime import date, timedelta
from typing import List

from sqlalchemy import case, func
from sqlalchemy.orm import Session

from ..models.inventory import InventoryItem, InventoryMovement
from ..models.product import Product
from ..models.provider import Provider
from ..models.provider_order import ProviderOrder
from ..models.sale import Sale, SaleItem
from ..models.user import User
from ..models.waste import WasteRecord

MONTH_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]


def _prev_months(n: int) -> List[date]:
    """Return the first day of each of the last n calendar months (oldest first)."""
    today = date.today()
    months: List[date] = []
    for i in range(n - 1, -1, -1):
        m = today.month - i
        y = today.year
        while m <= 0:
            m += 12
            y -= 1
        months.append(date(y, m, 1))
    return months


def _month_end(first: date) -> date:
    last_day = calendar.monthrange(first.year, first.month)[1]
    return first.replace(day=last_day)


def _prev_month_first(d: date) -> date:
    if d.month == 1:
        return date(d.year - 1, 12, 1)
    return date(d.year, d.month - 1, 1)


def get_kpis(db: Session) -> dict:
    """Calculate all KPIs for the executive dashboard."""
    today = date.today()
    first_this_month = today.replace(day=1)
    prev_first = _prev_month_first(first_this_month)
    tomorrow = today + timedelta(days=1)

    # ── Inventory value ───────────────────────────────────────────
    products = db.query(Product).all()
    total_value = sum(p.price * p.stock for p in products)
    total_stock = sum(p.stock for p in products) or 1

    # Inventory entry cost: this month vs prev month (for delta)
    def _entry_cost(from_date: date, to_date: date) -> float:
        return float(
            db.query(func.coalesce(func.sum(InventoryItem.quantity * Product.price), 0))
            .join(Product, InventoryItem.product_id == Product.id)
            .filter(
                InventoryItem.receipt_date >= from_date,
                InventoryItem.receipt_date < to_date,
            )
            .scalar()
        )

    cost_this = _entry_cost(first_this_month, tomorrow)
    cost_prev = _entry_cost(prev_first, first_this_month)
    if cost_prev > 0:
        delta_pct = (cost_this - cost_prev) / cost_prev * 100
        inv_delta = f"{'+' if delta_pct >= 0 else ''}{delta_pct:.1f}%"
    else:
        inv_delta = "N/A"

    # ── Active products & movements ───────────────────────────────
    active_products = db.query(Product).filter(Product.stock > 0).count()
    movements_today = (
        db.query(InventoryMovement)
        .filter(func.date(InventoryMovement.created_at) == today)
        .count()
    )

    # ── Active users ──────────────────────────────────────────────
    active_users = db.query(User).filter(User.is_active == True).count()

    # ── Waste ─────────────────────────────────────────────────────
    waste_this_month = (
        db.query(WasteRecord)
        .filter(WasteRecord.waste_date >= first_this_month)
        .count()
    )
    waste_prev_month = (
        db.query(WasteRecord)
        .filter(WasteRecord.waste_date >= prev_first, WasteRecord.waste_date < first_this_month)
        .count()
    )
    waste_diff = waste_this_month - waste_prev_month
    avoided_waste_delta = f"{'+' if waste_diff >= 0 else ''}{waste_diff} vs mes ant."

    # ── Revenue & Gross Margin ────────────────────────────────────
    total_revenue = float(db.query(func.coalesce(func.sum(Sale.total), 0)).scalar())

    def _cogs(from_date: date = None, to_date: date = None) -> float:
        q = (
            db.query(func.coalesce(func.sum(InventoryMovement.quantity * Product.price), 0))
            .join(InventoryItem, InventoryMovement.inventory_item_id == InventoryItem.id)
            .join(Product, InventoryItem.product_id == Product.id)
            .filter(InventoryMovement.movement_type == "output")
        )
        if from_date:
            q = q.filter(func.date(InventoryMovement.created_at) >= from_date)
        if to_date:
            q = q.filter(func.date(InventoryMovement.created_at) < to_date)
        return float(q.scalar())

    cogs_total = _cogs()
    gross_margin = (total_revenue - cogs_total) / total_revenue * 100 if total_revenue > 0 else 0.0

    def _rev_period(from_date: date, to_date: date) -> float:
        return float(
            db.query(func.coalesce(func.sum(Sale.total), 0))
            .filter(
                func.date(Sale.created_at) >= from_date,
                func.date(Sale.created_at) < to_date,
            )
            .scalar()
        )

    rev_this = _rev_period(first_this_month, tomorrow)
    rev_prev = _rev_period(prev_first, first_this_month)
    cogs_this = _cogs(first_this_month, tomorrow)
    cogs_prev = _cogs(prev_first, first_this_month)
    m_this = (rev_this - cogs_this) / rev_this * 100 if rev_this > 0 else 0.0
    m_prev = (rev_prev - cogs_prev) / rev_prev * 100 if rev_prev > 0 else 0.0
    margin_delta = m_this - m_prev
    margin_delta_str = f"{'+' if margin_delta >= 0 else ''}{margin_delta:.1f}%"

    # ── Rotation rate ─────────────────────────────────────────────
    total_sold = float(db.query(func.coalesce(func.sum(SaleItem.quantity), 0)).scalar())
    rotation_rate = round(total_sold / total_stock, 1)

    last_30 = today - timedelta(days=30)
    prev_60 = today - timedelta(days=60)

    def _sold_period(from_date: date, to_date: date) -> float:
        return float(
            db.query(func.coalesce(func.sum(SaleItem.quantity), 0))
            .join(Sale, SaleItem.sale_id == Sale.id)
            .filter(
                func.date(Sale.created_at) >= from_date,
                func.date(Sale.created_at) < to_date,
            )
            .scalar()
        )

    sold_recent = _sold_period(last_30, tomorrow)
    sold_prev_30 = _sold_period(prev_60, last_30)
    if sold_prev_30 > 0:
        rot_delta_pct = (sold_recent - sold_prev_30) / sold_prev_30 * 100
        rotation_delta = f"{'+' if rot_delta_pct >= 0 else ''}{rot_delta_pct:.1f}%"
    else:
        rotation_delta = "N/A"

    # ── Fulfillment ───────────────────────────────────────────────
    total_orders = db.query(ProviderOrder).count()
    received_orders = (
        db.query(ProviderOrder).filter(ProviderOrder.status == "received").count()
    )
    fulfillment_pct = (
        round(received_orders / total_orders * 100, 1) if total_orders > 0 else 0.0
    )

    def _fulfillment_period(from_date: date, to_date: date):
        total = (
            db.query(ProviderOrder)
            .filter(
                func.date(ProviderOrder.created_at) >= from_date,
                func.date(ProviderOrder.created_at) < to_date,
            )
            .count()
        )
        received = (
            db.query(ProviderOrder)
            .filter(
                func.date(ProviderOrder.created_at) >= from_date,
                func.date(ProviderOrder.created_at) < to_date,
                ProviderOrder.status == "received",
            )
            .count()
        )
        return round(received / total * 100, 1) if total > 0 else None

    f_this = _fulfillment_period(first_this_month, tomorrow)
    f_prev = _fulfillment_period(prev_first, first_this_month)
    if f_this is not None and f_prev is not None:
        f_delta = f_this - f_prev
        fulfillment_delta = f"{'+' if f_delta >= 0 else ''}{f_delta:.1f}%"
    else:
        fulfillment_delta = "N/A"

    # ── Stock accuracy ────────────────────────────────────────────
    total_products = db.query(Product).count()
    stock_accuracy = (
        round(active_products / total_products * 100, 1) if total_products > 0 else 0.0
    )

    return {
        "inventory_value": f"${total_value:,.2f}",
        "inventory_delta": inv_delta,
        "avoided_waste": f"{waste_this_month} registros",
        "avoided_waste_delta": avoided_waste_delta,
        "avg_response_time": f"{active_products} activos",
        "avg_response_delta": f"{movements_today} mov. hoy",
        "active_products": active_products,
        "movements_today": movements_today,
        "active_users": active_users,
        "rotation_rate": f"{rotation_rate}x",
        "rotation_delta": rotation_delta,
        "fulfillment": f"{fulfillment_pct:.1f}%",
        "fulfillment_delta": fulfillment_delta,
        "response_time": "—",
        "response_delta": "—",
        "stock_accuracy": f"{stock_accuracy:.1f}%",
        "stock_delta": "+0.4%",
        "profit_margin": f"{gross_margin:.1f}%",
        "profit_margin_delta": margin_delta_str,
        "waste_this_month": waste_this_month,
    }


def get_stock_chart(db: Session) -> List[dict]:
    """Inventory entries (quantity) per month for the last 6 months."""
    result = []
    for first in _prev_months(6):
        last = _month_end(first)
        total = (
            db.query(func.coalesce(func.sum(InventoryMovement.quantity), 0))
            .filter(
                func.date(InventoryMovement.created_at) >= first,
                func.date(InventoryMovement.created_at) <= last,
                InventoryMovement.movement_type == "entry",
            )
            .scalar()
        )
        result.append({"label": MONTH_ES[first.month - 1], "value": float(total)})
    return result


def get_category_chart(db: Session) -> List[dict]:
    """Get product distribution by category."""
    result = (
        db.query(Product.category, func.sum(Product.stock))
        .group_by(Product.category)
        .all()
    )
    return [{"label": cat, "value": float(total or 0)} for cat, total in result]


def get_revenue_chart(db: Session) -> List[dict]:
    """Real monthly sales vs estimated inventory cost for the last 6 months."""
    result = []
    for first in _prev_months(6):
        last = _month_end(first)

        revenue = (
            db.query(func.coalesce(func.sum(Sale.total), 0))
            .filter(
                func.date(Sale.created_at) >= first,
                func.date(Sale.created_at) <= last,
            )
            .scalar()
        )

        cost = (
            db.query(func.coalesce(func.sum(InventoryItem.quantity * Product.price), 0))
            .join(Product, InventoryItem.product_id == Product.id)
            .filter(
                InventoryItem.receipt_date >= first,
                InventoryItem.receipt_date <= last,
            )
            .scalar()
        )

        result.append({
            "label": MONTH_ES[first.month - 1],
            "value": float(revenue),
            "value2": float(cost),
        })
    return result


def get_movement_chart(db: Session) -> List[dict]:
    """Get daily entry vs output movements for the last 7 days."""
    today = date.today()
    result = []
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        label = f"{target_date.day:02d}/{target_date.month:02d}"
        entries = (
            db.query(InventoryMovement)
            .filter(
                func.date(InventoryMovement.created_at) == target_date,
                InventoryMovement.movement_type == "entry",
            )
            .count()
        )
        outputs = (
            db.query(InventoryMovement)
            .filter(
                func.date(InventoryMovement.created_at) == target_date,
                InventoryMovement.movement_type == "output",
            )
            .count()
        )
        result.append({"label": label, "value": entries, "value2": outputs})

    return result


def get_waste_chart(db: Session) -> List[dict]:
    """Waste quantity and record count per month for the last 6 months."""
    result = []
    for first in _prev_months(6):
        last = _month_end(first)
        total_qty = (
            db.query(func.coalesce(func.sum(WasteRecord.quantity), 0))
            .filter(
                WasteRecord.waste_date >= first,
                WasteRecord.waste_date <= last,
            )
            .scalar()
        )
        count = (
            db.query(func.count(WasteRecord.id))
            .filter(
                WasteRecord.waste_date >= first,
                WasteRecord.waste_date <= last,
            )
            .scalar()
        )
        result.append({
            "label": MONTH_ES[first.month - 1],
            "value": round(float(total_qty), 2),
            "value2": float(count),
        })
    return result


def get_top_products(db: Session) -> List[dict]:
    """Get top 5 best-selling products."""
    result = (
        db.query(
            SaleItem.product_name,
            func.sum(SaleItem.quantity).label("total_qty"),
            func.sum(SaleItem.total_price).label("total_revenue"),
        )
        .group_by(SaleItem.product_name)
        .order_by(func.sum(SaleItem.total_price).desc())
        .limit(5)
        .all()
    )

    return [
        {"name": name, "sales": int(qty or 0), "revenue": float(rev or 0)}
        for name, qty, rev in result
    ]


def get_top_providers(db: Session) -> List[dict]:
    """Top providers by rating with real order counts from provider_orders."""
    order_stats = (
        db.query(
            ProviderOrder.provider_id,
            func.count(ProviderOrder.id).label("total_orders"),
            func.sum(
                case((ProviderOrder.status == "received", 1), else_=0)
            ).label("received_orders"),
        )
        .filter(ProviderOrder.provider_id.isnot(None))
        .group_by(ProviderOrder.provider_id)
        .all()
    )
    stats_map = {
        row.provider_id: (int(row.total_orders), int(row.received_orders or 0))
        for row in order_stats
    }

    providers = (
        db.query(Provider)
        .filter(Provider.status == "active")
        .order_by(Provider.rating.desc())
        .limit(5)
        .all()
    )

    result = []
    for p in providers:
        total, received = stats_map.get(p.id, (0, 0))
        on_time = round(received / total * 100, 1) if total > 0 else 0.0
        result.append({
            "name": p.name,
            "rating": p.rating,
            "orders": total,
            "on_time": on_time,
        })
    return result
