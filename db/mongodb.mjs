import { MongoClient, ServerApiVersion } from "mongodb";
import { config } from "dotenv";

config();

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const run = async _ => {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}

const getCollection = async (dbname, colname) => {
  try {
    await client.connect();
    const db = client.db(dbname);
    const result = db.collection(colname);
    return result;
  } catch(e) {
    console.log("error when get collection", e);
    await client.close();
  }
};

const find = async (dbname, colname) => {
  const col = await getCollection(dbname, colname);
  const allDocs = await col.find({}).toArray();
  console.log('All Documents:', allDocs);
  await client.close();
};

const insertOne = async (dbname, colname, time) => {
  const col = await getCollection(dbname, colname);
  const result = await col.insertOne({ date: time });
  console.log(result);
  await client.close();
};

const insertMany = async (dbname, colname) => {
  const col = await getCollection(dbname, colname);
  const result = await col.insertMany([
    { status: "active", title: "record1" },
    { status: "inactive", title: "record2" },
    { status: "active", title: "record3" }
  ]);
  console.log(result);
  await client.close();
};

const update = async (dbname, colname) => {
  const col = await getCollection(dbname, colname);
  const result = await col.updateMany({ status: "active" }, { $set: { title: "updated" } });
  console.log(result);
  await client.close();
};

const reset = async (dbname, colname) => {
  const col = await getCollection(dbname, colname);
  const result = await col.deleteMany({});
  console.log(result);
  await client.close();
};

export { run, getCollection, find, insertOne, insertMany, update, reset };