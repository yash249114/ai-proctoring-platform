from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def g():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['ai_proctoring'] # Check DATABASE_NAME in main.py
    co = await db.Company.find_one({'email': 'e2e_test@albus.ai'})
    if co:
        print(co['otp'])
    else:
        print("Not found")
    client.close()

if __name__ == "__main__":
    asyncio.run(g())
