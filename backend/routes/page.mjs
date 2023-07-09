import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const collectionName = "textLines"

const router = express.Router();

// get all
router.get("/", async (req, res) => {
  let collection = await db.collection(collectionName)
  let deleteAll = await collection.deleteMany(                                                                                                                                                                  {})
  let results = await collection.find({}).toArray()
  console.log("results", results)
  res.send(results).status(200)
});

// create
router.post("/", async (req, res) => {
  let collection = await db.collection(collectionName)
  let newDocument = {
    text: req.body.text,
    indent: req.body.indent,
    parent: req.body.parent,
    children: [],
  };
  let result = await collection.insertOne(newDocument)
  const insertedId = result.insertedId
  const query = { _id: new ObjectId(req.body.parent) }
  const update = {
    $push: {
      children: insertedId
    }
  }
  await collection.updateOne(query, update)
  res.status(201).json({ id: insertedId })
});

router.patch("/", async (req, res) => {
  const query = { _id: new ObjectId(req.body.id) };
  const updates = req.body.text !== null ? {
    $set: {
      text: req.body.text,
    }
  } : {
    $set: {
      time: req.body.time,
    }
  }
  let collection = await db.collection(collectionName);
  let result = await collection.updateOne(query, updates);
  console.log(result)
  res.send(result).status(200);
});


router.delete("/", async (req, res) => {
  let collection = await db.collection(collectionName)
  const ids = req.body.ids.map((id) => new ObjectId(id));

  // Delete the documents
  await collection.deleteMany({ _id: { $in: ids } });

  // Update all documents that have the deleted IDs in their children array
  let result = await collection.updateMany(
    { children: { $in: ids } },
    { $pull: { children: { $in: ids } } }
  );
  res.send(result).status(200);
});



export default router;