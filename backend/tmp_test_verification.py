import sys
import asyncio
sys.path.insert(0, 'backend')
from app.services.verification import verify_verification_page, verify_via_qr_or_link

async def run_tests():
    print('Running verify_verification_page against https://example.com')
    res = await verify_verification_page('https://example.com', 'Rutuja Patwari')
    print('Result:', res)

    print('\nRunning verify_via_qr_or_link with one example URL')
    res2 = await verify_via_qr_or_link(['https://example.com'], 'Sample extracted text', 'Rutuja Patwari')
    print('Result2:', res2)

if __name__ == '__main__':
    asyncio.run(run_tests())
