import sqlite3

# Создание/подключение к базе
conn = sqlite3.connect("database.db")
cursor = conn.cursor()

# Создание таблицы
cursor.execute("""
CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surname TEXT,
    name TEXT,
    patronymic TEXT,
    course TEXT,
    start_date TEXT,
    pay_method TEXT
)
""")

conn.commit()
conn.close()

print("База данных и таблица успешно созданы!")
