require('events').defaultMaxListeners = 0;

const redis = require('redis')
const subscriber = redis.createClient()
const client = redis.createClient()
const colors = require('colors')
const difflet = require('difflet')

const inMem = {}

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

const main = async () => {
    await subscriber.connect()
    await client.connect()
    await subscriber.pSubscribe('__keyspace@0__*', async (message, channel) => {
        // console.log({ message, channel });
        const key = channel.slice(15, channel.length)
        const action = message

        // console.log({ key, action })

        const existing = inMem[key]
        console.log({inMem})
        // console.log({existing})
        await client.get(key).then((inRedis) => {
            inMem[key] = inRedis;
            let diff = difflet.compare(existing, inRedis)

            if(isJsonString(existing) && isJsonString(inRedis))
            {
                diff = difflet.compare(JSON.parse(existing), JSON.parse(inRedis))
            }

            if (existing) {
                console.log(colors.blue(`UPDATED ${key} (${action}): ${existing} => ${diff}`))
                
            }

            if (!existing && action === 'set') {
                console.log(colors.green(`CREATED ${key} (${action}): ${existing} => ${inRedis}`))
            }

            if (action === 'del') {
                console.log(colors.red(`DELETED ${key} (${action}): ${existing} => ${diff}`))
            }
        })


        /**
         * { message: 'set', channel: '__keyspace@0__:myKey' }
           { message: 'myKey', channel: '__keyevent@0__:set' }
         */
    });
}

main()



// await subscriber.pSubscribe('channe*', (message, channel) => {
//   console.log(message, channel); // 'message', 'channel'
// });