#!/usr/bin/env python3
import bcrypt

password = "admin123"
# Generate a proper BCrypt hash
salt = bcrypt.gensalt(rounds=10)
hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
print(f"Password: {password}")
print(f"BCrypt hash: {hashed.decode('utf-8')}")
print()
print("SQL to update admin:")
print(f"UPDATE admins SET password = '{hashed.decode('utf-8')}' WHERE username = 'admin';")
