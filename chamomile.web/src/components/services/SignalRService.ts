import * as signalR from "@microsoft/signalr";
import { API_PREFIX } from "../../api/Common";

type EventHandler = (...args: any[]) => void;

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private subscriptions: Record<string, EventHandler[]> = {};

  async startConnection(): Promise<void> {
    if (!this.connection) {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(API_PREFIX + "imageHub",{
          withCredentials:false
        }) // Replace with your actual backend URL
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();
    }

    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      try {
        await this.connection.start();
        console.log("SignalR Connected");
        this.rebindHandlers();
      } catch (err) {
        console.error("SignalR Connection Error: ", err);
      }
    }
  }

  private rebindHandlers(): void {
    if (!this.connection) return;
    for (const [eventName, handlers] of Object.entries(this.subscriptions)) {
      handlers.forEach((handler) => this.connection!.on(eventName, handler));
    }
  }

  subscribe(eventName: string, handler: EventHandler): void {
    if (!this.subscriptions[eventName]) {
      this.subscriptions[eventName] = [];
    }
    this.subscriptions[eventName].push(handler);

    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.on(eventName, handler);
    }
  }

  unsubscribe(eventName: string, handler: EventHandler): void {
    if (this.subscriptions[eventName]) {
      this.subscriptions[eventName] = this.subscriptions[eventName].filter((h) => h !== handler);
      if (this.connection) {
        this.connection.off(eventName, handler);
      }
    }
  }
}

const signalRService = new SignalRService();
export default signalRService;
