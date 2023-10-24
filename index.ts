import { firestore, rtdb } from "./db";
import * as express from "express";
import { v4 as uuidv4 } from "uuid";
import * as cors from "cors";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const userCollection = firestore.collection("users");

// signup

app.post("/signup", (req, res) => {
  const email = req.body.email;
  const nombre = req.body.nombre;
  userCollection
    .where("email", "==", email)
    .get()
    .then((searchResponse) => {
      if (searchResponse.empty) {
        userCollection
          .add({
            email,
            nombre,
          })
          .then((newUserRef) => {
            res.json({
              id: newUserRef.id,
            });
          });
      } else {
        console.log("El email ingresado ya se existe en la base de datos!");
      }
      res.json({});
    });
  // userCollection.doc("1234");
  // console.log(req.body);
  // res.json(req.body);
});

// authentication

app.listen(port, () => {
  console.log(`Iniciado en http://localhost:${port}`);
});
