import { firestore, rtdb } from "./db";
import * as express from "express";
import * as cors from "cors";
import { nanoid } from "nanoid";

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
              new: true,
            });
          });
      } else {
        res.status(400).json({
          message: "User already exists",
        });
        // console.log("El email ingresado ya se existe en la base de datos!");
      }
    });
  // userCollection.doc("1234");
  // console.log(req.body);
  // res.json(req.body);
});

// authentication
app.post("/auth", (req, res) => {
  // La linea siguiente es lo mismo que la que le sigue, solo que para abreviarlo se utiliza el corchete en el nombre de la constante
  // const email = req.body.email
  const { email } = req.body;

  userCollection
    .where("email", "==", email)
    .get()
    .then((searchResponse) => {
      if (searchResponse.empty) {
        res.status(404).json({
          message: "Not found",
        });
        // console.log("El email ingresado ya se existe en la base de datos!");
      } else {
        res.json({
          id: searchResponse.docs[0].id,
        });
      }
    });
});

app.post("/rooms", (req, res) => {
  const { userId } = req.body;
  userCollection
    .doc(userId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        rtdb
          .ref("/rooms/" + nanoid())
          .set({
            messages: [],
            owner: userId,
          })

          // Si le paso por post  un body con el owner: userId de los id que estan en la db me los guarda en la rtdb
          .then((rtdbRes) => {
            res.json({
              id: rtdbRes.id,
            });
          });
      }
    });
});

app.get("rooms/:id", (req, res) => {
  console.log(req.body);
  res.json(req.body);
});

app.listen(port, () => {
  console.log(`Iniciado en http://localhost:${port}`);
});
