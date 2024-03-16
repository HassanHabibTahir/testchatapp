import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import {
  authRoutes,
 
  userRoutes,

  messageRoute,
  
} from "./routes/index.js";
import { connectDB, updateOnlineMessages } from "./utils/index.js";
import { passportMiddleware, serverError } from "./middleware/index.js";
import passport from "passport";
import session from "express-session";
import { User } from "./models/user.js";
import { Server } from "socket.io";
import { appMessages } from "./controller/sockets/socket.js";
import { allowedOrigins } from "./config/allowedOrigins.js";

const { PORT, APP_SECRET } = process.env;
const app = express();
app.use(express.json({ limit: "200mb" }));
app.use(cors());
app.use(
  session({
    secret: APP_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.urlencoded({ limit: "200mb", extended: true }));

const absolutePath = path.resolve("uploads");
app.use("/uploads", express.static(absolutePath));

app.use(passport.initialize());
app.use(passport.session());
passportMiddleware(passport);
app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api", messageRoute);

app.get("/", (req, res) => {
  res.json({ success: true, dat: "Now the server is running successfully!" });
});
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
const main = async () => {
  await connectDB();
  const server = app.listen(PORT, async () => {
    console.log(`Server Running On Port ${PORT}`);
  });

  const socketIo = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: process.env.NODE_ENV === "production" ? "" : allowedOrigins,
      methods: ["GET", "POST"],
    },
  });
  socketIo.on("connection", (socket) => {
    appMessages(socket, socketIo);
  });
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
app.use(serverError);
