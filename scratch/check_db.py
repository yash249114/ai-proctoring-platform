from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def g():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['ai_proctoring']
    albus = await db.albus.find_one({'email': 'yaswanthrajmouli@albus.ai'})
    print(f"User: {albus}")
    if albus:
        from passlib.context import CryptContext
        pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
        is_match = pwd.verify("Yash@albus20", albus['hashed_password'])
        print(f"Password 'Yash@albus20' matches: {is_match}")
    client.close()

if __name__ == "__main__":
    asyncio.run(g())
