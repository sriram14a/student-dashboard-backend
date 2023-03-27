import * as dotenv from "dotenv";
import cors from "cors"
import express from "express";
import { MongoClient } from "mongodb";
import { usersRouter } from "./routes/user.js";
import { adminRouter } from "./routes/admin.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

async function createConnection() {
  try{const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("MongoDb is connected");
    return client;
  }
  catch{
    console.log("MongoDb is not connected");
  }
}

export const client = await createConnection();
app.use(express.json());
app.use(cors());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));



app.get("/", (req, res) => {
  res.send("hi there");
});

app.use("/user", usersRouter);
app.use("/admin", adminRouter);



app.listen(PORT, () => console.log("Server listening to PORT", PORT));

