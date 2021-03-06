const express = require("express");

const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const jwt = require("jsonwebtoken");

const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//use middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
  // console.log("authHeader",authHeader);
}

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

    // AUTH token
    app.post("/userToken", async (req, res) => {
      const user = req.body;
      
      
      const userAccessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ userAccessToken });
    });
    //add items
    app.post("/addItems", async (req, res) => {
      const newItem = req.body;
      const result = await itemsCollection.insertOne(newItem);
      res.send(result);
    });

    //get data
    app.get("/items", async (req, res) => {
      const query = {}; //get all information
      const cursor = itemsCollection.find(query);
      const items = await cursor.toArray();
      res.send(items);
    });

    //get single item by id
    app.get("/items/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await itemsCollection.findOne(query);
      res.send(result);
    });
    //get single item by user email
    app.get("/userItems", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = itemsCollection.find(query);
        const items = await cursor.toArray();
        res.send(items);
      } else {
        res.status(403).send({ message: "Forbidden acccess" });
      }
    });

    //post data
    app.post("/items", async (req, res) => {
      const newServices = req.body;
      const result = await itemsCollection.insertOne(newServices);
      res.send(result);
    });
    //delete a itme
    app.delete("/delteItem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await itemsCollection.deleteOne(query);
      res.send(result);
    });

    //update data by id
    app.put("/items/:id", async (req, res) => {
      const id = req.params.id;
      const updateUser = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updateUser.name,
          price: updateUser.price,
          description: updateUser.description,
          img: updateUser.img,
        },
      };
      const result = await itemsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    // updateQuantity by id
    app.put("/updateQuantity/:id", async (req, res) => {
      const id = req.params.id;
      const updateQuantity = req.body;

      //get single ITEM by id
      const query = { _id: ObjectId(id) };
      const result2 = await itemsCollection.findOne(query);

      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity:
            parseInt(updateQuantity.quantity) + parseInt(result2.quantity),
        },
      };
      const result = await itemsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    // delivered by id
    app.put("/delivered/:id", async (req, res) => {
      const id = req.params.id;

      //get single ITEM by id
      const query = { _id: ObjectId(id) };
      const result2 = await itemsCollection.findOne(query);

      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: parseInt(result2.quantity) - 1,
        },
      };
      const result = await itemsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
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

//node 
//require('crypto').randomBytes(64).toString('hex')
