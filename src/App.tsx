import React from 'react'
import './App.css'

function App() {

  const [streamUser, setStreamUser] = React.useState("");
  const [youtubeURL, setYoutubeURL] = React.useState("");
  const [show, setShow] = React.useState(false);

  const colors = [
    "#FF8A80", "#FF80AB", "#EA80FC",
    "#F5F5F5", "#66BB6A", "#B388FF",
    "#1976D2", "#0097A7", "#F57C00",
  ];

  const currentMessages = React.useRef(["Primeira mensagem"]);
  const socket = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

  const randomIntFromInterval = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  const onSubmit = (eventSubmit: React.FormEvent<HTMLFormElement>) => {
    eventSubmit.preventDefault();
    setShow(true);
    socket.onmessage = (event) => {
      const message = event.data.trim();

      if (message.startsWith('PING')) {
        socket.send('PONG :tmi.twitch.tv'); // Responder ao PING da Twitch
      }

      if (message.includes('PRIVMSG')) {
        const user = message.split('!')[0].substring(1);
        const chatMessage = message.split('PRIVMSG')[1].split(':')[1];

        const randomNumber = randomIntFromInterval(1, 9);

        const ulElement = document.getElementById("chat");
        if (ulElement) {
          const liElement = document.createElement("li");
          liElement.className = "chatItem";
          liElement.style.setProperty("color", colors[randomNumber]);
          liElement.innerHTML = `<p class="chatText">${user}: ${chatMessage}</p>`
          ulElement.appendChild(liElement);
          currentMessages.current.push(`${user}: ${chatMessage}`);
          if (currentMessages.current.length > 44) {
            currentMessages.current.shift();
            ulElement.querySelector('li')!.remove()
          }
          setTimeout(() => { ulElement.scrollTop = ulElement.scrollHeight; }, 0);
        }
      }
    };

    // Autenticar (você pode usar 'justinfan12345' como nome de usuário para acesso anônimo)
    socket.onopen = function () {
      const oauthToken = `oauth:${import.meta.env.VITE_ACCESS_KEY}`;

      socket.send(`PASS ${oauthToken}`);
      socket.send(`NICK ${import.meta.env.VITE_USERNAME}`);
      socket.send(`JOIN #${streamUser}`); // Nome do canal que você quer entrar
    };

    socket.onerror = function (error) {
      console.error('Erro no WebSocket:', error);
    };

    socket.onclose = function () {
      console.log('Conexão WebSocket fechada.');
    };
  }

  return (
    <div className="content">
      {(streamUser && youtubeURL && show) ? (
        <iframe
          src={youtubeURL} title="YouTube video player" frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin" allowFullScreen>
        </iframe>
      ) : (
        <div className="dataForm">
          <form onSubmit={onSubmit}>
            <div className="textInput">
              <label>Stream User</label>
              <input
                onChange={(event) => setStreamUser(event.target.value)}
              />
            </div>
            <div className="textInput">
              <label>Youtube URL</label>
              <input
                onChange={(event) => setYoutubeURL(event.target.value)}
              />
            </div>
            <button>Enviar</button>
          </form>
        </div>
      )}
      <section className="chatSection">
        <h1 className="title">Chat</h1>
        <ul className="chatBox" id="chat"></ul>
      </section>
    </div>
  )
}

export default App
