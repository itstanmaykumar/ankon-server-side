const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors')
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const { query } = require("express");

const app = express();

// let em = 

app.use(cors());
app.use(express.json());
app.use(bodyParser.json())


const port = process.env.PORT || 5000

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o0zsr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('ankon');
        const paintingsCollection = database.collection('paintings');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

        // getting all paintings
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
        // getting all orders and filtering orders by current user email if email is paased
        app.get("/orders", async (req, res) => {
            let query = {};
            const email = req.query.email;
            if (email) {
                query = { email: email };
            }
            const cursor = ordersCollection.find(query);
            const myOrders = await cursor.toArray();
            res.send(myOrders);
        });
        // getting all reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
        // getting admin
        app.get("/users", async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.toArray(query);
            res.send(user);
        });


        // placing new orders
        app.post("/orders", async (req, res) => {
            const myCart = req.body;
            const orders = await ordersCollection.insertOne(myCart);
            res.json(orders);
        });
        // adding new review
        app.post("/reviews", async (req, res) => {
            const currentReview = req.body;
            const review = await reviewsCollection.insertOne(currentReview);
            res.json(review);
        });
        // adding new user
        app.post("/users", async (req, res) => {
            const currentUser = req.body;
            const newUser = await usersCollection.insertOne(currentUser);
            res.json(newUser);
        });

        // deleting single order from database
        app.delete('/orders/:orderId', async (req, res) => {
            const id = req.params.orderId;
            const query = { _id: ObjectId(id) };
            const deleteOrder = await ordersCollection.deleteOne(query);
            res.send(deleteOrder)
        });

        // setting admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: true } };
            const newAdmin = await usersCollection.updateOne(filter, updateDoc);
            res.json(newAdmin);
        })
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