import { useEffect, useState } from "react";
// Simulación de API de chats (deberás conectar al backend real)
const mockChats = [
  { id: 1, user: "Conductor: Juan", messages: [{ from: "user", text: "¡Tengo un problema con la app!" }] },
  { id: 2, user: "Pasajero: Sofía", messages: [{ from: "user", text: "No me llegó mi viaje." }] },
];

export default function SupportChat() {
  const [chats, setChats] = useState([]);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setLoading(true);
    // Simula carga de chats (cambiar a fetch real)
    setTimeout(() => {
      setChats(mockChats);
      setLoading(false);
    }, 800);
  }, []);

  const sendMessage = () => {
    if (!msg.trim()) return;
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selected.id
          ? { ...chat, messages: [...chat.messages, { from: "admin", text: msg }] }
          : chat
      )
    );
    setMsg("");
    setFeedback("Mensaje enviado");
    setTimeout(() => setFeedback(""), 1500);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/3">
        <h2 className="text-xl font-semibold mb-4">Chats</h2>
        {loading && <p>Cargando chats...</p>}
        <ul>
          {chats.map((chat) => (
            <li
              key={chat.id}
              onClick={() => setSelected(chat)}
              className={`cursor-pointer p-2 rounded mb-2 ${selected?.id === chat.id ? "bg-blue-100" : "bg-white"}`}
            >
              {chat.user}
            </li>
          ))}
        </ul>
      </div>
      {selected && (
        <div className="flex-1">
          <h3 className="text-lg mb-2 font-semibold">Chat con {selected.user}</h3>
          <div className="border rounded h-48 overflow-y-auto mb-4 bg-white p-2">
            {selected.messages.map((m, i) => (
              <div key={i} className={`mb-1 ${m.from === "admin" ? "text-blue-600 text-right" : "text-gray-800"}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded p-2"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Escribir mensaje..."
            />
            <button onClick={sendMessage} className="bg-blue-600 text-white px-3 py-1 rounded">
              Enviar
            </button>
          </div>
          {feedback && <div className="mt-2 text-green-600">{feedback}</div>}
        </div>
      )}
      {!selected && <div className="flex-1 flex items-center justify-center text-gray-500">Selecciona un chat</div>}
    </div>
  );
}
