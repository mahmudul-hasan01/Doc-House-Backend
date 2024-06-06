const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const stripe = require('stripe')(process.env.Stripe_Secret_key)
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
    const appointments = client.db("Doc-House").collection("Appointments");
    const reviews = client.db("Doc-House").collection("Reviews");


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
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const user = await users.findOne(query)
      const admin = user?.role === 'Admin'
      res.send({ admin })
    })
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await users.deleteOne(query)
      res.send(result)
    })
    app.patch('/requestRole/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
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
      const query = { email: email }
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
      } catch (err) {
        console.log(err);
      }
    })
    app.post('/doctors', async (req, res) => {
      const doctor = req.body
      const result = await doctors.insertOne(doctor)
      res.send(result)
    })
    app.delete('/doctor/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await doctors.deleteOne(query)
      res.send(result)
    })
    app.patch('/updateDoctor/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const body = req.body
      console.log(id, body);
      const updatedDoc = {
        $set: {
          name: body.name,
          specialty: body.specialty,
          education: body.education,
          startDate: body.startDate,
          endDate: body.endDate,
          availableDate: body.availableDate,
          availableTimeStart: body.availableTimeStart,
          availableTimeEnd: body.availableTimeEnd,
          price: body.price,
          rating: body.rating,
          about: body.about,
          image: body.image
        }
      }
      const result = await doctors.updateOne(query, updatedDoc)
      res.send(result)
    })

    // feedback
    app.get('/feedbacks', async (req, res) => {
      try {
        const feedback = await feedbacks.find().toArray()
        res.send(feedback)
      } catch (err) {
        console.log(err);
      }
    })
    app.get('/feedback', async (req, res) => {
      const doctorName = req.query.name
      console.log(doctorName);
      const query = { doctorName: doctorName }
      const feedback = await feedbacks.find(query).toArray()
      res.send(feedback)
    })
    app.post('/feedback', async (req, res) => {
      const feedback = req.body
      const result = await feedbacks.insertOne(feedback)
      res.send(result)
    })

    // review
    app.get('/reviews', async (req, res) => {
      try {
        const review = await reviews.find().toArray()
        res.send(review)
      } catch (err) {
        console.log(err);
      }
    })
    app.get('/review/:email', async (req, res) => {
      const email = req.params.email
      const query = {email: email}
      const result = await reviews.find(query).toArray()
      res.send(result)
    })
    app.post('/review', async (req, res) => {
      const review = req.body
      const result = await reviews.insertOne(review)
      res.send(result)
    })
    app.delete('/review/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await reviews.deleteOne(query)
      res.send(result)
    })

    // Stripe-Payment
    app.post('/payment-intent', async (req, res) => {
      const { price } = req.body
      const amount = parseInt(price * 100)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ['card']
      })
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    })
    // payment
    app.post('/payment', async (req, res) => {
      const payment = req.body
      const paymentResult = await appointments.insertOne(payment)
      res.send(paymentResult)
    })

    // get appointments
    app.get('/appointments', async (req, res) => {
      const result = await appointments.find().toArray()
      res.send(result)
    })
    app.get('/appointment/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const result = await appointments.find(query).toArray()
      res.send(result)
    })
    app.delete('/appointment/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id)}
      const result = await appointments.deleteOne(query)
      res.send(result)
    })

    // stats
    app.get('/admin-stats', async (req, res) => {
      const user = await users.estimatedDocumentCount()
      const doctor = await doctors.estimatedDocumentCount()
      const appointment = await appointments.estimatedDocumentCount()
      // this is not the best way
      // const payment = await payments.find().toArray()
      // const revenue = payment.reduce((total, item) => total + item.price , 0)
      // const result = await payments.aggregate([
      //   {
      //     $group: {
      //       _id: null,
      //       totalRevenue: {
      //         $sum: '$price'
      //       }
      //     }
      //   }
      // ]).toArray()
      // const revenue = result.length > 0 ? result[0].totalRevenue : 0

      res.send({
        user,
        doctor,
        appointment,
        // revenue
      })
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