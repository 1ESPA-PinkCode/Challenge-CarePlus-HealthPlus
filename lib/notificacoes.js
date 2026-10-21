// lib/notificacoes.js — notificações do celular (enquanto o site está aberto ou em segundo plano)
import { Platform } from "react-native";

const web = () => Platform.OS === "web" && typeof window !== "undefined";

export function notificacoesSuportadas() {
  return web() && "Notification" in window && "serviceWorker" in navigator;
}

export function permissaoNotificacao() {
  return notificacoesSuportadas() ? Notification.permission : "unsupported";
}

export async function registrarServiceWorker() {
  if (!notificacoesSuportadas()) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch (e) {
    return null;
  }
}

export async function pedirPermissaoNotificacao() {
  if (!notificacoesSuportadas()) return "unsupported";
  await registrarServiceWorker();
  try {
    return await Notification.requestPermission();
  } catch (e) {
    return "denied";
  }
}

export async function notificar(titulo, corpo) {
  if (!notificacoesSuportadas() || Notification.permission !== "granted") return false;
  try {
    const reg = (await navigator.serviceWorker.getRegistration()) || (await registrarServiceWorker());
    if (reg) {
      await reg.showNotification(titulo, { body: corpo, icon: "/icon-192.png", badge: "/icon-192.png", tag: "vencedor", vibrate: [200, 100, 200] });
      return true;
    }
    new Notification(titulo, { body: corpo, icon: "/icon-192.png" });
    return true;
  } catch (e) {
    return false;
  }
}
