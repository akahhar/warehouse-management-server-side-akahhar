const express = require("express");

const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//use middleware
app.use(cors());
app.use(express.json());

// DB_USER=geniusUser
// DB_PASS=eJIqqo7CFJm00v7o

const uri = `mongodb+srv://geniusUser:eJIqqo7CFJm00v7o@cluster0.tyesc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const servicesCollection = client.db("geniusCar").collection("services");
    //get data
    app.get("/service", async (req, res) => {
      const query = {}; //get all information
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    //get single user by id
    app.get('/service/:id', async (req,res) => {
        const id = req.params.id;
        const query = {_id : ObjectId(id)};
        const result = await servicesCollection.findOne(query);
        res.send(result);
    })

    //post data
    app.post('/service' , async (req,res) => {
        const newServices = req.body;
        const result = await servicesCollection.insertOne(newServices);
        res.send(result)
    })
    //delete a user
    app.delete('/service/:id', async (req,res) => {
        const id = req.params.id;
        const query = {_id : ObjectId(id)};
        const result = await servicesCollection.deleteOne(query);
        res.send(result);
    })

    //update data by id
    app.put('/service/:id', async (req,res) => {
        const id = req.params.id;
        const updateUser = req.body;
        const filter = {_id : ObjectId(id)};
        const options = { upsert: true };
        const updateDoc = {
            $set: {
                name : updateUser.name,
                price : updateUser.price,
                description : updateUser.description,
                img : updateUser.img
            }
        }
        const result = await servicesCollection.updateOne(filter, updateDoc, options);
        res.send(result);
    })
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

//
app.get("/", (req, res) => {
  res.send("Running my genius car services port:" + port);
});
app.listen(port, () => {
  console.log("Genius Car Server Is Running, Port " + port);
});
