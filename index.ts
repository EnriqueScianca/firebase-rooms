import { firestore, rtdb } from "./db";
import * as express from "express";
import * as cors from "cors";
import { nanoid } from "nanoid";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const userCollection = firestore.collection("users");
const roomsCollection = firestore.collection("rooms");

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

// app.post("/rooms", (req, res) => {
//   const { userId } = req.body;
//   // const userId = req.body.userId;

//   console.log("Soy el userId", userId);
//   userCollection
//     .doc(userId.toString())
//     .get()
//     .then((doc) => {
//       if (doc.exists) {
//         rtdb.ref("rooms/" + nanoid()).set({
//           message: [],
//           owner: userId,
//         });
//         const roomId = 1000 + Math.floor(Math.random() * 999);
//         roomsCollection
//           .doc(roomId.toString())
//           .set({
//             rtdbRoomId: userId,
//           })
//           .then(() => {
//             res.json({
//               id: roomId.toString(),
//             });
//           });
//         res.json({
//           message: "Usuario con id: " + userId,
//         });
//       } else {
//         res.status(401).json({
//           message: "No existís",
//         });
//       }
//     });
// });

app.post("/rooms", (req, res) => {
  const { userId } = req.body;
  userCollection
    .doc(userId.toString())
    .get()
    .then((doc) => {
      if (doc.exists) {
        const roomRef = rtdb.ref("rooms/" + nanoid());

        roomRef
          .set({
            message: [],
            owner: userId,
          })
          .then(() => {
            const roomLongId = roomRef.key;
            const roomId = 1000 + Math.floor(Math.random() * 999);

            roomsCollection
              .doc(roomId.toString())
              .set({
                rtdbRoomId: roomLongId,
              })
              .then(() => {
                res.json({
                  id: roomId.toString(),
                });
              });
          });
      } else {
        res.status(401).json({
          message: "No existis mi bro",
        });
      }
    });
});

app.get("/rooms/:roomId", (req, res) => {
  const { userId } = req.query;
  const { roomId } = req.params;

  userCollection
    .doc(userId.toString())
    .get()
    .then((doc) => {
      if (doc.exists) {
        roomsCollection
          .doc(roomId.toString())
          .get()
          .then((snap) => {
            const data = snap.data();
            res.json(data);
          });
      } else {
        res.status(401).json({
          message: "No existis mi bro",
        });
      }
    });
});

app.listen(port, () => {
  console.log(`Iniciado en http://localhost:${port}`);
});
