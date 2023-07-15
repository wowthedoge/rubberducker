import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const collectionName = "textLines"

const router = express.Router();

// get initial id on first load
router.get("/", async (req, res) => {
  let collection = await db.collection(collectionName)
  // let deleteAll = collection.deleteMany({})
  let results = await collection.find({}).toArray()
  res.send(results)
})

// create
router.post("/", async (req, res) =>{
  console.log("router.post")
  const collection = await db.collection(collectionName)
  const document = {
    textLines: req.body.textLines
  }
  const result = await collection.insertOne(document)
  res.json({id: result.insertedId})
})

// save
router.patch("/", async (req, res) => {
  console.log("router.patch")
  const collection = await db.collection(collectionName)
  const result = await collection.updateOne(
    { _id: new ObjectId(req.body.id) },
    { $set: {
      textLines: req.body.textLines,
    }}
  )
  res.send(result.upsertedId)
});


router.delete("/", async (req, res) => {
  // let collection = await db.collection(collectionName)
  // const ids = req.body.ids.map((id) => new ObjectId(id));

  // // Delete the documents
  // await collection.deleteMany({ _id: { $in: ids } });

  // // Update all documents that have the deleted IDs in their children array
  // let result = await collection.updateMany(
  //   { children: { $in: ids } },
  //   { $pull: { children: { $in: ids } } }
  // );
  // res.send(result).status(200);
});



export default router;