import random

def generate_otp():
    return f"{random.randint(000000, 999999):06d}"