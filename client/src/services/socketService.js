import { io } from "socket.io-client";
import { authFetch } from "./api"; // Secure fetch sending cookies automatically

const SOCKET_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnecting = false;
  }

  async connect() {
    if (this.socket || this.isConnecting) return;
    this.isConnecting = true;

    try {
      // 1. Fetch short-lived socket token securely using httpOnly cookie
      const res = await authFetch("/auth/socket-token");
      const data = await res.json();
      
      if (!res.ok || !data.success || !data.socketToken) {
        console.error("Failed to secure socket token:", data.message);
        this.isConnecting = false;
        return;
      }

      // 2. Connect using the short-lived token
      this.socket = io(SOCKET_URL, {
        auth: { token: data.socketToken },
        withCredentials: true,
        transports: ["websocket", "polling"]
      });

      this.socket.on("connect", () => {
        console.log("Connected to Real-time server securely");
        this.isConnecting = false;
      });

      this.socket.on("connect_error", (err) => {
        console.error("Socket Connection Error:", err.message);
        this.isConnecting = false;
      });

      // Re-register all existing listeners on reconnect
      this.socket.on("reconnect", () => {
        this.listeners.forEach((callback, event) => {
          this.socket.off(event);
          this.socket.on(event, callback);
        });
      });
    } catch (err) {
      console.error("Socket connection failed during token setup:", err.message);
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
  }

  on(event, callback) {
    if (!this.socket) {
        this.listeners.set(event, callback);
        return;
    }
    this.socket.on(event, callback);
    this.listeners.set(event, callback);
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
    this.listeners.delete(event);
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

const socketService = new SocketService();
export default socketService;
