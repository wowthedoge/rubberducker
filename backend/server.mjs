import express from "express";
import cors from "cors";
import page from "./routes/page.mjs";
import bp from "body-parser";

const PORT = process.env.PORT || 5050;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bp.urlencoded({
  extended: true
}));
app.use( bp.json());
app.use("/page", page);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});