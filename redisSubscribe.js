require('events').defaultMaxListeners = 0;

const redis = require('redis')
const subscriber = redis.createClient()
const client = redis.createClient()
const colors = require('colors')
const difflet = require('difflet')
const { Table } = require('console-table-printer');

const inMem = {}

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

const view = new Table();

const main = async () => {
    await subscriber.connect()
    await client.connect()
    await subscriber.pSubscribe('__keyspace@0__*', async (message, channel) => {
        const key = channel.slice(15, channel.length)
        const action = message
        let index = 0
        const previousValue = inMem[key]
        console.log({ inMem })
        await client.get(key).then((newValue) => {
            index += 1;
            let verb;
            let diff = difflet.compare(previousValue, newValue)
            inMem[key] = newValue;

            if (isJsonString(previousValue) && isJsonString(newValue)) {
                diff = difflet.compare(JSON.parse(previousValue), JSON.parse(newValue))
            }

            if (previousValue) { verb = "UPDATE"; color = "blue" }
            if (!previousValue && action === 'set') { verb = "CREATE"; color = "green" }
            if (action === 'del') { verb = "DELETE"; color = "red" }

            view.addRow({ key, action, previousValue, newValue, diff }, { color });
            view.printTable();
        })
    });
}

main()
