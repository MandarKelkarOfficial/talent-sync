import asyncio

from app.services import verification


async def _run_smoke():
    # example.com is stable and small; we don't expect it to verify but the
    # function should run without raising and return the expected dict shape.
    res = await verification.verify_verification_page("https://example.com", expected_username="John Doe")
    print("smoke result:", res)


if __name__ == "__main__":
    asyncio.run(_run_smoke())
