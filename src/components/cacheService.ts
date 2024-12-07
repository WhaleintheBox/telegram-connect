import React from 'react';  // Ajout de l'import React explicite
const { useState, useCallback, useEffect } = React;  // Utilisation de la déstructuration depuis React

interface CacheMetadata {
    chunks: number;
    lastUpdated: string;
    version: string;
}

interface TokenData {
    symbol: string;
    amount: string;
    address: string | null;
}

interface Bet {
    participant: string;
    prediction: boolean;
    amount: string;
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
const METADATA_KEY = `${CACHE_KEY}_meta`;
const CHUNK_SIZE = 100 * 1024;
const MAX_CACHE_ITEMS = 50;
const CACHE_VERSION = '1.0';

export const enhancedStorageHandler = {
    async compress(data: Box): Promise<Box> {
        try {
            const { 
                imageData,
                recentActivity, 
                bets,
                ...essentialData 
            } = data;

            const compressedActivity = recentActivity?.slice(0, 3);
            const compressedBets = bets.slice(-5);

            const { 
                tournament,
                status,
                scheduled,
                home_team,
                away_team,
                home_score,
                away_score
            } = data.sportData;

            return {
                ...essentialData,
                bets: compressedBets,
                recentActivity: compressedActivity,
                sportData: {
                    tournament,
                    status,
                    scheduled,
                    home_team,
                    away_team,
                    home_score,
                    away_score
                }
            };
        } catch (error) {
            console.error('Error compressing box data:', error);
            return data;
        }
    },

    pruneCache(cache: { [key: string]: Box }): { [key: string]: Box } {
        try {
            const entries = Object.entries(cache);
            if (entries.length <= MAX_CACHE_ITEMS) return cache;

            const sortedEntries = entries
                .sort((a, b) => 
                    new Date(b[1].lastUpdated).getTime() - 
                    new Date(a[1].lastUpdated).getTime()
                )
                .slice(0, MAX_CACHE_ITEMS);

            return Object.fromEntries(sortedEntries);
        } catch (error) {
            console.error('Error pruning cache:', error);
            return cache;
        }
    },

    async saveToStorage(cache: { [key: string]: Box }) {
        try {
            this.clearPreviousCache();
            
            const prunedCache = this.pruneCache(cache);
            const compressedBoxes = await Promise.all(
                Object.entries(prunedCache).map(async ([key, box]) => {
                    const compressed = await this.compress(box);
                    return [key, compressed];
                })
            );

            const compressedCache = Object.fromEntries(compressedBoxes);
            const dataStr = JSON.stringify(compressedCache);

            if (dataStr.length > CHUNK_SIZE) {
                const chunks = Math.ceil(dataStr.length / CHUNK_SIZE);
                const metadata = {
                    chunks,
                    lastUpdated: new Date().toISOString(),
                    version: CACHE_VERSION
                };

                localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));

                for (let i = 0; i < chunks; i++) {
                    const chunk = dataStr.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
                    const chunkKey = `${CACHE_KEY}_${i}`;
                    try {
                        localStorage.setItem(chunkKey, chunk);
                    } catch (e) {
                        console.warn(`Failed to save chunk ${i}`, e);
                        this.handleStorageError();
                        break;
                    }
                }
            } else {
                localStorage.setItem(CACHE_KEY, dataStr);
            }
        } catch (error) {
            console.error('Cache storage error:', error);
            this.handleStorageError();
        }
    },

    clearPreviousCache() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(CACHE_KEY)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    },

    handleStorageError() {
        try {
            localStorage.clear();
            localStorage.setItem(CACHE_KEY, JSON.stringify({}));
            localStorage.setItem(METADATA_KEY, JSON.stringify({
                chunks: 0,
                lastUpdated: new Date().toISOString(),
                version: CACHE_VERSION
            }));
        } catch (e) {
            console.error('Failed to recover storage:', e);
        }
    },

    loadFromStorage(): { [key: string]: Box } {
        try {
            const metadataStr = localStorage.getItem(METADATA_KEY);
            if (metadataStr) {
                const metadata: CacheMetadata = JSON.parse(metadataStr);
                if (metadata.version !== CACHE_VERSION) {
                    this.clearPreviousCache();
                    return {};
                }

                let dataStr = '';
                for (let i = 0; i < metadata.chunks; i++) {
                    const chunk = localStorage.getItem(`${CACHE_KEY}_${i}`);
                    if (!chunk) {
                        console.warn(`Missing chunk ${i}, cache may be corrupted`);
                        this.clearPreviousCache();
                        return {};
                    }
                    dataStr += chunk;
                }
                
                return JSON.parse(dataStr);
            }

            const data = localStorage.getItem(CACHE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Cache loading error:', error);
            this.handleStorageError();
            return {};
        }
    }
};

export function useCache() {
    const [state, setState] = useState<{ [key: string]: Box }>({});
    const [updatedBoxes, setUpdatedBoxes] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Utilisation de useEffect pour l'initialisation
    useEffect(() => {
        const initializeCache = () => {
            try {
                const cachedData = enhancedStorageHandler.loadFromStorage();
                setState(cachedData);
            } catch (error) {
                console.error('Error loading initial cache:', error);
                setState({});
            } finally {
                setIsLoading(false);
            }
        };

        initializeCache();
    }, []);

    const updateCache = useCallback(async (newData: { [key: string]: Box }) => {
        try {
            setState(newData);
            await enhancedStorageHandler.saveToStorage(newData);
        } catch (error) {
            console.error('Error updating cache:', error);
        }
    }, []);

    return {
        cacheData: state,
        updateCache,
        updatedBoxes,
        setUpdatedBoxes,
        isLoading
    };
}