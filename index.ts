import { firestore, rtdb } from "./db";
import * as express from "express";
import { v4 as uuidv4 } from "uuid";
import * as cors from "cors";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.post("/prueba", (req, res) => {
  console.log(req.body);
  res.json(req.body);
});

app.listen(port, () => {
  console.log(`Inciciado en http://localhost:${port}`);
});
