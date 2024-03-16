import { updateOnlineMessages } from "../../utils/index.js";
let users = [];
const addUser = (userId, socketId) => {
  if (userId) {
    !users.some((user) => user.userId == userId) &&
      users.push({ userId, socketId });
  }
};
const removeUser = (socketId) => {
  users = users?.filter((user) => user?.socketId != socketId);
};
const userLogout = (userId) => {
  users = users.filter((u) => u.userId !== userId);
};
const findFriend = (id) => {
  return users.find((u) => u.userId === id);
};
export const appMessages = (socket, socketIo) => {
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    socket.emit("getUsers", users);
    socket.broadcast.emit("activeUsers", users);
  });
  socket.on("sendMessage", async (data) => {
    if (data) {
      const user = findFriend(data.receiverId);
      if (user !== undefined) {
        socket.to(user?.socketId).emit("getMessage", data);
        await updateOnlineMessages(data);
      }
    }
  });
  socket.on("typingMessage", (data) => {
    const user = findFriend(data.receiverId);
    if (user !== undefined) {
      socket.to(user.socketId).emit("typingMessageGet", {
        senderId: data.senderId,
        receiverId: data.receiverId,
        message: data.message,
      });
    }
  });
  socket.on("messageSeen", (msg) => {
    const user = findFriend(msg.senderId);
    if (user !== undefined) {
      socket.to(user.socketId).emit("msgSeenResponse", msg);
    }
  });
  socket.on("delivaredMessage", (msg) => {
    const user = findFriend(msg.senderId);
    if (user !== undefined) {
      socket.to(user.socketId).emit("msgDelivaredResponse", msg);
    }
  });
  socket.on("seen", (data) => {
    const user = findFriend(data.senderId);
    if (user !== undefined) {
      socket.to(user.socketId).emit("seenSuccess", data);
    }
  });



  socket.on("logout", (userId) => {
    userLogout(userId);
    socket.broadcast.emit("activeUsers", users);
  });
  socket.on("disconnect", () => {
    removeUser(socket.id);
    socketIo.emit("getUser", users);
    socket.broadcast.emit("activeUsers", users);
  });
};
