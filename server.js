const WebSocket = require("ws");

const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port });

console.log(`WebSocket server is running on port ${port}`);

const clients = new Map(); // Храним имена пользователей и их соединения

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "join") {
      // Сохраняем нового пользователя
      clients.set(data.username, ws);
      console.log(`${data.username} joined the chat.`);
    } else if (data.type === "message") {
      // Отправляем сообщение всем пользователям
      for (let [username, client] of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              from: data.from,
              message: data.message,
            })
          );
        }
      }
    }
  });

  ws.on("close", () => {
    // Удаляем пользователя, когда он отключается
    for (let [username, client] of clients) {
      if (client === ws) {
        clients.delete(username);
        console.log(`${username} left the chat.`);
        break;
      }
    }
  });
});
