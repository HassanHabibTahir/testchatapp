// import React from 'react'
import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser, userLogout } from "../../store/actions/authAction";
import { useNavigate } from "react-router-dom";
import {
  getFriends,
  getMessage,
  messageSend,
} from "../../store/actions/messengerAction";
import moment from "moment";
import io from "socket.io-client";
import { url } from "../../config";
// uuid
function generateRandomHexString(length) {
  const uid = uuidv4();
  return uid.replace(/-/g, "").substring(0, length);
}
const Chat = () => {
  const { error, successMessage, myInfo } = useSelector((state) => state.auth);
  const { friends, lastMessages, message, mesageSendSuccess } = useSelector(
    (state) => state.messenger
  );
  const [room, setRoom] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [user, setUser] = useState({});
  const [soketMessage, setSocketMessage] = useState("");
  const [activeUser, setActiveUser] = useState({});
  const [typingMessage, setTypingMessage] = useState("");
  const dispatch = useDispatch();
  const Navigate = useNavigate();
  const socket = useRef();
  console.log("lastMessages", lastMessages);
  useEffect(() => {
    socket.current = io.connect(url, { transports: ["websocket"] });
    socket.current.on("getMessage", (data) => {
      console.log(data, "get---->Messages ");
      setSocketMessage(data);
    });
    socket.current.on("typingMessageGet", (data) => {
      setTypingMessage(data);
    });
    socket.current.on("activeUsers", (users) => {
      if (myInfo) {
        const filterUser = users.filter((u) => u.userId !== myInfo.data._id);
        setActiveUser(filterUser);
      }
    });
  }, [myInfo]);

  const logoutHandler = () => {
    dispatch(userLogout());
    socket.current.emit("logout", myInfo.data._id);
    socket.current.on("refresh", (app) => { });
  };
  useEffect(() => {
    (async () => {
      const getToken = await localStorage.getItem("authToken");
      if (getToken) {
        let _token = JSON.parse(getToken);
        let { user } = _token;
        setUser(user);
        dispatch(getUser(_token));
        dispatch(getFriends());
        if (currentUser._id) dispatch(getMessage(currentUser._id));
      } else {
        Navigate("/login");
      }

      // if (friends.length > 0) {
      // console.log(currentUser, "current User")

      // }
    })();
    // if (!authenticate) {
    //     Navigate('/login');
    // }
    // if(successMessage){
    //      alert.success(successMessage);
    //      dispatch({type : SUCCESS_MESSAGE_CLEAR })
    // }
    // if(error){
    //      error.map(err=>alert.error(err));
    //      dispatch({type : ERROR_CLEAR })
    // }
  }, [successMessage, currentUser]);

  const messageChangeHandler = (e) => {
    setNewMessage(e.target.value);
    socket.current.emit("typingMessage", {
      senderId: myInfo.data._id,
      receiverId: currentUser._id,
      message: e.target.value,
    });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    const data = {
      _id: generateRandomHexString(24),
      senderName: myInfo.data.firstName,
      receiverId: currentUser._id,
      message: newMessage ? newMessage : "❤",
    };
    console.log("data.........>>>>>>", data);
    dispatch(messageSend(data));
    socket.current.emit("typingMessage", {
      senderId: myInfo.data._id,
      receiverId: currentUser._id,
      message: "",
    });
    setNewMessage("");
  };

  useEffect(() => {
    if (friends.success) {
      setCurrentUser(friends.users[0]);
    }
  }, [friends.success]);

  useEffect(() => {
    if (myInfo) socket.current.emit("addUser", myInfo?.data?._id, myInfo?.data);
  }, [myInfo]);
  useEffect(() => {
    socket.current.on("getUsers", (users) => {
      if (myInfo) {
        const filterUser = users.filter((u) => u.userId !== myInfo.data._id);
        setActiveUser(filterUser);
      }
    });

    socket.current.on("new_user_add", (data) => {
      dispatch(getFriends());
    });
  }, [activeUser, dispatch, myInfo]);

  let filterItems;
  if (myInfo.data && friends) {
    filterItems = friends?.filter((item) => item._id !== myInfo.data._id);
  }

  useEffect(() => {
    if (mesageSendSuccess) {
      socket.current.emit("sendMessage", message[message.length - 1]);
      dispatch({
        type: "UPDATE_FRIEND_MESSAGE",
        payload: {
          msgInfo: message[message.length - 1],
        },
      });
      dispatch({
        type: "MESSAGE_SEND_SUCCESS_CLEAR",
      });
    }
  }, [mesageSendSuccess, dispatch, message]);

  useEffect(() => {
    if (soketMessage) {
      dispatch({
        type: "SOCKET_MESSAGE",
        payload: {
          message: soketMessage,
        },
      });
      dispatch({
        type: "UPDATE_FRIEND_MESSAGE",
        payload: {
          msgInfo: soketMessage,
          status: "delivared",
        },
      });
    }
  }, [soketMessage]);

  console.log(typingMessage, "soketMessage--->");
  return (
    <div>
      <div className="container">
        <div className="row">
          <section
            className="discussions"
            style={{
              overflowY: "scroll",
            }}
          >
            {filterItems?.map((item, index) => (
              <div
                className="discussion"
                key={index}
                onClick={(e) => setCurrentUser(item)}
              >
                <div
                  className="photo"
                  style={{
                    backgroundImage: item.profilePic
                      ? `url(${item.profilePic})`
                      : "url(https://card.thomasdaubenton.com/img/photo.jpg)",
                  }}
                >
                  {activeUser &&
                    activeUser.length > 0 &&
                    activeUser.some((u) => u.userId === item._id) ? (
                    <div className="online"></div>
                  ) : (
                    ""
                  )}
                </div>
                <div className="desc-contact">
                  <p className="name">{item?.firstName}</p>

                  <p className="message">You can't see me</p>
                </div>
                <div className="timer">
                  {moment(item?.createdAt).startOf("mini").fromNow()}
                </div>
              </div>
            ))}
          </section>
          <section className="chat">
            <div className="header-chat">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  textAlign: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <div>
                  <i className="icon fa fa-user-o" aria-hidden="true"></i>
                  <p className="name">
                    {" "}
                    {currentUser
                      ? `Chat With ${currentUser.firstName}`
                      : "please select your friend"}
                  </p>
                  <i
                    className="icon clickable fa fa-ellipsis-h right"
                    aria-hidden="true"
                  ></i>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "2px solid #87A3EC",
                  }}
                >
                  <p className="name"> {user?.firstName}</p>
                  <button
                    onClick={() => logoutHandler()}
                    style={{
                      padding: ".5rem",
                      backgroundColor: "transparent",
                      color: "black",
                      outline: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            <div
              className="messages-chat"
              style={{
                overflowY: "scroll",
                height: "68vh",
              }}
            >
              {message && message.length > 0
                ? message.map((msg, index) => (
                  <div key={index}>
                    {msg.senderId === myInfo.data._id ? (
                      <div className="message text-only">
                        <div className="response">
                          <p className="text"> {msg.message.text}</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="message">
                          <div
                            className="photo"
                            style={{
                              backgroundImage:
                                "url(https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80);",
                            }}
                          >
                            <div className="online"></div>
                          </div>
                          <p className="text"> {msg?.message?.text}</p>
                        </div>
                        <p className="time"> 14h58</p>
                      </div>
                    )}
                  </div>
                ))
                : ""}
            </div>

            <div
              className="footer-chat"
              style={{
                display: "flex",
              }}
            >
              <div>
                {typingMessage &&
                  typingMessage.message &&
                  typingMessage.senderId === currentUser._id
                  ? "typing..."
                  : ""}
              </div>
              <input
                type="text"
                onChange={(e) => messageChangeHandler(e)}
                value={newMessage}
                className="write-message"
                placeholder="Type your message here"
              ></input>
              <button
                onClick={sendMessage}
                className="icon send fa fa-paper-plane-o clickable"
                aria-hidden="true"
              >
                send
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Chat;
