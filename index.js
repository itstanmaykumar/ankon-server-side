const express = require("express");
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o0zsr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('ankon');
        const paintingsCollection = database.collection('paintings');

        // getting all paintings gallery
        app.get('/paintings', async (req, res) => {
            const cursor = paintingsCollection.find({});
            const paintings = await cursor.toArray();
            res.send(paintings);
        });
        // getting single painting by id
        app.get("/paintings/:paintingId", async (req, res) => {
            const id = req.params.paintingId;
            const query = { _id: ObjectId(id) };
            const singlePainting = await paintingsCollection.findOne(query);
            res.send(singlePainting);
        });

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello ankon!!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})