export type AlertStatus = "ALERTA" | "OK" | "PENDENTE";

export interface CameraFeed {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  status: "ACTIVE" | "OFFLINE" | "ALERT";
  fps: number;
  noiseLevel: number;
}

export interface VerificationLog {
  id: string;
  cameraName: string;
  timestamp: string;
  imageUrl: string;
  status: "ALERTA" | "OK";
  reason: string;
  operator: string;
  sentToWhatsApp?: boolean;
}

export interface SystemStats {
  totalDetections: number;
  realThreats: number;
  falseAlarms: number;
  accuracyRate: number;
  sirenActive: boolean;
  spotlightActive: boolean;
  authoritiesNotified: boolean;
}

export interface WhatsAppSchedule {
  id: string;
  label: string;
  startTime: string; // e.g. "22:00"
  endTime: string;   // e.g. "06:00"
  phoneNumbers: string[]; // List of numbers
  enabled: boolean;
}

export interface DVRAccessDevice {
  id: string;
  deviceName: string;
  addressType: "MAC" | "IP";
  addressValue: string; // e.g. '00:1A:2B:3C:4D:5E' or '192.168.1.102'
  authorized: boolean;
  lastAccessTime?: string;
  // Admin credentials linkage for security authentication
  dvrId?: string;
  dvrUser?: string;
  dvrPassword?: string;
}

export interface SupabaseN8nConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  n8nWebhookUrl: string;
  isConnected: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  camerasCount: string;
  hasN8nSupabase: boolean;
  hasWhatsApp: boolean;
  isPopular: boolean;
}

export interface NDSClient {
  id: string;
  tradingName: string;
  whatsapp: string;
  openTime: string;
  closeTime: string;
  createdAt: string;
  planId?: string;
  planName?: string;
  paymentStatus?: "Pago" | "Pendente" | "Atrasado";
  paymentValue?: string;
  paymentMethod?: "Pix" | "Boleto" | "Cartão" | "Dinheiro";
  dueDate?: string;
}

export interface IntelbrasDVR {
  id: string;
  name: string;
  integrationType: "iSIC Lite" | "Intelbras Cloud";
  addressOrSerial: string; // IP/Domain for iSIC Lite or Serial/Cloud ID for Intelbras Cloud
  port: number;
  user: string;
  password?: string;
  channelsCount: number;
  streamType: "Principal" | "Extra";
  connected: boolean;
  createdAt: string;
}



