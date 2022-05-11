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

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tyesc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const itemsCollection = client.db("electro-house").collection("laptops");
    //get data
    app.get("/items", async (req, res) => {
      const query = {}; //get all information
      const cursor = itemsCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });

    //get single user by id
    app.get('/items/:id', async (req,res) => {
        const id = req.params.id;
        const query = {_id : ObjectId(id)};
        const result = await itemsCollection.findOne(query);
        res.send(result);
    })

    //post data
    app.post('/items' , async (req,res) => {
        const newServices = req.body;
        const result = await itemsCollection.insertOne(newServices);
        res.send(result)
    })
    //delete a user
    app.delete('/items/:id', async (req,res) => {
        const id = req.params.id;
        const query = {_id : ObjectId(id)};
        const result = await itemsCollection.deleteOne(query);
        res.send(result);
    })

    //update data by id
    app.put('/items/:id', async (req,res) => {
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
        const result = await itemsCollection.updateOne(filter, updateDoc, options);
        res.send(result);
    })
    // updateQuantity by id
    app.put('/updateQuantity/:id', async (req,res) => {
        const id = req.params.id;
        const updateQuantity = req.body;
   
        //get single ITEM by id
        const query = {_id : ObjectId(id)};
        const result2 = await itemsCollection.findOne(query);
        
        const filter = {_id : ObjectId(id)};
        const options = { upsert: true };
        const updateDoc = {
            $set: {
              quantity : parseInt(updateQuantity.quantity) + parseInt(result2.quantity)
            }
        }
        const result = await itemsCollection.updateOne(filter, updateDoc, options);
        res.send(result);
    })
    // delivered by id
    app.put('/delivered/:id', async (req,res) => {
        const id = req.params.id;
   
      //get single ITEM by id
      const query = {_id : ObjectId(id)};
      const result2 = await itemsCollection.findOne(query);
        
        const filter = {_id : ObjectId(id)};
        const options = { upsert: true };
        const updateDoc = {
            $set: {
              quantity : parseInt(result2.quantity) - 1
            }
        }
        const result = await itemsCollection.updateOne(filter, updateDoc, options);
        res.send(result);
    })


    
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

//
app.get("/", (req, res) => {
  res.send("running my electro-house server port:" + port);
});
app.listen(port, () => {
  console.log("electro-house server is running, Port " + port);
});
