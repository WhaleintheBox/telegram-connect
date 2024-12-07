import { useState, useCallback } from 'react';  // Retirer useEffect car non utilisé

interface CacheMetadata {
    chunks: number;
    lastUpdated: string;
    version: string;
}

interface Bet {
    participant: string;
    prediction: boolean;
    amount: string;
}

interface TokenData {
    symbol: string;
    amount: string;
    address: string | null;
}

interface SportDataType {
    tournament?: string;
    status?: {
        long: string;
        short: string;
    };
    formattedStatus?: string;
    scheduled?: string;
    venue?: string;
    match_id?: string;
    home_team?: string;
    away_team?: string;
    home_score?: number;
    away_score?: number;
    scores?: {
        home?: { current: number; total: number };
        away?: { current: number; total: number };
    };
    recentActivity?: Array<{
        type: 'hunt' | 'fish';
        amount: number;
        timestamp: string;
    }>;
}

interface Box {
    address: string;
    chainId: number;
    sportId: string;
    bets: Bet[];
    isSettled: boolean;
    outcome?: boolean;
    totalAmount: string;
    tokenData: TokenData;
    lastUpdated: string;
    imageData?: string;
    initialEvents: Array<{who: string; prediction: string}>;
    timeRemaining?: number;
    isCancelled: boolean;
    metadata?: {
        createdAt: string;
        updatedAt: string;
        version: string;
    };
    sportData: SportDataType;
    recentActivity?: Array<{
        type: 'hunt' | 'fish';
        amount: number;
        timestamp: string;
    }>;
}


const CACHE_KEY = 'witbot_boxes_cache';
const CHUNK_SIZE = 512 * 1024; // 512KB chunks
const MAX_CACHE_ITEMS = 100;

export const enhancedStorageHandler = {
    async compress(data: Box) {
        const { imageData, recentActivity, ...essentialData } = data;
        return essentialData;
    },

    async compressBatch(boxes: { [key: string]: Box }) {
        const compressed: { [key: string]: Box } = {};
        for (const [key, value] of Object.entries(boxes)) {
            compressed[key] = await this.compress(value);
        }
        return compressed;
    },

    pruneCache(cache: { [key: string]: Box }) {
        const entries = Object.entries(cache);
        if (entries.length <= MAX_CACHE_ITEMS) return cache;

        const sortedEntries = entries
            .sort((a, b) => 
                new Date(b[1].lastUpdated).getTime() - 
                new Date(a[1].lastUpdated).getTime()
            );

        return Object.fromEntries(sortedEntries.slice(0, MAX_CACHE_ITEMS));
    },

    async saveToStorage(cache: { [key: string]: Box }) {
        try {
            const prunedCache = this.pruneCache(cache);
            const compressedData = await this.compressBatch(prunedCache);
            const dataStr = JSON.stringify(compressedData);

            this.clearPreviousCache();

            if (dataStr.length > CHUNK_SIZE) {
                const chunks = Math.ceil(dataStr.length / CHUNK_SIZE);
                const metadata: CacheMetadata = {
                    chunks,
                    lastUpdated: new Date().toISOString(),
                    version: '1.0'
                };

                localStorage.setItem(`${CACHE_KEY}_metadata`, JSON.stringify(metadata));

                for (let i = 0; i < chunks; i++) {
                    const chunk = dataStr.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
                    localStorage.setItem(`${CACHE_KEY}_${i}`, chunk);
                }
            } else {
                localStorage.setItem(CACHE_KEY, dataStr);
            }
        } catch (error) {
            console.warn('Cache storage error:', error);
            this.handleStorageError();
        }
    },

    clearPreviousCache() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(CACHE_KEY)) {
                localStorage.removeItem(key);
            }
        });
    },

    handleStorageError() {
        try {
            localStorage.clear();
            localStorage.setItem(CACHE_KEY, JSON.stringify({}));
        } catch (e) {
            console.error('Failed to recover storage:', e);
        }
    },

    loadFromStorage(): { [key: string]: Box } {
        try {
            const metadataStr = localStorage.getItem(`${CACHE_KEY}_metadata`);
            if (metadataStr) {
                const metadata: CacheMetadata = JSON.parse(metadataStr);
                let dataStr = '';
                
                for (let i = 0; i < metadata.chunks; i++) {
                    const chunk = localStorage.getItem(`${CACHE_KEY}_${i}`);
                    if (chunk) dataStr += chunk;
                }
                
                return JSON.parse(dataStr);
            }

            const data = localStorage.getItem(CACHE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.warn('Cache loading error:', error);
            return {};
        }
    }
};

export function useCache() {
    const [state, setState] = useState<{ [key: string]: Box }>(
        enhancedStorageHandler.loadFromStorage()
    );
    const [updatedBoxes, setUpdatedBoxes] = useState(new Set<string>());

    const updateCache = useCallback(async (newData: { [key: string]: Box }) => {
        setState(newData);
        await enhancedStorageHandler.saveToStorage(newData);
    }, []);

    return {
        cacheData: state,
        updateCache,
        updatedBoxes,
        setUpdatedBoxes
    };
}