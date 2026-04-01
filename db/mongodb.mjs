import { MongoClient, ServerApiVersion } from "mongodb";
import { config } from "dotenv";

config();

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
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
    console.log("ERROR when get collection", e);
    await client.close();
  }
};

const createCollection = async (dbname, newColName) => {
   try {
    await client.connect();
    const db = client.db(dbname);
    const result = db.createCollection(newColName, {
      capped: true,
      size: 1024 * 50, // 必須：バイト単位のサイズ（例: 50KB）
      max: 50         // 最大ドキュメント数
    });
    console.log(result);
  } catch(e) {
    console.log(`ERROR when create new collection ${newColName}`, e);
    await client.close();
  }
};

const findOne = async (dbname, colname, docname) => {
  try {
    const col = await getCollection(dbname, colname);
    const doc = col.findOne({ name: docname });
    return doc;
  } catch(e) {
    console.log(`error in find document ${docname}`, e);
    await client.close();
  };
};

const find = async (dbname, colname) => {
  try {
    const col = await getCollection(dbname, colname);
    let doc = col.find();
    const result = doc.toArray();
    return result;
  } catch(e) {
    console.log(`error in find collection ${colname}`, e);
    await client.close();
  };
};

const insertOne = async (dbname, colname, docname) => {
  try {
    const col = await getCollection(dbname, colname);
    const result = await col.insertOne(docname);
    return result;
  } catch(e) {
    console.log(`error in insert document ${docname}`, e);
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

const resetCollection = async (dbname, colname) => {
  const col = await getCollection(dbname, colname);
  const result = await col.deleteMany({});
  return result;
};

export { run, getCollection, createCollection, findOne, find, insertOne, insertMany, updateOne, resetCollection };