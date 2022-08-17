const express = require("express");
const {
    MongoClient
} = require("mongodb");

const dotenv = require('dotenv')
dotenv.config({
    path: './config.env'
});

const bcrypt = require('bcryptjs')

const app = express();
app.use(
    express.urlencoded({
        extended: true,
    })
); // for parsing application/x-www-form-urlencoded forms that we receive in post requests

// Connection URI
const uri = process.env.URI;
// Create a new MongoClient
const client = new MongoClient(uri);


const dbName = process.env.DBNAME;
const collectionName = process.env.COLLECTIONNAME
// const filePath = "./data.txt";

app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/signup.html");
});

app.post("/signup", (req, res) => {
    const newUser = {
        _id: req.body.userName,
        email: req.body.email,
        password: req.body.password
    }

    async function run() {
        try {

            // Connect the client to the server (optional starting in v4.7)
            await client.connect();
            // Establish and verify connection
            await client.db(dbName).command({
                ping: 1,
            });
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            let result;
            //check already registered
            if (!await collection.findOne({
                    email: newUser.email
                })) {
                //check user ID
                if (!await collection.findOne({
                        _id: newUser._id
                    })) {
                        newUser.password=bcrypt.hashSync(newUser.password, 10);
                        result = await collection.insertOne(newUser);
                        res.write('<h1>Successfully Registered.</h1>')
                } else
                    throw 'User ID is already Taken'
            } else
                throw 'Email is already registered'
        } catch (e) {
            res.write('<h1>' + e + '</h1>')
        } finally {
            // Ensures that the client will close when you finish/error
            await client.close();
            res.send();
        }
    }
    run().catch(console.dir);
});

app.listen(2000, () => console.log("Server is listening at port 2000"));