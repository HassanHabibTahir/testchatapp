import mongoose from "mongoose";

export function connectDB() {
  return new Promise((res, rej) => {
    mongoose.set("strictQuery", false);
    mongoose.set("bufferCommands", false);
    mongoose
      .connect(process.env.MONGO_URI)
      .then(() => {
        console.log("DATABASE IS CONNECTED :)");
        res();
      })
      .catch(rej);
  });
}
