"""
BodeFlux - Seed Data Script
=============================
Populates the database with 13 months of realistic demo data
(May 2025 – May 2026) for generating monthly, quarterly, and
annual PDF reports from the Executive Dashboard.

Usage:
    cd backend
    python seed_data.py

Creates:
  - 3 demo users (one per role)
  - 6 providers
  - 12 products
  - 35 inventory items spread over the year
  - ~100 sales with items (seasonal variation)
  - ~40 waste records
"""

import sys
import os
import random
from datetime import date, datetime, timedelta

# Fix Windows console encoding for emoji output
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Ensure the app package is importable
sys.path.insert(0, os.path.dirname(__file__))

from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.provider import Provider
from app.models.product import Product
from app.models.inventory import InventoryItem, InventoryMovement
from app.models.sale import Sale, SaleItem
from app.models.waste import WasteRecord
from app.utils.security import hash_password

random.seed(42)   # reproducible


def dt(year: int, month: int, day: int, hour: int = 10) -> datetime:
    return datetime(year, month, day, hour, random.randint(0, 59))


def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Wipe existing data unconditionally
        print("🗑️  Limpiando base de datos...")
        db.query(SaleItem).delete()
        db.query(Sale).delete()
        db.query(WasteRecord).delete()
        db.query(InventoryMovement).delete()
        db.query(InventoryItem).delete()
        db.query(Product).delete()
        db.query(Provider).delete()
        db.query(User).delete()
        db.commit()

        # ========================
        # USERS
        # ========================
        print("👤 Creando usuarios...")
        users = [
            User(employee_id="ALM001", name="Carlos Mendoza",  email="carlos@bodeflux.com",  password_hash=hash_password("123456"), role="warehouse"),
            User(employee_id="VEN001", name="María García",    email="maria@bodeflux.com",   password_hash=hash_password("123456"), role="sales"),
            User(employee_id="EJE001", name="Roberto López",   email="roberto@bodeflux.com", password_hash=hash_password("123456"), role="executive"),
        ]
        db.add_all(users)
        db.flush()

        # ========================
        # PROVIDERS
        # ========================
        print("🏢 Creando proveedores...")
        providers = [
            Provider(name="AgroNutrientes SA",    contact="Juan Pérez",       email="ventas@agronutrientes.com",  phone="+52 33 1234 5678", address="Av. Revolución 456, Guadalajara, JAL",           category="Fertilizantes", rating=4.8, status="active"),
            Provider(name="SemiPro México",        contact="Ana Rodríguez",    email="contacto@semipro.mx",        phone="+52 55 9876 5432", address="Calle Industrial 789, CDMX",                    category="Semillas",      rating=4.5, status="active"),
            Provider(name="ProteCampo",            contact="Luis Martínez",    email="info@protecampo.com",        phone="+52 81 5555 1234", address="Blvd. Agrícola 321, Monterrey, NL",            category="Pesticidas",    rating=4.2, status="active"),
            Provider(name="HerbiMax",              contact="Patricia Sánchez", email="ventas@herbimax.com",        phone="+52 33 7777 8888", address="Carr. Chapala km 12, Guadalajara, JAL",         category="Herbicidas",    rating=4.6, status="active"),
            Provider(name="BioAgro Solutions",     contact="Fernando Torres",  email="fernando@bioagro.com",       phone="+52 55 4444 3333", address="Parque Industrial Norte 100, Querétaro, QRO",   category="Fertilizantes", rating=4.9, status="active"),
            Provider(name="Semillas del Campo MX", contact="Rosa Jiménez",     email="rosa@semillascampo.mx",      phone="+52 44 2222 1111", address="Km 5 Carr. Morelia, Michoacán",                 category="Semillas",      rating=4.3, status="active"),
        ]
        db.add_all(providers)
        db.flush()

        # ========================
        # PRODUCTS (catalog)
        # ========================
        print("📦 Creando productos...")
        products = [
            # idx 0
            Product(name="Fertilizante Orgánico Premium",  category="Fertilizantes", stock=320, price=285.00, unit="kg",    image_emoji="🌿",  status="available"),
            # idx 1
            Product(name="Urea Granulada 46-0-0",          category="Fertilizantes", stock=480, price=340.00, unit="kg",    image_emoji="⚗️",  status="available"),
            # idx 2
            Product(name="Semilla de Maíz Híbrido",        category="Semillas",      stock=160, price=520.00, unit="bolsa", image_emoji="🌽",  status="available"),
            # idx 3
            Product(name="Semilla de Frijol Negro",        category="Semillas",      stock=95,  price=180.00, unit="kg",    image_emoji="🫘",  status="available"),
            # idx 4
            Product(name="Insecticida Cipermetrina",       category="Pesticidas",    stock=75,  price=450.00, unit="L",     image_emoji="🧪",  status="available"),
            # idx 5
            Product(name="Herbicida Glifosato",            category="Herbicidas",    stock=110, price=380.00, unit="L",     image_emoji="🧫",  status="available"),
            # idx 6
            Product(name="NPK 20-20-20 Soluble",           category="Fertilizantes", stock=28,  price=290.00, unit="kg",    image_emoji="💎",  status="low"),
            # idx 7
            Product(name="Semilla de Trigo",               category="Semillas",      stock=220, price=250.00, unit="kg",    image_emoji="🌾",  status="available"),
            # idx 8
            Product(name="Fungicida Cúprico",              category="Pesticidas",    stock=45,  price=620.00, unit="L",     image_emoji="🔬",  status="available"),
            # idx 9
            Product(name="Bioestimulante Radical",         category="Otros",         stock=30,  price=750.00, unit="L",     image_emoji="🌱",  status="available"),
            # idx 10
            Product(name="Sulfato de Amonio",              category="Fertilizantes", stock=540, price=195.00, unit="kg",    image_emoji="🧂",  status="available"),
            # idx 11
            Product(name="Semilla de Chile Habanero",      category="Semillas",      stock=55,  price=420.00, unit="bolsa", image_emoji="🌶️", status="available"),
        ]
        db.add_all(products)
        db.flush()

        # ========================
        # INVENTORY ITEMS (35 items, spread over the year)
        # ========================
        print("📋 Creando inventario...")
        today = date.today()

        def inv(pname, cat, qty, unit, lot, exp_offset, loc, prov_name, prov_obj, receipt_offset, status="active"):
            return InventoryItem(
                product_name=pname, category=cat, quantity=qty, unit=unit,
                lot_number=lot,
                expiry_date=today + timedelta(days=exp_offset),
                location=loc, provider=prov_name, provider_id=prov_obj.id,
                receipt_date=today - timedelta(days=receipt_offset),
                status=status,
            )

        inventory_items = [
            # Current / near-expiry (for alerts)
            inv("Fertilizante Orgánico Premium", "Fertilizantes", 80,  "kg",    "LOT-2026-001",  8,  "Pasillo A-1", "AgroNutrientes SA",    providers[0], 60),
            inv("Semilla de Maíz Híbrido",       "Semillas",      45,  "bolsa", "LOT-2026-002",  22, "Pasillo B-2", "SemiPro México",       providers[1], 15),
            inv("Insecticida Cipermetrina",       "Pesticidas",    20,  "L",     "LOT-2026-003",  95, "Pasillo C-1", "ProteCampo",           providers[2], 5),
            inv("Urea Granulada 46-0-0",          "Fertilizantes", 120, "kg",    "LOT-2026-004",  185,"Pasillo A-2", "BioAgro Solutions",    providers[4], 10),
            inv("Herbicida Glifosato",            "Herbicidas",    25,  "L",     "LOT-2026-005",  -3, "Pasillo B-3", "HerbiMax",             providers[3], 65),   # EXPIRED
            inv("NPK 20-20-20 Soluble",           "Fertilizantes", 28,  "kg",    "LOT-2026-006",  6,  "Pasillo C-3", "AgroNutrientes SA",    providers[0], 45),   # Critical
            inv("Semilla de Trigo",               "Semillas",      100, "kg",    "LOT-2026-007",  65, "Pasillo A-3", "SemiPro México",       providers[1], 20),
            inv("Fungicida Cúprico",              "Pesticidas",    18,  "L",     "LOT-2026-008",  18, "Pasillo B-1", "ProteCampo",           providers[2], 8),    # Warning
            inv("Sulfato de Amonio",              "Fertilizantes", 200, "kg",    "LOT-2026-009",  210,"Pasillo D-1", "BioAgro Solutions",    providers[4], 12),
            inv("Semilla de Frijol Negro",        "Semillas",      60,  "kg",    "LOT-2026-010",  120,"Pasillo B-4", "Semillas del Campo MX",providers[5], 18),
            inv("Semilla de Chile Habanero",      "Semillas",      40,  "bolsa", "LOT-2026-011",  90, "Pasillo B-5", "Semillas del Campo MX",providers[5], 7),
            inv("Bioestimulante Radical",         "Otros",         30,  "L",     "LOT-2026-012",  150,"Pasillo D-2", "BioAgro Solutions",    providers[4], 3),
            # Historical — output/waste (closed)
            inv("Herbicida Glifosato",            "Herbicidas",    40,  "L",     "LOT-2025-H01", -30, "Pasillo B-3", "HerbiMax",             providers[3], 180, "output"),
            inv("Fertilizante Orgánico Premium",  "Fertilizantes", 50,  "kg",    "LOT-2025-H02",  30, "Pasillo A-1", "AgroNutrientes SA",    providers[0], 150, "output"),
            inv("Urea Granulada 46-0-0",          "Fertilizantes", 80,  "kg",    "LOT-2025-H03",  15, "Pasillo A-2", "BioAgro Solutions",    providers[4], 120, "output"),
            inv("Insecticida Cipermetrina",       "Pesticidas",    12,  "L",     "LOT-2025-H04", -10, "Pasillo C-1", "ProteCampo",           providers[2], 200, "waste"),
            inv("Semilla de Maíz Híbrido",        "Semillas",      20,  "bolsa", "LOT-2025-H05",  -5, "Pasillo B-2", "SemiPro México",       providers[1], 250, "output"),
            inv("NPK 20-20-20 Soluble",           "Fertilizantes", 15,  "kg",    "LOT-2025-H06", -20, "Pasillo C-3", "AgroNutrientes SA",    providers[0], 300, "waste"),
            inv("Semilla de Trigo",               "Semillas",      150, "kg",    "LOT-2025-H07",  10, "Pasillo A-3", "Semillas del Campo MX",providers[5], 270, "output"),
            inv("Sulfato de Amonio",              "Fertilizantes", 300, "kg",    "LOT-2025-H08",  60, "Pasillo D-1", "BioAgro Solutions",    providers[4], 320, "output"),
            inv("Fungicida Cúprico",              "Pesticidas",    10,  "L",     "LOT-2025-H09", -15, "Pasillo B-1", "ProteCampo",           providers[2], 340, "waste"),
            inv("Herbicida Glifosato",            "Herbicidas",    30,  "L",     "LOT-2025-H10",  25, "Pasillo B-3", "HerbiMax",             providers[3], 360, "output"),
            inv("Bioestimulante Radical",         "Otros",         8,   "L",     "LOT-2025-H11",  -8, "Pasillo D-2", "BioAgro Solutions",    providers[4], 380, "waste"),
            inv("Semilla de Frijol Negro",        "Semillas",      35,  "kg",    "LOT-2025-H12",  5,  "Pasillo B-4", "Semillas del Campo MX",providers[5], 400, "output"),
        ]
        db.add_all(inventory_items)
        db.flush()

        # Entry movements for current items
        for item in inventory_items:
            db.add(InventoryMovement(
                inventory_item_id=item.id,
                movement_type="entry",
                quantity=item.quantity,
                user_id=users[0].id,
                notes=f"Entrada: {item.product_name}",
            ))
            if item.status == "output":
                db.add(InventoryMovement(
                    inventory_item_id=item.id,
                    movement_type="output",
                    quantity=item.quantity,
                    user_id=users[0].id,
                    notes=f"Salida: {item.product_name}",
                ))
        db.flush()

        # ========================
        # SALES — 13 months of data (May 2025 – May 2026)
        # Seasonal profile:
        #   Q2 (Apr-Jun): peak seeds & fertilizers
        #   Q3 (Jul-Sep): peak pesticides & herbicides
        #   Q4 (Oct-Dec): moderate (harvest / fungicides)
        #   Q1 (Jan-Mar): slow (planning / NPK)
        # ========================
        print("💰 Creando ventas históricas (13 meses)...")

        customers = [
            "Rancho El Porvenir",
            "Cooperativa Agrícola del Valle",
            "Agroindustrias del Norte",
            "Hacienda San Marcos",
            "Productores Unidos de Jalisco",
            "Ejido La Esperanza",
            "Granja Santa Rosa",
            "Inversiones Agrícolas SAPM",
            "Rancho Las Palmas",
            "Cooperativa Tierra Fértil",
            "Agropecuaria del Bajío",
            "Finca Los Cedros",
        ]

        # (product_idx, base_qty, seasonal_weight_per_month[0=May2025..12=May2026])
        # weights control how many sales of that product happen each month
        sales_catalog = [
            # Fertilizante Orgánico Premium — spring/summer heavy
            (0, 285.00, [6,4,3,3,5,7,6,5,4,4,5,7, 6]),
            # Urea Granulada — spring + fall heavy
            (1, 340.00, [7,5,4,4,6,8,6,5,5,5,6,8, 7]),
            # Semilla Maíz — spring spike
            (2, 520.00, [8,9,5,2,2,3,3,2,2,5,8,7, 8]),
            # Semilla Frijol — spring + early summer
            (3, 180.00, [5,6,4,2,2,2,3,2,2,4,6,5, 5]),
            # Insecticida — summer heavy
            (4, 450.00, [3,4,6,8,9,8,6,4,3,3,4,4, 3]),
            # Herbicida Glifosato — summer + fall
            (5, 380.00, [3,3,5,7,8,9,7,5,4,3,3,4, 3]),
            # NPK Soluble — winter + spring
            (6, 290.00, [2,2,3,4,5,4,3,2,2,3,3,3, 2]),
            # Semilla Trigo — fall/winter spike
            (7, 250.00, [2,2,2,3,3,4,5,7,8,6,4,3, 2]),
            # Fungicida — summer + fall
            (8, 620.00, [2,3,4,5,6,7,7,5,4,3,3,3, 2]),
            # Bioestimulante — spring + summer
            (9, 750.00, [3,4,5,6,6,5,4,3,3,3,4,4, 3]),
            # Sulfato de Amonio — all year, spring peak
            (10, 195.00, [5,4,3,3,6,7,6,5,5,5,5,6, 5]),
            # Semilla Chile — spring planting
            (11, 420.00, [4,5,3,2,2,2,2,2,2,3,4,4, 4]),
        ]

        # months: 0=May-2025, 1=Jun-2025 ... 11=Apr-2026, 12=May-2026
        month_dates = [
            (2025, 5), (2025, 6), (2025, 7), (2025, 8),
            (2025, 9), (2025, 10), (2025, 11), (2025, 12),
            (2026, 1), (2026, 2), (2026, 3), (2026, 4),
            (2026, 5),
        ]

        sale_count = 0
        for mi, (yr, mo) in enumerate(month_dates):
            # Number of days in this month
            if mo == 12:
                days_in_month = 31
            elif mo in (4, 6, 9, 11):
                days_in_month = 30
            elif mo == 2:
                days_in_month = 28
            else:
                days_in_month = 31
            # For current month (May 2026) only use days 1-13
            if yr == 2026 and mo == 5:
                days_in_month = 13

            # Build a pool of (product_idx, unit_price) entries weighted by seasonal weight
            pool = []
            for (pidx, uprice, weights) in sales_catalog:
                pool.extend([(pidx, uprice)] * weights[mi])

            # Generate 6-10 sales this month
            n_sales = random.randint(6, 10)
            days_used = sorted(random.sample(range(1, days_in_month + 1), min(n_sales, days_in_month)))

            for day in days_used:
                customer = random.choice(customers)
                sale_dt = dt(yr, mo, day, random.randint(8, 17))
                # Each sale has 1-3 items
                n_items = random.randint(1, 3)
                chosen = random.sample(pool, min(n_items, len(pool)))
                # deduplicate by product
                seen = set()
                items_data = []
                for (pidx, uprice) in chosen:
                    if pidx in seen:
                        continue
                    seen.add(pidx)
                    qty = round(random.uniform(2, 12), 1)
                    items_data.append((pidx, uprice, qty))

                subtotal = round(sum(up * q for _, up, q in items_data), 2)
                tax = round(subtotal * 0.16, 2)
                total = round(subtotal + tax, 2)

                sale = Sale(
                    user_id=users[1].id,
                    customer_name=customer,
                    subtotal=subtotal,
                    tax=tax,
                    total=total,
                    status="completed",
                    created_at=sale_dt,
                )
                db.add(sale)
                db.flush()

                for (pidx, uprice, qty) in items_data:
                    db.add(SaleItem(
                        sale_id=sale.id,
                        product_id=products[pidx].id,
                        product_name=products[pidx].name,
                        quantity=qty,
                        unit_price=uprice,
                        total_price=round(uprice * qty, 2),
                    ))
                sale_count += 1

        db.flush()
        print(f"   → {sale_count} ventas creadas")

        # ========================
        # WASTE RECORDS — spread over 13 months
        # ========================
        print("⚠️  Creando mermas históricas...")

        waste_products = [
            ("Fertilizante Vencido",    "kg",    "vencimiento"),
            ("Semilla Dañada",          "bolsa", "humedad"),
            ("Insecticida Deteriorado", "L",     "daño físico"),
            ("Herbicida Caducado",      "L",     "vencimiento"),
            ("Urea Apelmazada",         "kg",    "humedad"),
            ("Fungicida Contaminado",   "L",     "contaminación"),
            ("Semilla de Trigo",        "kg",    "plaga"),
            ("NPK Apelmazado",          "kg",    "humedad"),
        ]

        lot_counter = 1
        for mi, (yr, mo) in enumerate(month_dates):
            # 2-5 waste events per month
            n_waste = random.randint(2, 5)
            if yr == 2026 and mo == 5:
                n_waste = random.randint(1, 3)
            days_in_month = 28 if mo == 2 else (30 if mo in (4,6,9,11) else 31)
            if yr == 2026 and mo == 5:
                days_in_month = 13
            for _ in range(n_waste):
                wp = random.choice(waste_products)
                day = random.randint(1, days_in_month)
                qty = round(random.uniform(1, 15), 1)
                db.add(WasteRecord(
                    lot_number=f"WASTE-{yr}-{mo:02d}-{lot_counter:03d}",
                    product_name=wp[0],
                    quantity=qty,
                    unit=wp[1],
                    reason=wp[2],
                    has_evidence=random.choice([True, True, False]),
                    notes=f"Merma detectada en revisión mensual de {mo}/{yr}",
                    waste_date=date(yr, mo, day),
                ))
                lot_counter += 1

        db.commit()

        # Summary
        total_sales_rev = db.query(__import__('sqlalchemy').func.sum(Sale.total)).scalar() or 0
        print(f"\n✅ ¡Seed completado exitosamente!")
        print("=" * 55)
        print(f"  Ventas totales : {sale_count} ({len(month_dates)} meses)")
        print(f"  Ingresos totales: ${total_sales_rev:,.2f}")
        print(f"  Mermas : {lot_counter - 1} registros")
        print("=" * 55)
        print("Credenciales:")
        print("  🏭 Almacenista : ALM001 / 123456")
        print("  🛒 Vendedor    : VEN001 / 123456")
        print("  📊 Ejecutivo   : EJE001 / 123456")
        print("=" * 55)

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error durante el seed: {e}")
        import traceback; traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
