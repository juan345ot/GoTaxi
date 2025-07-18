import { useEffect, useRef, useState } from "react";
import Loader from "../ui/Loader";
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
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    // Simula carga de chats (cambiar a fetch real)
    setTimeout(() => {
      setChats(mockChats);
      setLoading(false);
    }, 800);
    // FUTURO: conectar a WebSocket aquí (listener de mensajes nuevos)
  }, []);

  useEffect(() => {
    // Scroll automático al último mensaje
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selected]);

  const sendMessage = () => {
    if (!msg.trim() || !selected) return;
    setSending(true);
    // Simulación de envío, reemplazar por llamada real a la API
    setTimeout(() => {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === selected.id
            ? { ...chat, messages: [...chat.messages, { from: "admin", text: msg }] }
            : chat
        )
      );
      setMsg("");
      setSending(false);
      setFeedback("Mensaje enviado");
      setTimeout(() => setFeedback(""), 1500);
    }, 400);
  };

  const handleSelect = (chat) => {
    setSelected(chat);
    setMsg("");
    setFeedback("");
    // Opcional: marcar chat como leído aquí (API)
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/3">
        <h2 className="text-xl font-semibold mb-4">Chats</h2>
        {loading && <div className="flex items-center gap-2"><Loader size={5} />Cargando chats...</div>}
        <ul>
          {chats.map((chat) => (
            <li
              key={chat.id}
              onClick={() => handleSelect(chat)}
              className={`cursor-pointer p-2 rounded mb-2 border ${
                selected?.id === chat.id
                  ? "bg-blue-100 border-blue-500 font-semibold"
                  : "bg-white"
              } hover:bg-blue-50 transition`}
              tabIndex={0}
              aria-label={`Abrir chat con ${chat.user}`}
              onKeyDown={e => { if (e.key === "Enter") handleSelect(chat); }}
            >
              {chat.user}
              <span className="ml-2 text-xs text-gray-400">{chat.messages.length} mensajes</span>
            </li>
          ))}
        </ul>
      </div>
      {selected && (
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg mb-2 font-semibold">
            Chat con {selected.user}
          </h3>
          <div className="border rounded h-56 md:h-48 overflow-y-auto mb-4 bg-white p-2">
            {selected.messages.map((m, i) => (
              <div
                key={i}
                className={`mb-1 ${
                  m.from === "admin"
                    ? "text-blue-600 text-right"
                    : "text-gray-800 text-left"
                }`}
              >
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded p-2"
              value={msg}
              onChange={e => setMsg(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Escribir mensaje..."
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-2"
              disabled={sending || !msg.trim()}
              type="button"
            >
              {sending ? <Loader size={4} /> : "Enviar"}
            </button>
          </div>
          {feedback && (
            <div className="mt-2 text-green-600 bg-green-50 px-2 py-1 rounded text-sm">
              {feedback}
            </div>
          )}
        </div>
      )}
      {!selected && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Selecciona un chat
        </div>
      )}
    </div>
  );
}
