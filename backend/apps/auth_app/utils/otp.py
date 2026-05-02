import random
import uuid


def generate_otp():
    return f"{random.randint(0, 999999):06d}"

def generate_id():
    return str(uuid.uuid4())