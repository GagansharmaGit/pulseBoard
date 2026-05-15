import Redis from 'ioredis';

const url = 'redis://default:gQAAAAAAAelUAAIgcDI1YTY3YTJlYWYxYjA0YTQ2ODU2ZTc4MDliMGJhMmJjZg@prime-rodent-125268.upstash.io:6379';

console.log('Connecting to Redis with TLS...');
const redis = new Redis(url, {
  tls: {},
  maxRetriesPerRequest: 1
});

redis.on('connect', () => console.log('✅ Connected'));
redis.on('ready', () => {
    console.log('🚀 Ready');
    redis.set('test', 'success').then(() => {
        console.log('📝 Set test key');
        return redis.get('test');
    }).then((val) => {
        console.log('📖 Read test key:', val);
        process.exit(0);
    }).catch(err => {
        console.error('❌ Operation failed:', err);
        process.exit(1);
    });
});

redis.on('error', (err) => {
    console.error('❌ Redis error:', err);
});

redis.on('close', () => {
    console.log('🔌 Closed');
});
