const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

//middle wire
app.use(cors({
  origin: [
    // 'http://localhost:5173'
    'https://talenify.web.app',
    'https://talenify.firebaseapp.com'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());




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

//middleware
const logger = (req, res, next) => {
  console.log('log: info', req.method, req.url);
  next();
}

const verifyToken  = (req, res, next) => {
  const token = req.cookies?.token;
  console.log('token in the middleware', token);
  if(!token)
  {
    return res.status(401).send({message: 'unauthorized access'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if(err)
    {
      return res.status(401).send({message: 'unauthorized access'})
    }
    req.user = decoded;
    next();
  })
  
}






async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

     const jobCollection = client.db('jobHunt').collection('jobs');
     const bidCollection = client.db('jobHunt').collection('bids');


     //jwt related api 
     app.post('/jwt', async(req, res) => {
      const user = req.body;
      console.log('user for token', user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN , {expiresIn: '1h'});
      res.cookie('token',token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
      .send({success: true});
     })


     //jwt logout related
     app.post('/logout', async(req, res) => {
      const user = req.body;
      console.log('logging out', user);
      res.clearCookie('token', {maxAge: 0}).send({success: true})
     })






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
      //  console.log('token owner info', req.user);
      //  if(req.user.email !== req.query.email)
      //  {
      //   return res.status(403).send({message: 'forbidden access'})
      //  }


      //  console.log('cook cookies', req.cookies)


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

      //  console.log('cook cookies', req.cookies);

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
      console.log(filter)
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
    // await client.db("admin").command({ ping: 1 });
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
