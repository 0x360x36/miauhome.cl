from sqlalchemy import create_engine, text
import os

# Use the same URL as in database.py
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://miaudmin:miauword@localhost:5439/miauhomedata"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)

def run_migration():
    # 1. Create tables if not exist
    with engine.connect() as connection:
        try:
            print("Creating product_images table...")
            connection.execute(text("""
                CREATE TABLE IF NOT EXISTS product_images (
                    id SERIAL PRIMARY KEY,
                    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                    url VARCHAR
                )
            """))
            connection.commit()
            print("Success.")
        except Exception as e:
            print(f"Error creating product_images: {e}")

        try:
            print("Creating product_variations table...")
            connection.execute(text("""
                CREATE TABLE IF NOT EXISTS product_variations (
                    id SERIAL PRIMARY KEY,
                    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                    name VARCHAR,
                    price INTEGER,
                    stock INTEGER DEFAULT 0
                )
            """))
            connection.commit()
            print("Success.")
        except Exception as e:
            print(f"Error creating product_variations: {e}")

        try:
            print("Creating user_payment_methods table...")
            connection.execute(text("""
                CREATE TABLE IF NOT EXISTS user_payment_methods (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    card_type VARCHAR,
                    last_four VARCHAR,
                    exp_month INTEGER,
                    exp_year INTEGER,
                    is_default BOOLEAN DEFAULT FALSE
                )
            """))
            connection.commit()
            print("Success.")
        except Exception as e:
            print(f"Error creating user_payment_methods: {e}")

    # 2. Add columns individually to avoid transaction aborts
    def add_column_if_not_exists(table, column, type_def):
        with engine.connect() as connection:
            try:
                print(f"Adding {column} to {table}...")
                connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {type_def}"))
                connection.commit()
                print("Success.")
            except Exception as e:
                # We expect "already exists" errors
                if "already exists" in str(e):
                    print(f"Column {column} already exists in {table}.")
                else:
                    print(f"Error adding {column} to {table}: {e}")

    # Columns for users
    add_column_if_not_exists("users", "first_name", "VARCHAR")
    add_column_if_not_exists("users", "last_name", "VARCHAR")
    add_column_if_not_exists("users", "cat_name", "VARCHAR")
    add_column_if_not_exists("users", "cat_breed", "VARCHAR")
    add_column_if_not_exists("users", "is_admin", "BOOLEAN DEFAULT FALSE")

    # Columns for products
    add_column_if_not_exists("products", "stock", "INTEGER DEFAULT 0")
    add_column_if_not_exists("products", "is_active", "BOOLEAN DEFAULT TRUE")

    # Columns for product_variations
    add_column_if_not_exists("product_variations", "variation_type", "VARCHAR")

    # Columns for cart_items
    add_column_if_not_exists("cart_items", "variation_id", "INTEGER REFERENCES product_variations(id)")

    # Columns for user_payment_methods
    add_column_if_not_exists("user_payment_methods", "tbk_user", "VARCHAR")
    add_column_if_not_exists("user_payment_methods", "username", "VARCHAR")

    # Columns for orders
    add_column_if_not_exists("orders", "tbk_token", "VARCHAR")
    add_column_if_not_exists("orders", "payment_type", "VARCHAR DEFAULT 'webpay_plus'")
    add_column_if_not_exists("orders", "guest_email", "VARCHAR")
    add_column_if_not_exists("orders", "guest_address", "VARCHAR")

if __name__ == "__main__":
    run_migration()
