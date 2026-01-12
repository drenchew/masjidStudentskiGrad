import bcrypt

password = "admin123"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(f"BCrypt hash for '{password}':")
print(hashed.decode('utf-8'))
