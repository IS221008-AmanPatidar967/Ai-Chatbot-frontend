import React, {
  useState,
  useRef,
  useEffect,
} from "react";

import axios from "axios";

import "./App.css";

import logo from "./logo.png";

import ReactMarkdown from "react-markdown";

import {
  Prism as SyntaxHighlighter,
} from "react-syntax-highlighter";

import { oneDark }
from "react-syntax-highlighter/dist/esm/styles/prism";


function App() {

  const [theme, setTheme] =
    useState("dark");

  const [message, setMessage] =
    useState("");

  const [chat, setChat] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const chatEndRef = useRef(null);


  // =========================
  // AUTO SCROLL
  // =========================

  useEffect(() => {

    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [chat, loading]);


  // =========================
  // SYSTEM THEME
  // =========================

  useEffect(() => {

    const prefersDark =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

    setTheme(
      prefersDark ? "dark" : "light"
    );

  }, []);


  // =========================
  // THEME TOGGLE
  // =========================

  const toggleTheme = () => {

    setTheme(
      theme === "dark"
        ? "light"
        : "dark"
    );

  };


  // =========================
  // NEW CHAT
  // =========================

  const newChat = () => {
    setChat([]);
  };


  // =========================
  // SEND MESSAGE
  // =========================

  const sendMessage = async () => {

    if (!message.trim()) return;

    const userMsg = {
      sender: "user",
      text: message,
    };


    // ADD USER MESSAGE
    setChat((prev) => [
      ...prev,
      userMsg,
    ]);

    setLoading(true);

    setMessage("");


    try {

      // FORMAT HISTORY
      const formattedHistory =
        chat.map((msg) => ({

          role:
            msg.sender === "user"
              ? "user"
              : "assistant",

          content: msg.text,

        }));


      // API CALL
     const res = await axios.post(
  "https://ai-chatbot-backend-3g6d.onrender.com/api/content",
  {
    question: message,
    history: formattedHistory,
  }
);


      // ADD AI RESPONSE
      setChat((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: res.data.result,
        },
      ]);

    } catch (err) {

      console.log(err);

      setChat((prev) => [
        ...prev,
        {
          sender: "assistant",
          text:
            "❌ Backend connection failed.",
        },
      ]);

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className={`app ${theme}`}>

      {/* SIDEBAR */}

      <aside className="sidebar">

        <button
          className="themeBtn"
          onClick={toggleTheme}
        >

          {
            theme === "dark"
              ? "🌞 Light Mode"
              : "🌙 Dark Mode"
          }

        </button>


        <button
          className="newChatBtn"
          onClick={newChat}
        >
          + New Chat
        </button>


        <div className="historyLabel">
          Recent
        </div>

        <div className="historyItem">
          React help
        </div>

        <div className="historyItem">
          Explain JavaScript
        </div>

      </aside>



      {/* MAIN */}

      <main className="main">

        <div className="chatContainer">

          {
            chat.length === 0 ? (

              <div className="emptyState">

                <div className="logoContainer">

                  <img
                    src={logo}
                    alt="logo"
                    className="logoImage"
                  />

                </div>

                <h1>
                  How can I help you today?
                </h1>

              </div>

            ) : (

              chat.map((msg, i) => (

                <div
                  key={i}
                  className="messageRow"
                >

                  <div className="innerMessage">

                    <div
                      className={`avatar ${
                        msg.sender === "user"
                          ? "userAvatar"
                          : "aiAvatar"
                      }`}
                    >

                      {
                        msg.sender === "user"
                          ? "U"
                          : "AI"
                      }

                    </div>


                    {/* MESSAGE */}

                    <div className="text markdownBody">

                      <ReactMarkdown
                        components={{

                          code({
                            inline,
                            className,
                            children,
                            ...props
                          }) {

                            const match =
                              /language-(\w+)/.exec(
                                className || ""
                              );

                            return !inline &&
                              match ? (

                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >

                                {String(children).replace(
                                  /\n$/,
                                  ""
                                )}

                              </SyntaxHighlighter>

                            ) : (

                              <code
                                className={className}
                                {...props}
                              >
                                {children}
                              </code>

                            );

                          },

                        }}
                      >

                        {msg.text}

                      </ReactMarkdown>

                    </div>

                  </div>

                </div>

              ))

            )
          }


          {/* LOADING */}

          {
            loading && (

              <div className="messageRow">

                <div className="innerMessage">

                  <div className="avatar aiAvatar">
                    AI
                  </div>

                  <div className="typingDots">

                    <span></span>
                    <span></span>
                    <span></span>

                  </div>

                </div>

              </div>

            )
          }

          <div ref={chatEndRef} />

        </div>



        {/* INPUT SECTION */}

        <div className="inputSection">

          <div className="inputBox">

            <input
              className="inputField"

              value={message}

              onChange={(e) =>
                setMessage(e.target.value)
              }

              placeholder="Message your AI..."

              onKeyDown={(e) =>
                e.key === "Enter" &&
                sendMessage()
              }
            />


            <button
              className="sendBtn"
              onClick={sendMessage}
            >
              ↑
            </button>

          </div>


          <p className="footerText">
            Aman AI can make mistakes.
            Check important info.
          </p>

        </div>

      </main>

    </div>

  );

}

export default App;
