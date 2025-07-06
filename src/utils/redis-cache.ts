// Redis-like cache service for frontend data caching
// This provides Redis-like functionality using browser storage and memory cache

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class RedisCacheService {
  private static instance: RedisCacheService;
  private memoryCache: Map<string, CacheItem<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default
  private readonly MAX_MEMORY_ITEMS = 100; // Max items in memory cache

  static getInstance(): RedisCacheService {
    if (!RedisCacheService.instance) {
      RedisCacheService.instance = new RedisCacheService();
    }
    return RedisCacheService.instance;
  }

  // Set a key-value pair with optional TTL
  async set<T>(key: string, value: T, ttl: number = this.DEFAULT_TTL): Promise<void> {
    const item: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl
    };

    // Store in memory cache
    this.memoryCache.set(key, item);

    // Also store in localStorage for persistence
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to store in localStorage:', error);
    }

    // Clean up old items if we exceed memory limit
    if (this.memoryCache.size > this.MAX_MEMORY_ITEMS) {
      this.cleanup();
    }
  }

  // Get a value by key
  async get<T>(key: string): Promise<T | null> {
    // First check memory cache
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && !this.isExpired(memoryItem)) {
      return memoryItem.data;
    }

    // If not in memory, check localStorage
    try {
      const storedItem = localStorage.getItem(key);
      if (storedItem) {
        const item: CacheItem<T> = JSON.parse(storedItem);
        if (!this.isExpired(item)) {
          // Add back to memory cache
          this.memoryCache.set(key, item);
          return item.data;
        } else {
          // Remove expired item
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve from localStorage:', error);
    }

    return null;
  }

  // Delete a key
  async del(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  // Check if a key exists
  async exists(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  // Set expiration for a key
  async expire(key: string, ttl: number): Promise<boolean> {
    const item = this.memoryCache.get(key);
    if (item) {
      item.ttl = ttl;
      item.timestamp = Date.now();
      return true;
    }
    return false;
  }

  // Get TTL for a key
  async ttl(key: string): Promise<number> {
    const item = this.memoryCache.get(key);
    if (item) {
      const remaining = item.ttl - (Date.now() - item.timestamp);
      return Math.max(0, remaining);
    }
    return -1; // Key doesn't exist
  }

  // Clear all cache
  async flushall(): Promise<void> {
    this.memoryCache.clear();
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  // Get cache statistics
  async info(): Promise<{
    memorySize: number;
    localStorageSize: number;
    totalKeys: number;
  }> {
    let localStorageSize = 0;
    try {
      localStorageSize = localStorage.length;
    } catch (error) {
      console.warn('Failed to get localStorage size:', error);
    }

    return {
      memorySize: this.memoryCache.size,
      localStorageSize,
      totalKeys: this.memoryCache.size
    };
  }

  // Clean up expired items
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.memoryCache.entries()) {
      if (this.isExpired(item)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.memoryCache.delete(key);
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Failed to remove expired item from localStorage:', error);
      }
    });
  }

  // Check if an item is expired
  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  // Generate cache key for GraphQL queries
  generateQueryKey(query: string, variables: any = {}): string {
    const queryHash = this.hashString(query);
    const variablesHash = this.hashString(JSON.stringify(variables));
    return `gql:${queryHash}:${variablesHash}`;
  }

  // Simple string hashing function
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

export const redisCache = RedisCacheService.getInstance();

// Cache decorator for functions
export function withCache<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl: number = 5 * 60 * 1000
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = keyGenerator(...args);
    
    // Try to get from cache first
    const cached = await redisCache.get(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, execute function and cache result
    const result = await fn(...args);
    await redisCache.set(key, result, ttl);
    
    return result;
  }) as T;
}

// Cache middleware for Apollo Client
export const cacheMiddleware = {
  request: async (operation: any, forward: any) => {
    const { operationName, query, variables } = operation;
    
    // Only cache queries, not mutations
    if (operationName === 'query' || query.definitions[0].operation === 'query') {
      const cacheKey = redisCache.generateQueryKey(query.loc?.source.body || query, variables);
      const cached = await redisCache.get(cacheKey);
      
      if (cached) {
        // Return cached data
        return {
          data: cached,
          loading: false,
          networkStatus: 7, // Apollo's "ready" status
        };
      }
    }
    
    return forward(operation);
  },
  
  response: async (operation: any, forward: any) => {
    const response = await forward(operation);
    const { operationName, query, variables } = operation;
    
    // Cache successful query responses
    if (operationName === 'query' || query.definitions[0].operation === 'query') {
      if (response.data && !response.error) {
        const cacheKey = redisCache.generateQueryKey(query.loc?.source.body || query, variables);
        await redisCache.set(cacheKey, response.data, 5 * 60 * 1000); // 5 minutes
      }
    }
    
    return response;
  }
}; 