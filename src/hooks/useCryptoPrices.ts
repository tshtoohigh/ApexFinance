import { useState, useEffect } from 'react';

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';
const COIN_IDS = 'bitcoin,ethereum,solana,cardano,polkadot,chainlink,avalanche-2,polygon-ecosystem-token';

/**
 * Fetches live crypto prices from CoinGecko (free, no API key needed).
 * Refreshes every 60 seconds.
 */
export function useCryptoPrices() {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      const res = await fetch(
        `${COINGECKO_URL}?ids=${COIN_IDS}&vs_currencies=usd&include_24hr_change=true`
      );
      if (!res.ok) throw new Error('Failed to fetch prices');
      const data = await res.json();

      const mapped: Record<string, CryptoPrice> = {};
      const symbolMap: Record<string, { symbol: string; name: string }> = {
        bitcoin: { symbol: 'BTC', name: 'Bitcoin' },
        ethereum: { symbol: 'ETH', name: 'Ethereum' },
        solana: { symbol: 'SOL', name: 'Solana' },
        cardano: { symbol: 'ADA', name: 'Cardano' },
        polkadot: { symbol: 'DOT', name: 'Polkadot' },
        chainlink: { symbol: 'LINK', name: 'Chainlink' },
        'avalanche-2': { symbol: 'AVAX', name: 'Avalanche' },
        'polygon-ecosystem-token': { symbol: 'POL', name: 'Polygon' },
      };

      for (const [id, info] of Object.entries(symbolMap)) {
        if (data[id]) {
          mapped[info.symbol] = {
            id,
            symbol: info.symbol,
            name: info.name,
            price: data[id].usd,
            change24h: data[id].usd_24h_change ?? 0,
          };
        }
      }

      setPrices(mapped);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60_000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  return { prices, loading, error, refetch: fetchPrices };
}
