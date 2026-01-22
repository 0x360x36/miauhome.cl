from sqlalchemy import create_engine, text
import os

# Use the same URL as in database.py
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://miaudmin:miauword@localhost:5432/miauhomedata"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)

def run_migration():
    with engine.connect() as connection:
        # Transaction 1: Add is_admin to users
        try:
            print("Adding is_admin to users...")
            connection.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE"))
            connection.commit()
            print("Success.")
        except Exception as e:
            print(f"Skipping users update (might exist): {e}")

        # Transaction 2: Add stock to products
        try:
            print("Adding stock to products...")
            connection.execute(text("ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0"))
            connection.commit()
            print("Success.")
        except Exception as e:
            print(f"Skipping products update (might exist): {e}")

if __name__ == "__main__":
    run_migration()
