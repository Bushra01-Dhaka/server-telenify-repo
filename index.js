const express = require("express");
const cors = require("cors");
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//middle wire
app.use(cors());
app.use(express.json());




const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u9lypro.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

     const jobCollection = client.db('jobHunt').collection('jobs');
     const bidCollection = client.db('jobHunt').collection('bids');

     //create api to inserting data into jobCollection jobs
     app.post('/jobs', async(req, res) => {
        const job = req.body;
        const result = await jobCollection.insertOne(job);
        res.send(result);
     })

      //create api to inserting data into bidCollection
     
      app.post('/bids', async(req, res) => {
         const bid = req.body;
         const result = await bidCollection.insertOne(bid);
         res.send(result);
       });

     

     //all jobs data 
     app.get('/jobs', async(req, res) => {
        console.log("email",req.query.email);

        let query = {};
        if(req.query?.email)
        {
         query = {jobPosterEmail: req.query.email}
        }
       const result = await jobCollection.find(query).toArray();
       res.send(result);
        
     })

     //bid all data according to bider email query
     app.get('/bids', async(req, res) => {
       console.log("email", req.query.email);

       let query = {};
       if(req.query?.email)
       {
        query = {bidEmail: req.query.email}
       }
       const result = await bidCollection.find(query).toArray();
       res.send(result)
     })

      //bid all data according to JOB POSTER email query
     app.get('/bids', async(req, res) => {
       console.log("email", req.query.email);

       let query = {};
       if(req.query?.email)
       {
        query = {jobPosterEmail: req.query.email}
       }
       const result = await bidCollection.find(query).toArray();
       res.send(result)
     })


     //for updating bids
     app.patch('/bids/single/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {jobPost_Id: (id)}
      const updatedStatus = req.body;
      console.log(updatedStatus);

      const updatedDoc = {
            $set: {
              status: updatedStatus.status
            }
      }
      const result = await bidCollection.updateOne(filter, updatedDoc);
      res.send(result);
     })


    

  


    app.get('/jobs/:category', async(req, res) => {
      const category = req.params.category;
      const query = {category: (category)};
      const result = await jobCollection.find(query).toArray();
      res.send(result);
    })


    
     app.get('/jobs/single/:id', async(req, res) => {
       const id = req.params.id;
       const query = {_id: new ObjectId(id)};
       const result = await jobCollection.findOne(query);
       res.send(result);
     })

     //delete 
     app.delete('/jobs/:id', async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await jobCollection.deleteOne(query);
      res.send(result); 
     })

     //to update
     app.put('/jobs/single/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true}
      const updatedJobs = req.body;
      const job = {
        $set: {
          jobPosterEmail : updatedJobs.jobPosterEmail,
          job_title: updatedJobs.job_title,
          deadline: updatedJobs.deadline,
          description: updatedJobs.description,
          category: updatedJobs.category,
          minPrice: updatedJobs.minPrice,
          maxPrice: updatedJobs.maxPrice
        }
      }
      const result = await jobCollection.updateOne(filter,job,options);
      res.send(result);
     })


    









    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("Talenify server is running");
});

app.listen(port, () => {
  console.log(`Talenify is running on port: ${port}`);
});
