"""Smoke test for avantis-trader-sdk installation."""

import asyncio

from avantis_trader_sdk import TraderClient, __version__


async def main() -> None:
    print(f"avantis-trader-sdk {__version__}")

    client = TraderClient("https://mainnet.base.org")
    pairs = await client.pairs_cache.get_pairs_info()
    print(f"Pairs loaded: {len(pairs)}")


if __name__ == "__main__":
    asyncio.run(main())
