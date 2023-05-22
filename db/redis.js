const redis = require('redis');

console.log("Creating Redis client...");
// import { createClient } from 'redis';

const client = redis.createClient();

(async () => {
    await client.connect();
})();
// client.subscribe('notifications.create');
client.on('error', err => console.log('Redis Client Error', err));
client.on('ready', ()=> console.log('Connected'));

// (async () => {
//     await client.set("pika", "Flavio")
//     // await client.set("age", 37)
//
// })();

// (async () => {
//     const value = await client.get("name")
//     console.log(value)
// })();

async function incrVisits(key) {
    const currVisits = await client.get(key) || 0;
    console.log(currVisits)
    await client.set(key, parseInt(currVisits) + 1);
    return parseInt(currVisits) + 1;
}

async function getVisits(key) {
    const currVisits = await client.get(key) || 0;
    console.log(currVisits)
}


// function incrementAdVisits(adId) {
//     if (client.connected) {
//         client.incr(adId, function(err, reply) {
//             if (err) {
//                 console.error('Redis incrementAdVisits error: ', err);
//             } else {
//                 console.log('Number of visits for adId ', adId, ': ', reply);
//             }
//         });
//     } else {
//         console.error('Redis client is not connected');
//     }
// };
//
// /**
//  * Fetches the number of visits for a given adId
//  * @param {string} adId - The ID of the ad
//  * @return {Promise<number>} - The number of visits
//  */
// const getAdVisits = (adId) => {
//     return new Promise((resolve, reject) => {
//         if (client.connected) {
//             client.get(adId, function(err, reply) {
//                 if (err) {
//                     reject('Redis getAdVisits error: ', err);
//                 } else {
//                     resolve(reply);
//                 }
//             });
//         } else {
//             reject('Redis client is not connected');
//         }
//     });
// };
//
module.exports = { getVisits, incrVisits };
