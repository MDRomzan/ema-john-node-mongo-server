const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require("cors");
require('dotenv').config();
const app =express();
const port =process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ej29o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// console.log(uri);


async function run() {
  try {
    await client.connect();
    const database=client.db("online_Shop");
    const productCollection=database.collection("product");
    const orderCollection=database.collection("orders");
    
    // grt products api
    app.get("/products",async(req,res)=>{
      // console.log(req.query);
        const cursor =productCollection.find({});
        const page =req.query.page;
        const size = parseInt(req.query.size);
        let products;
        const count = await cursor.count();
        if(page){
          products = await cursor.skip(page*size).limit(size).toArray();
        }else{
          products = await cursor.toArray();
        }
        
        
        res.send({
          count,
          products
        });
    })
    // use post to get by keys
    app.post("/products/byKeys", async(req,res)=>{
      // console.log(req.body);
      const keys =req.body;
      const query ={key: {$in:keys}}
      const products =await productCollection.find(query).toArray(); 
      res.json(products);
    });
    // Add post api
    app.post("/orders",async(req,res)=>{
      const order=req.body;
      // console.log("order ",order);
      const result =await orderCollection.insertOne(order);
      res.json(result);
    })

  }
   finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/",(req,res)=>{
    res.send("Ema-john server is running");
});
app.listen(port,()=>{
    console.log("Ema-john running at port",port);
})