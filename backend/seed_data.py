"""
AgroStack - Seed Data Script
=============================
Run this script independently to populate the database with demo data.

Usage:
    cd backend
    python seed_data.py

This will create:
  - 3 demo users (one per role)
  - 5 providers
  - 12 products
  - 8 inventory items with varied expiry dates
  - 3 sample sales with items
"""

import sys
import os
from datetime import date, timedelta

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


def seed():
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if data already exists
        if db.query(User).first():
            print("⚠️  La base de datos ya contiene datos. Limpiando...")
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
            User(
                employee_id="ALM001",
                name="Carlos Mendoza",
                email="carlos@agrostack.com",
                password_hash=hash_password("123456"),
                role="warehouse",
            ),
            User(
                employee_id="VEN001",
                name="María García",
                email="maria@agrostack.com",
                password_hash=hash_password("123456"),
                role="sales",
            ),
            User(
                employee_id="EJE001",
                name="Roberto López",
                email="roberto@agrostack.com",
                password_hash=hash_password("123456"),
                role="executive",
            ),
        ]
        db.add_all(users)
        db.flush()

        # ========================
        # PROVIDERS
        # ========================
        print("🏢 Creando proveedores...")
        providers = [
            Provider(
                name="AgroNutrientes SA",
                contact="Juan Pérez",
                email="ventas@agronutrientes.com",
                phone="+52 33 1234 5678",
                address="Av. Revolución 456, Guadalajara, JAL",
                category="Fertilizantes",
                rating=4.8,
                status="active",
            ),
            Provider(
                name="SemiPro México",
                contact="Ana Rodríguez",
                email="contacto@semipro.mx",
                phone="+52 55 9876 5432",
                address="Calle Industrial 789, CDMX",
                category="Semillas",
                rating=4.5,
                status="active",
            ),
            Provider(
                name="ProteCampo",
                contact="Luis Martínez",
                email="info@protecampo.com",
                phone="+52 81 5555 1234",
                address="Blvd. Agrícola 321, Monterrey, NL",
                category="Pesticidas",
                rating=4.2,
                status="active",
            ),
            Provider(
                name="HerbiMax",
                contact="Patricia Sánchez",
                email="ventas@herbimax.com",
                phone="+52 33 7777 8888",
                address="Carr. Chapala km 12, Guadalajara, JAL",
                category="Herbicidas",
                rating=4.6,
                status="active",
            ),
            Provider(
                name="BioAgro Solutions",
                contact="Fernando Torres",
                email="fernando@bioagro.com",
                phone="+52 55 4444 3333",
                address="Parque Industrial Norte 100, Querétaro, QRO",
                category="Fertilizantes",
                rating=4.9,
                status="active",
            ),
        ]
        db.add_all(providers)
        db.flush()

        # ========================
        # PRODUCTS (catalog)
        # ========================
        print("📦 Creando productos...")
        products = [
            Product(name="Fertilizante Orgánico Premium", category="Fertilizantes", stock=150, price=285.00, unit="kg", image_emoji="🌿", status="available"),
            Product(name="Urea Granulada 46-0-0", category="Fertilizantes", stock=200, price=340.00, unit="kg", image_emoji="⚗️", status="available"),
            Product(name="Semilla de Maíz Híbrido", category="Semillas", stock=80, price=520.00, unit="bolsa", image_emoji="🌽", status="available"),
            Product(name="Semilla de Frijol Negro", category="Semillas", stock=45, price=180.00, unit="kg", image_emoji="🫘", status="available"),
            Product(name="Insecticida Cipermetrina", category="Pesticidas", stock=30, price=450.00, unit="L", image_emoji="🧪", status="available"),
            Product(name="Herbicida Glifosato", category="Herbicidas", stock=60, price=380.00, unit="L", image_emoji="🧫", status="available"),
            Product(name="NPK 20-20-20 Soluble", category="Fertilizantes", stock=12, price=290.00, unit="kg", image_emoji="💎", status="low"),
            Product(name="Semilla de Trigo", category="Semillas", stock=100, price=250.00, unit="kg", image_emoji="🌾", status="available"),
            Product(name="Fungicida Cúprico", category="Pesticidas", stock=18, price=620.00, unit="L", image_emoji="🔬", status="low"),
            Product(name="Bioestimulante Radical", category="Otros", stock=0, price=750.00, unit="L", image_emoji="🌱", status="out"),
            Product(name="Sulfato de Amonio", category="Fertilizantes", stock=300, price=195.00, unit="kg", image_emoji="🧂", status="available"),
            Product(name="Semilla de Chile Habanero", category="Semillas", stock=25, price=420.00, unit="bolsa", image_emoji="🌶️", status="available"),
        ]
        db.add_all(products)
        db.flush()

        # ========================
        # INVENTORY ITEMS
        # ========================
        print("📋 Creando inventario...")
        today = date.today()
        inventory_items = [
            InventoryItem(
                product_name="Fertilizante Orgánico Premium",
                category="Fertilizantes",
                quantity=50,
                unit="kg",
                lot_number="LOT-2026-001",
                expiry_date=today + timedelta(days=10),  # Critical
                location="Pasillo A-1",
                provider="AgroNutrientes SA",
                provider_id=providers[0].id,
                receipt_date=today - timedelta(days=30),
                status="active",
            ),
            InventoryItem(
                product_name="Semilla de Maíz Híbrido",
                category="Semillas",
                quantity=30,
                unit="bolsa",
                lot_number="LOT-2026-002",
                expiry_date=today + timedelta(days=25),  # Warning
                location="Pasillo B-2",
                provider="SemiPro México",
                provider_id=providers[1].id,
                receipt_date=today - timedelta(days=15),
                status="active",
            ),
            InventoryItem(
                product_name="Insecticida Cipermetrina",
                category="Pesticidas",
                quantity=15,
                unit="L",
                lot_number="LOT-2026-003",
                expiry_date=today + timedelta(days=90),  # Healthy
                location="Pasillo C-1",
                provider="ProteCampo",
                provider_id=providers[2].id,
                receipt_date=today - timedelta(days=5),
                status="active",
            ),
            InventoryItem(
                product_name="Urea Granulada 46-0-0",
                category="Fertilizantes",
                quantity=100,
                unit="kg",
                lot_number="LOT-2026-004",
                expiry_date=today + timedelta(days=180),  # Healthy
                location="Pasillo A-2",
                provider="BioAgro Solutions",
                provider_id=providers[4].id,
                receipt_date=today - timedelta(days=10),
                status="active",
            ),
            InventoryItem(
                product_name="Herbicida Glifosato",
                category="Herbicidas",
                quantity=20,
                unit="L",
                lot_number="LOT-2026-005",
                expiry_date=today - timedelta(days=5),  # EXPIRED
                location="Pasillo B-3",
                provider="HerbiMax",
                provider_id=providers[3].id,
                receipt_date=today - timedelta(days=60),
                status="active",
            ),
            InventoryItem(
                product_name="NPK 20-20-20 Soluble",
                category="Fertilizantes",
                quantity=12,
                unit="kg",
                lot_number="LOT-2026-006",
                expiry_date=today + timedelta(days=5),  # Critical
                location="Pasillo C-3",
                provider="AgroNutrientes SA",
                provider_id=providers[0].id,
                receipt_date=today - timedelta(days=45),
                status="active",
            ),
            InventoryItem(
                product_name="Semilla de Trigo",
                category="Semillas",
                quantity=80,
                unit="kg",
                lot_number="LOT-2026-007",
                expiry_date=today + timedelta(days=60),  # Healthy
                location="Pasillo A-3",
                provider="SemiPro México",
                provider_id=providers[1].id,
                receipt_date=today - timedelta(days=20),
                status="active",
            ),
            InventoryItem(
                product_name="Fungicida Cúprico",
                category="Pesticidas",
                quantity=18,
                unit="L",
                lot_number="LOT-2026-008",
                expiry_date=today + timedelta(days=20),  # Warning
                location="Pasillo B-1",
                provider="ProteCampo",
                provider_id=providers[2].id,
                receipt_date=today - timedelta(days=8),
                status="active",
            ),
        ]
        db.add_all(inventory_items)
        db.flush()

        # Record entry movements
        for item in inventory_items:
            movement = InventoryMovement(
                inventory_item_id=item.id,
                movement_type="entry",
                quantity=item.quantity,
                user_id=users[0].id,
                notes=f"Entrada inicial: {item.product_name}",
            )
            db.add(movement)

        # ========================
        # SAMPLE SALES
        # ========================
        print("💰 Creando ventas de ejemplo...")
        sale1 = Sale(
            user_id=users[1].id,
            customer_name="Rancho El Porvenir",
            subtotal=1850.00,
            tax=296.00,
            total=2146.00,
            status="completed",
        )
        db.add(sale1)
        db.flush()

        sale1_items = [
            SaleItem(sale_id=sale1.id, product_id=products[0].id, product_name="Fertilizante Orgánico Premium", quantity=5, unit_price=285.00, total_price=1425.00),
            SaleItem(sale_id=sale1.id, product_id=products[3].id, product_name="Semilla de Frijol Negro", quantity=2.36, unit_price=180.00, total_price=425.00),
        ]
        db.add_all(sale1_items)

        sale2 = Sale(
            user_id=users[1].id,
            customer_name="Cooperativa Agrícola del Valle",
            subtotal=3200.00,
            tax=512.00,
            total=3712.00,
            status="completed",
        )
        db.add(sale2)
        db.flush()

        sale2_items = [
            SaleItem(sale_id=sale2.id, product_id=products[2].id, product_name="Semilla de Maíz Híbrido", quantity=4, unit_price=520.00, total_price=2080.00),
            SaleItem(sale_id=sale2.id, product_id=products[4].id, product_name="Insecticida Cipermetrina", quantity=2.49, unit_price=450.00, total_price=1120.00),
        ]
        db.add_all(sale2_items)

        sale3 = Sale(
            user_id=users[1].id,
            customer_name="Agroindustrias del Norte",
            subtotal=5680.00,
            tax=908.80,
            total=6588.80,
            status="completed",
        )
        db.add(sale3)
        db.flush()

        sale3_items = [
            SaleItem(sale_id=sale3.id, product_id=products[1].id, product_name="Urea Granulada 46-0-0", quantity=10, unit_price=340.00, total_price=3400.00),
            SaleItem(sale_id=sale3.id, product_id=products[5].id, product_name="Herbicida Glifosato", quantity=6, unit_price=380.00, total_price=2280.00),
        ]
        db.add_all(sale3_items)

        # ========================
        # SAMPLE WASTE RECORDS
        # ========================
        print("⚠️  Creando registros de mermas...")
        waste1 = WasteRecord(
            lot_number="LOT-2025-OLD1",
            product_name="Fertilizante Vencido",
            quantity=5,
            unit="kg",
            reason="vencimiento",
            has_evidence=True,
            notes="Producto encontrado vencido en inspección rutinaria",
            waste_date=today - timedelta(days=7),
        )
        waste2 = WasteRecord(
            lot_number="LOT-2025-OLD2",
            product_name="Semilla Dañada",
            quantity=2,
            unit="bolsa",
            reason="humedad",
            has_evidence=True,
            notes="Daño por humedad en almacén sección B",
            waste_date=today - timedelta(days=3),
        )
        db.add_all([waste1, waste2])

        db.commit()
        print("\n✅ ¡Seed completado exitosamente!")
        print("=" * 50)
        print("Usuarios creados:")
        print("  🏭 Almacenista: ALM001 / 123456")
        print("  🛒 Vendedor:    VEN001 / 123456")
        print("  📊 Ejecutivo:   EJE001 / 123456")
        print("=" * 50)

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error durante el seed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
