const { MongoClient } = require('mongodb');
const url = 'mongodb-string'
const client = new MongoClient(url);
async function main(){
  await client.connect();
  const db = client.db('NameoftheDB');
  const collection = db.collection("User");
  const data = {}
  const inserteddata = await collection.insertOne(data);
  const findresult = await collection.find({}).toArray()
  const docCount = await collection.countDocuments({});
  const result = await collection.find({name:"kiran"}).count();
}
main()
.then (console.log())
.catch(console.error)
.finally(() => client.close())
