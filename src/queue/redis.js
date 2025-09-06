// import { createClient } from 'redis';
// import { logger } from '../utils/logger.js';

// class RedisConnection {
//   constructor() {
//     this.client = null;
//     this.isConnected = false;
//     this.reconnectAttempts = 0;
//     this.maxReconnectAttempts = 5;
//     this.reconnectDelay = 1000;
//   }

//   async connect() {
//     try {
//       if (this.client && this.isConnected) {
//         return this.client;
//       }

//       this.client = createClient({
//         url: process.env.REDIS_URL,
//         retry_strategy: (options) => {
//           if (options.error && options.error.code === 'ECONNREFUSED') {
//             logger.error('Redis server refused connection');
//             return new Error('Redis server refused connection');
//           }
          
//           if (options.total_retry_time > 1000 * 60 * 60) {
//             logger.error('Retry time exhausted');
//             return new Error('Retry time exhausted');
//           }
          
//           if (options.attempt > this.maxReconnectAttempts) {
//             logger.error('Max reconnect attempts reached');
//             return new Error('Max reconnect attempts reached');
//           }
          
//           return Math.min(options.attempt * 100, 3000);
//         }
//       });

//       this.client.on('error', (err) => {
//         logger.error('Redis Client Error:', err);
//         this.isConnected = false;
//       });

//       this.client.on('connect', () => {
//         logger.info('Redis client connected');
//         this.isConnected = true;
//         this.reconnectAttempts = 0;
//       });

//       this.client.on('ready', () => {
//         logger.info('Redis client ready');
//         this.isConnected = true;
//       });

//       this.client.on('end', () => {
//         logger.info('Redis client disconnected');
//         this.isConnected = false;
//       });

//       this.client.on('reconnecting', () => {
//         this.reconnectAttempts++;
//         logger.info(`Redis client reconnecting... Attempt ${this.reconnectAttempts}`);
//       });

//       await this.client.connect();
//       return this.client;
      
//     } catch (error) {
//       logger.error('Failed to connect to Redis:', error);
//       this.isConnected = false;
//       throw error;
//     }
//   }

//   async disconnect() {
//     if (this.client && this.isConnected) {
//       await this.client.quit();
//       this.isConnected = false;
//       logger.info('Redis connection closed');
//     }
//   }

//   getClient() {
//     if (!this.isConnected || !this.client) {
//       throw new Error('Redis client is not connected');
//     }
//     return this.client;
//   }

//   async ping() {
//     try {
//       if (!this.isConnected) {
//         await this.connect();
//       }
//       return await this.client.ping();
//     } catch (error) {
//       logger.error('Redis ping failed:', error);
//       return false;
//     }
//   }

//   async set(key, value, options = {}) {
//     const client = this.getClient();
//     const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
    
//     if (options.ex) {
//       return await client.setEx(key, options.ex, serializedValue);
//     }
//     return await client.set(key, serializedValue);
//   }

//   async get(key, parseJson = true) {
//     const client = this.getClient();
//     const value = await client.get(key);
    
//     if (!value) return null;
    
//     if (parseJson) {
//       try {
//         return JSON.parse(value);
//       } catch {
//         return value;
//       }
//     }
//     return value;
//   }

//   async del(key) {
//     const client = this.getClient();
//     return await client.del(key);
//   }

//   async exists(key) {
//     const client = this.getClient();
//     return await client.exists(key);
//   }

//   async expire(key, seconds) {
//     const client = this.getClient();
//     return await client.expire(key, seconds);
//   }
// }

// const redisConnection = new RedisConnection();

// if (process.env.NODE_ENV !== 'test') {
//   redisConnection.connect().catch((err) => {
//     logger.error('Failed to connect to Redis on startup:', err);
//   });
// }

// process.on('SIGINT', async () => {
//   await redisConnection.disconnect();
// });

// process.on('SIGTERM', async () => {
//   await redisConnection.disconnect();
// });

// export default redisConnection;