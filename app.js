const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3u9wf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    
    const userCollection = client.db('tutor_lagbe').collection('users')
    const tutorialCollection = client.db('tutor_lagbe').collection('tutorials')

    app.get('/', (req, res) => {
        res.send('Servicer is running perfectly')
    })


    // User related APIs
    // Post users
    app.post('/users', (req, res) => {
        const user = req.body
        const result = userCollection.insertOne(user)
        res.send(result)
    })




    // Tutorial Related APIs
    // Post tutorial
    app.post('/tutorials', (req, res) => {
        const tutorial = req.body
        const result = tutorialCollection.insertOne(tutorial)
        res.send(result)
    })



    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})
