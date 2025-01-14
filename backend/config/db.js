const { MongoClient, ServerApiVersion } = require('mongodb');

// Build the connection string
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@healthcare.0xhra.mongodb.net/?retryWrites=true&w=majority&appName=healthcare`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Function to initialize the database connection
async function connectToDB() {
  try {
    // Connect the client to the server
    await client.connect();

    // Ping the database to ensure the connection is established
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");

    // Return the database object for interaction
    return client.db("healthcare");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the app with a failure code
  }
}

// Export the function to connect to the database
module.exports = { connectToDB };
