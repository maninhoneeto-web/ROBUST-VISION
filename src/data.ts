import { CameraFeed, VerificationLog, WhatsAppSchedule, DVRAccessDevice, SubscriptionPlan } from "./types";

// Import the generated images to let Vite hash them correctly
import cctvIntruder from "./assets/images/cctv_intruder_1780266378898.png";
import cctvCat from "./assets/images/cctv_cat_1780266393280.png";
import cctvWindyTree from "./assets/images/cctv_windy_tree_1780266410780.png";
import robustVisionLogo from "./assets/images/robust_vision_logo_1780267171964.png";

export { robustVisionLogo };

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "plan-bronze",
    name: "Bronze Monitor",
    price: "R$ 149",
    period: "mês",
    camerasCount: "Até 4 Câmeras CFTV",
    hasN8nSupabase: false,
    hasWhatsApp: true,
    isPopular: false,
  },
  {
    id: "plan-silver",
    name: "Robust Choice (Prata)",
    price: "R$ 299",
    period: "mês",
    camerasCount: "Até 12 Câmeras CFTV",
    hasN8nSupabase: true,
    hasWhatsApp: true,
    isPopular: true,
  },
  {
    id: "plan-gold",
    name: "Visionary Enterprise (Ouro)",
    price: "R$ 599",
    period: "mês",
    camerasCount: "Câmeras Ilimitadas",
    hasN8nSupabase: true,
    hasWhatsApp: true,
    isPopular: false,
  }
];

export const INITIAL_FEEDS: CameraFeed[] = [
  {
    id: "cam-01",
    name: "Câmera 01 - Área Parqueada",
    location: "Estacionamento Leste",
    imageUrl: cctvWindyTree,
    status: "ACTIVE",
    fps: 15,
    noiseLevel: 12,
  },
  {
    id: "cam-02",
    name: "Câmera 02 - Muro Secundário",
    location: "Perímetro Oeste",
    imageUrl: cctvIntruder,
    status: "ALERT",
    fps: 18,
    noiseLevel: 15,
  },
  {
    id: "cam-03",
    name: "Câmera 03 - Jardim Tras",
    location: "Quintal Residencial",
    imageUrl: cctvCat,
    status: "ACTIVE",
    fps: 12,
    noiseLevel: 8,
  },
  {
    id: "cam-04",
    name: "Câmera 04 - Entrada Garagem",
    location: "Portão Frontal",
    imageUrl: "", // Handled as blank/webcam or customizable placeholder feed
    status: "ACTIVE",
    fps: 24,
    noiseLevel: 5,
  },
];

export const INITIAL_LOGS: VerificationLog[] = [
  {
    id: "log-1",
    cameraName: "Câmera 03 - Jardim Tras",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    imageUrl: cctvCat,
    status: "OK",
    reason: "Gato doméstico detectado caminhando sobre o muro de forma mansa. Nenhuma ameaça humana presente.",
    operator: "AUDITOR_NDS",
    sentToWhatsApp: false, // Triggered outside defined schedule or animal was ignored
  },
  {
    id: "log-2",
    cameraName: "Câmera 01 - Área Parqueada",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    imageUrl: cctvWindyTree,
    status: "OK",
    reason: "Rajadas de vento balançando galhos de arbustros. Sombras em movimento sem presença humana.",
    operator: "SISTEMA_AUTO",
    sentToWhatsApp: false,
  },
];

export const INITIAL_SCHEDULES: WhatsAppSchedule[] = [
  {
    id: "sched-1",
    label: "Monitoramento Noturno Principal",
    startTime: "22:00",
    endTime: "06:00",
    phoneNumbers: ["+5511987654321", "+5511999998888"],
    enabled: true,
  },
  {
    id: "sched-2",
    label: "Plantão de Final de Semana",
    startTime: "08:00",
    endTime: "18:00",
    phoneNumbers: ["+5511911112222"],
    enabled: false,
  },
];

export const INITIAL_DVR_DEVICES: DVRAccessDevice[] = [
  {
    id: "dev-1",
    deviceName: "Smartphone Portaria Principal",
    addressType: "MAC",
    addressValue: "3C:5E:56:4C:12:F1",
    authorized: true,
    lastAccessTime: new Date(Date.now() - 120000).toISOString(), // 2 min ago
  },
  {
    id: "dev-2",
    deviceName: "Notebook Supervisor TI",
    addressType: "IP",
    addressValue: "192.168.100.41",
    authorized: true,
    lastAccessTime: new Date(Date.now() - 600000).toISOString(), // 10 min ago
  },
  {
    id: "dev-3",
    deviceName: "Dispositivo Não Identificado",
    addressType: "IP",
    addressValue: "187.32.4.92",
    authorized: false,
    lastAccessTime: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
  },
];

