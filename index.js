
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const express =require('express');
const cors =require('cors');
const app =express();
require('dotenv').config()
const port =process.env.PORT || 4000;


app.use(cors());
app.use(express.json());

//DB_USER =job_portal
//DB_PASS= uclEsw7CCsWInEmJ

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dcadkw6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {

    //job related apis
   const jobsCollection =client.db('job_portal').collection('jobs');
   const jobApplicationCollection =client.db('job_portal').collection('job_applications');

   app.get('/jobs', async(req, res)=>{
        const cursor= jobsCollection.find();
        const result = await cursor.toArray();
        res.send(result)
   })

  //Job detailes er data load
  app.get('/jobs/:id', async(req, res)=>{
    const id =req.params.id;
    const query= {_id: new ObjectId(id)};
    const result =await jobsCollection.findOne(query);
    res.send(result)

  })


  //job application apis
  //get all data, get one data, get some data [0, 1, many]

  app.get('/job-application', async(req, res) =>{
    const email =req.query.email;
    const query ={applicant_email: email }
    const result = await jobApplicationCollection.find(query).toArray();
    res.send(result);
  })



  app.post('/job-applications', async(req, res)=>{
    const application =req.body;
   const result =await jobApplicationCollection.insertOne(application);

   //fokira way to aggregate data
for(const application of result){
  console.log(application.job_id);
  const query1 ={ _id: new ObjectId(application.job_id)}
  const job = await jobsCollection.findOne(query1);
  if(job){
      application.title = job.title;
      application.company =job.company;
  }
}


   res.send(result);
  })

  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send('Job is falling form the sky')
})


app.listen(port, ()=>{
    console.log(`Job is waiting at: ${port}`);
})
