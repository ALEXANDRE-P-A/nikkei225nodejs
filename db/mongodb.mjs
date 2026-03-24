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

const findOne = async (dbname, colname, name) => {
  try {
    const col = await getCollection(dbname, colname);
    const doc = col.findOne({ name: name });
    return doc;
  } catch(e) {
    console.log(`error in find ${name}`, e);
    await client.close();
  };
};

const insertOne = async (dbname, colname, doc) => {
  try {
    const col = await getCollection(dbname, colname);
    const result = await col.insertOne(doc);
    return result;
  } catch(e) {
    console.log(`error in insert ${doc}`, e);
    await client.close();
  };
};

const insertMany = async (dbname, colname, array) => {
  try {
    const col = await getCollection(dbname, colname);
    const result = await col.insertMany(array);
    return result;
  } catch(e) {
    console.log(`error in insert stocks info`, e);
  };
  
};

const updateOne = async (dbname, colname, name, value) => {
  try{
    const col = await getCollection(dbname, colname);
    const doc = await col.updateOne({ name: name }, { $set: { value: value } });
    return doc;
  } catch(e) {
    console.log(`error in update ${name}`, e);
    await client.close();
  };
};

const reset = async (dbname, colname) => {
  const col = await getCollection(dbname, colname);
  const result = await col.deleteMany({});
  return result;
};

export { run, getCollection, findOne, insertOne, insertMany, updateOne, reset };