const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri,  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const connect = async () => {
    console.log("conection")
    try {
        if (!client.topology || !client.topology.isConnected()) await client.connect();
    } catch (error) {
        console.error(`Failed to connect to MongoDB: ${error}`);
    }
    return client;
};

const disconnect = async () => {
    try {
        if(client.topology && client.topology.isConnected()) await client.close();
    } catch (error) {
        console.error(`Failed to disconnect from MongoDB: ${error}`);
    }
};

module.exports = { connect, disconnect };
