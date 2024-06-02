const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors({
  origin: [
    'http://localhost:5173'
  ],
  credentials: true,
}))
app.use(express.json())

// mongodb

const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASS}@cluster0.uoehazd.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const users = client.db("Doc-House").collection("Users");
    const doctors = client.db("Doc-House").collection("Doctors");
    const feedbacks = client.db("Doc-House").collection("Feedbacks");


    // user
    app.get('/users', async (req, res) => {
      const user = await users.find().toArray()
      res.send(user)
    })
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const user = await users.findOne(query)
      res.send(user)
    })
    app.post('/users', async (req, res) => {
      const body = req.body
      const result = await users.insertOne(body)
      res.send(result)
    })
    app.patch('/requestRole/:email', async (req, res) => {
      const email = req.params.email
      const query = {email: email}
      const body = req.body
      const updatedDoc = {
        $set: {
          status: body.status,
        }
      }
      const result = await users.updateOne(query, updatedDoc)
      res.send(result)
    })
    app.patch('/updateRole/:email', async (req, res) => {
      const email = req.params.email
      const query = {email: email}
      const body = req.body
      const updatedDoc = {
        $set: {
          role: body.role,
          status: body.status,
        }
      }
      const result = await users.updateOne(query, updatedDoc)
      res.send(result)
    })

    // doctors
    app.get('/doctors', async (req, res) => {
      const doctor = await doctors.find().toArray()
      res.send(doctor)
    })
    app.get('/doctor/:id', async (req, res) => {
      try {
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const doctor = await doctors.findOne(query)
        res.send(doctor)
      }catch(err){
        console.log(object);
      }
    })
    app.post('/doctors', async (req, res) => {
      const doctor = req.body
      const result = await doctors.insertOne(doctor)
      res.send(result)
    })

    // feedback
    app.get('/feedback', async (req, res) => {
      const feedback = await feedbacks.find().toArray()
      res.send(feedback)
    })
    app.post('/feedback', async (req, res) => {
      const feedback = req.body
      const result = await feedbacks.insertOne(feedback)
      res.send(result)
    })




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// express
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})