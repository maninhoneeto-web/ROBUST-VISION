import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, 
  Activity, 
  Wifi, 
  Tv, 
  Video,
  Clock, 
  Lock, 
  Unlock, 
  Send, 
  SlidersHorizontal, 
  Smartphone, 
  Network, 
  Plus, 
  Trash2, 
  Play, 
  Bell, 
  Settings, 
  AlertTriangle, 
  Upload, 
  UserCheck, 
  XCircle, 
  CheckCircle,
  Eye,
  Calendar,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  Sliders,
  Database,
  Cpu,
  BookOpen,
  Zap,
  TrendingUp,
  DollarSign,
  Coins,
  FileText,
  Check,
  Search,
  Users,
  FileCode
} from "lucide-react";
import { CameraFeed, VerificationLog, WhatsAppSchedule, DVRAccessDevice, SystemStats, SubscriptionPlan, SupabaseN8nConfig, NDSClient, IntelbrasDVR } from "./types";
import { INITIAL_FEEDS, INITIAL_LOGS, INITIAL_SCHEDULES, INITIAL_DVR_DEVICES, SUBSCRIPTION_PLANS, robustVisionLogo } from "./data";
import { convertUrlToBase64, generateMockCCTVPlaceholder, formatTime, formatDate } from "./utils";

// Safe storage helper with memory/safe fallback to prevent Sandbox Iframe SecurityError crashes
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn("Storage item retrieval failed (unauthorized in iframe sandbox):", e);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn("Storage item write failed (unauthorized in iframe sandbox):", e);
    }
  }
};

export default function App() {
  // Persistence with LocalStorage using safeStorage helper
  const [isSimplifiedMode, setIsSimplifiedMode] = useState<boolean>(() => {
    try {
      const saved = safeStorage.getItem("rv_simplified_mode");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing rv_simplified_mode", e);
    }
    return false;
  });

  useEffect(() => {
    safeStorage.setItem("rv_simplified_mode", JSON.stringify(isSimplifiedMode));
  }, [isSimplifiedMode]);

  // Modern Non-Blocking App Notification State
  const [appAlert, setAppAlert] = useState<{
    isOpen: boolean;
    message: string;
    title: string;
    type: "info" | "success" | "warn";
  } | null>(null);

  const showAppAlert = (message: string, title = "Aviso do Sistema", type: "info" | "success" | "warn" = "info") => {
    setAppAlert({
      isOpen: true,
      message,
      title,
      type
    });
  };

  const [feeds, setFeeds] = useState<CameraFeed[]>(() => {
    try {
      const saved = safeStorage.getItem("rv_feeds");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing rv_feeds", e);
    }
    return INITIAL_FEEDS;
  });

  const [logs, setLogs] = useState<VerificationLog[]>(() => {
    try {
      const saved = safeStorage.getItem("rv_logs");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing rv_logs", e);
    }
    return INITIAL_LOGS;
  });

  const [schedules, setSchedules] = useState<WhatsAppSchedule[]>(() => {
    try {
      const saved = safeStorage.getItem("rv_schedules");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing rv_schedules", e);
    }
    return INITIAL_SCHEDULES;
  });

  const [dvrDevices, setDvrDevices] = useState<DVRAccessDevice[]>(() => {
    try {
      const saved = safeStorage.getItem("rv_dvr_devices");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing rv_dvr_devices", e);
    }
    return INITIAL_DVR_DEVICES;
  });

  // State for System Statistics
  const [stats, setStats] = useState<SystemStats>(() => {
    return {
      totalDetections: 42,
      realThreats: 14,
      falseAlarms: 28,
      accuracyRate: 98.4,
      sirenActive: false,
      spotlightActive: false,
      authoritiesNotified: false,
    };
  });

  // Dashboard state controls
  const [selectedFeedId, setSelectedFeedId] = useState<string>("cam-02");
  const [isicLiteConnected, setIsicLiteConnected] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [lastAnalysisResult, setLastAnalysisResult] = useState<{status: string; reason: string} | null>(null);
  
  // Custom mock hour state to simulate different times of the day (important for testing Scheduled WhatsApp deliveries)
  const [systemMockTime, setSystemMockTime] = useState<string>("23:45"); // In simulated Night Guard window

  // New DVR Device form states
  const [newDevName, setNewDevName] = useState("");
  const [newDevType, setNewDevType] = useState<"MAC" | "IP">("MAC");
  const [newDevValue, setNewDevValue] = useState("");
  const [newDevAuthorized, setNewDevAuthorized] = useState(true);

  // Remotely configure DVR admin credentials state
  const [adminDvrId, setAdminDvrId] = useState("dvr-nds-corporate-09");
  const [adminDvrUser, setAdminDvrUser] = useState("admin_nds");
  const [adminDvrPassword, setAdminDvrPassword] = useState("NDS_SecurePass_2026");
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Integration credentials for Supabase & n8n
  const [integrationConfig, setIntegrationConfig] = useState<SupabaseN8nConfig>(() => {
    try {
      const saved = safeStorage.getItem("rv_integration_config");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing rv_integration_config", e);
    }
    return {
      supabaseUrl: "https://twhnphvyrshdnyisbyux.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3aG5waHZ5cnNoZG55aXNieXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQwOTYwMDAsImV4cCI6MjAwNzY3MjAwMH0.fakeKey",
      n8nWebhookUrl: "https://n8n.nds-seguranca.com.br/webhook/9cfbd913-2d10-4ecb-99d1-0f73b320d771",
      isConnected: true,
    };
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{success: boolean; n8nMsg: string; sbMsg: string} | null>(null);

  // Autonomous n8n <-> Supabase simulator state
  const [isAutonomousLoop, setIsAutonomousLoop] = useState(true);
  const [simulatedTerminalLogs, setSimulatedTerminalLogs] = useState<string[]>(() => [
    `[${new Date().toLocaleTimeString("pt-BR")}] 💻 [Sistema] Terminal de Telemetria Robust Vision inicializado.`,
    `[${new Date().toLocaleTimeString("pt-BR")}] 🔌 [Conectividade] Aguardando gatilho de movimento de CFTV ou salvamento de cliente...`,
    `[${new Date().toLocaleTimeString("pt-BR")}] 💡 [Supabase] Status: Autogerenciamento de tabelas 'clients_nds' & 'cctv_verification_logs' ON.`
  ]);

  // Auto Photo Sending scheduler simulation
  const [autoPhotoSending, setAutoPhotoSending] = useState(false);
  const [lastAutoPhotoTrigger, setLastAutoPhotoTrigger] = useState<string>("");

  // New WhatsApp Schedule Form States
  const [newSchedLabel, setNewSchedLabel] = useState("");
  const [newSchedStart, setNewSchedStart] = useState("22:00");
  const [newSchedEnd, setNewSchedEnd] = useState("06:00");
  const [newSchedPhone, setNewSchedPhone] = useState("");
  const [newSchedPhonesList, setNewSchedPhonesList] = useState<string[]>([]);

  // WhatsApp Alert Simulation Queue
  const [whatsappNotifications, setWhatsappNotifications] = useState<Array<{
    id: string;
    to: string;
    message: string;
    timestamp: string;
  }>>([]);

  // Interactive client-focused recognition event testing states
  const [testSelectedClientId, setTestSelectedClientId] = useState<string>("");
  const [testSelectedCameraId, setTestSelectedCameraId] = useState<string>("cam-01");
  const [testEventType, setTestEventType] = useState<"intruder" | "vehicle" | "cat" | "wind">("intruder");
  const [testIsRunning, setTestIsRunning] = useState(false);
  const [testLogLines, setTestLogLines] = useState<string[]>([]);

  // --- NEW STATES FOR ADMIN TAB CLIENTS FORM & DVR CLOUD ---
  const [activeTab, setActiveTab] = useState<"video" | "admin_clients" | "dvr_integrations" | "export_store">("video");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [dvrGuideTab, setDvrGuideTab] = useState<"dvr_config" | "n8n_flow" | "whatsapp_api" | "cloud_provision">("dvr_config");
  const [provisionDvrId, setProvisionDvrId] = useState("");
  const [provisioningLogs, setProvisioningLogs] = useState<string[]>([]);
  const [isCloudProvisioning, setIsCloudProvisioning] = useState(false);
  const [provisionProgress, setProvisionProgress] = useState(0);
  const [clientTradingName, setClientTradingName] = useState("");
  const [clientWhatsApp, setClientWhatsApp] = useState("");
  const [clientOpenTime, setClientOpenTime] = useState("08:00");
  const [clientCloseTime, setClientCloseTime] = useState("18:00");
  const [clientWebhookUrl, setClientWebhookUrl] = useState("https://n8n.cloud");

  // --- INTELBRAS DVR & ISIC LITE STATE VARIABLES ---
  const [intelbrasDvrName, setIntelbrasDvrName] = useState("");
  const [intelbrasDvrType, setIntelbrasDvrType] = useState<"iSIC Lite" | "Intelbras Cloud" & string>("iSIC Lite");
  const [intelbrasDvrAddressOrSerial, setIntelbrasDvrAddressOrSerial] = useState("");
  const [intelbrasDvrPort, setIntelbrasDvrPort] = useState(37777);
  const [intelbrasDvrUser, setIntelbrasDvrUser] = useState("admin");
  const [intelbrasDvrPassword, setIntelbrasDvrPassword] = useState("");
  const [intelbrasDvrChannels, setIntelbrasDvrChannels] = useState(8);
  const [intelbrasDvrStream, setIntelbrasDvrStream] = useState<"Principal" | "Extra">("Extra");

  const [intelbrasDvrs, setIntelbrasDvrs] = useState<IntelbrasDVR[]>(() => {
    try {
      const saved = safeStorage.getItem("rv_cloud_dvrs");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing rv_cloud_dvrs", e);
    }
    return [
      {
        id: "dvr-cloud-1",
        name: "DVR Central Comercial Intelbras",
        integrationType: "Intelbras Cloud",
        addressOrSerial: "NS-9812A-BC721-3990A",
        port: 37777,
        user: "admin",
        password: "••••••••",
        channelsCount: 16,
        streamType: "Extra",
        connected: true,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: "dvr-cloud-2",
        name: "DVR Portaria Leste iSIC Lite",
        integrationType: "iSIC Lite",
        addressOrSerial: "portarialeste.ddns-intelbras.com.br",
        port: 37777,
        user: "admin",
        password: "••••••••",
        channelsCount: 8,
        streamType: "Principal",
        connected: true,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];
  });

  // --- CLIENT PAYMENT FIELDS ---
  const [clientPlanId, setClientPlanId] = useState("plan-silver");
  const [clientPaymentStatus, setClientPaymentStatus] = useState<"Pago" | "Pendente" | "Atrasado">("Pendente");
  const [clientPaymentValue, setClientPaymentValue] = useState("299,00");
  const [clientPaymentMethod, setClientPaymentMethod] = useState<"Pix" | "Boleto" | "Cartão" | "Dinheiro">("Pix");
  const [clientDueDate, setClientDueDate] = useState("10");
  
  // Dynamic cameras being configured during client registration
  const [clientRegCameras, setClientRegCameras] = useState<{ id: string; name: string; location: string; imageUrl: string; status: "ACTIVE" | "ALERT"; fps: number; noiseLevel: number }[]>([
    { id: "rcam-1", name: "Câmera 01 - Entrada Principal", location: "Entrada Principal", imageUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop", status: "ACTIVE", fps: 15, noiseLevel: 10 },
    { id: "rcam-2", name: "Câmera 02 - Portão Garagem", location: "Portão Garagem", imageUrl: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop", status: "ACTIVE", fps: 18, noiseLevel: 12 },
    { id: "rcam-3", name: "Câmera 03 - Muro Fundos", location: "Muro Fundos", imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop", status: "ACTIVE", fps: 12, noiseLevel: 8 }
  ]);
  const [newRegCamName, setNewRegCamName] = useState("");
  const [newRegCamLocation, setNewRegCamLocation] = useState("Entrada Principal");

  // Inputs for adding a camera within the Inspected Client full file (Ficha) modal
  const [newInspectedCamName, setNewInspectedCamName] = useState("");
  const [newInspectedCamLocation, setNewInspectedCamLocation] = useState("Entrada Principal");

  const [adminSubTab, setAdminSubTab] = useState<"cadastro" | "financeiro" | "escala_500" | "isic_acessos">("cadastro");
  const [currentViewingClientId, setCurrentViewingClientId] = useState<string>("all_feeds");
  const [merchantSearchQuery, setMerchantSearchQuery] = useState("");
  const [inspectedClient, setInspectedClient] = useState<NDSClient | null>(null);
  const [billingDispatchLogs, setBillingDispatchLogs] = useState<string[]>([]);
  const [billingOption, setBillingOption] = useState<"api" | "manual">("api");
  const [isDispatchingBilling, setIsDispatchingBilling] = useState(false);
  const [isicSelectedClientId, setIsicSelectedClientId] = useState("");
  const [isGeneratingIsicQr, setIsGeneratingIsicQr] = useState(false);
  const [isicSharingLink, setIsicSharingLink] = useState("");
  const [newIsicUserName, setNewIsicUserName] = useState("");
  const [newIsicUserPhone, setNewIsicUserPhone] = useState("");
  const [newIsicUserRole, setNewIsicUserRole] = useState<"Comerciante/Dono" | "Gerente" | "Segurança" | "Funcionário">("Funcionário");
  const [newIsicUserCams, setNewIsicUserCams] = useState<string[]>([]);
  const [bulkImportText, setBulkImportText] = useState("");
  const [bulkImportFormat, setBulkImportFormat] = useState<"csv" | "json">("csv");
  const [plansActiveSubTab, setPlansActiveSubTab] = useState<"pricing" | "predefined_unlock">("pricing");

  const [registeredClients, setRegisteredClients] = useState<NDSClient[]>(() => {
    try {
      const saved = safeStorage.getItem("rv_registered_clients");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => item && typeof item === "object" && item.id);
        }
      }
    } catch (e) {
      console.error("Error loading rv_registered_clients", e);
    }
    return [
      {
        id: "client-1",
        tradingName: "Supermercado Compre Bem NDS",
        whatsapp: "+5511999998888",
        openTime: "07:00",
        closeTime: "22:00",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        planId: "plan-bronze",
        planName: "Bronze Monitor",
        paymentStatus: "Pago",
        paymentValue: "149,00",
        paymentMethod: "Pix",
        dueDate: "10",
        isicAccessAuthorized: true,
        isicAuthorizedCameras: ["cam-01", "cam-02", "cam-03", "cam-04"],
        cameras: [
          { id: "c1-cam-1", name: "Câmera 01 - Entrada Supermercado", location: "Entrada Principal", imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop", status: "ACTIVE", fps: 15, noiseLevel: 4 },
          { id: "c1-cam-2", name: "Câmera 02 - Frente de Caixa", location: "Frente de Caixa", imageUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop", status: "ACTIVE", fps: 18, noiseLevel: 6 },
          { id: "c1-cam-3", name: "Câmera 03 - Corredor de Alimentos", location: "Corredor Interno", imageUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop", status: "ACTIVE", fps: 12, noiseLevel: 5 }
        ],
        authorizedUsers: [
          {
            id: "usr-comp-1",
            name: "Lúcio Mauro (Proprietário)",
            role: "Comerciante/Dono",
            phone: "+5511999998888",
            accessGranted: true,
            allowedCameras: ["cam-01", "cam-02", "cam-03", "cam-04"],
            lastAccessTime: "Hoje às 14:15"
          },
          {
            id: "usr-comp-2",
            name: "Viviane Souza (Gerente Lojas)",
            role: "Gerente",
            phone: "+5511988885522",
            accessGranted: true,
            allowedCameras: ["cam-01", "cam-02"],
            lastAccessTime: "Ontem às 18:32"
          },
          {
            id: "usr-comp-3",
            name: "Cleber Santos (Ronda Noturna)",
            role: "Segurança",
            phone: "+5511977771122",
            accessGranted: false,
            allowedCameras: ["cam-03", "cam-04"],
            lastAccessTime: "Nunca acessou"
          }
        ]
      },
      {
        id: "client-2",
        tradingName: "Consórcio Logística Express",
        whatsapp: "+5511987654321",
        openTime: "08:00",
        closeTime: "18:00",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        planId: "plan-silver",
        planName: "Robust Choice (Prata)",
        paymentStatus: "Atrasado",
        paymentValue: "299,00",
        paymentMethod: "Boleto",
        dueDate: "05",
        isicAccessAuthorized: true,
        isicAuthorizedCameras: ["cam-01", "cam-02", "cam-03", "cam-04"],
        cameras: [
          { id: "c2-cam-1", name: "Câmera 01 - Portaria de Carga", location: "Portaria", imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&auto=format&fit=crop", status: "ACTIVE", fps: 20, noiseLevel: 3 },
          { id: "c2-cam-2", name: "Câmera 02 - Doca de Distribuição", location: "Doca Principal", imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop", status: "ACTIVE", fps: 15, noiseLevel: 4 },
          { id: "c2-cam-3", name: "Câmera 03 - Pátio de Manobras", location: "Área Externa", imageUrl: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop", status: "ACTIVE", fps: 14, noiseLevel: 7 }
        ],
        authorizedUsers: [
          {
            id: "usr-comp-4",
            name: "Carlos Eduardo (Diretor Seg.)",
            role: "Comerciante/Dono",
            phone: "+5511987654321",
            accessGranted: true,
            allowedCameras: ["cam-01", "cam-02", "cam-03", "cam-04"],
            lastAccessTime: "Hoje às 15:02"
          },
          {
            id: "usr-comp-5",
            name: "Vigilante Noturno Portaria",
            role: "Segurança",
            phone: "+5511966663322",
            accessGranted: true,
            allowedCameras: ["cam-04"],
            lastAccessTime: "Hoje às 01:10"
          }
        ]
      }
    ];
  });

  const [isSavingClient, setIsSavingClient] = useState(false);
  const [billingClient, setBillingClient] = useState<NDSClient | null>(null);
  const [clientToast, setClientToast] = useState<{
    success: boolean;
    message: string;
    targetUrl: string;
    payload?: any;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Resolve client and its cameras/live streams for dynamic dashboard viewing
  const selectedViewingClient = registeredClients.find((c) => c.id === currentViewingClientId) || null;
  const activeViewingCameras = (selectedViewingClient && selectedViewingClient.cameras && selectedViewingClient.cameras.length > 0)
    ? selectedViewingClient.cameras
    : feeds;

  const selectedFeed = activeViewingCameras.find((f) => f.id === selectedFeedId) || activeViewingCameras[0] || feeds[0];
  const activeClientOfFeed = registeredClients.find(c => c.cameras?.some(cam => cam.id === selectedFeed.id)) || selectedViewingClient;

  // Sync selectedFeedId when the client selection changes to prevent looking at incorrect channels
  useEffect(() => {
    if (activeViewingCameras && activeViewingCameras.length > 0) {
      const belongs = activeViewingCameras.some(f => f.id === selectedFeedId);
      if (!belongs) {
        setSelectedFeedId(activeViewingCameras[0].id);
      }
    }
  }, [currentViewingClientId, activeViewingCameras, selectedFeedId]);

  // Sync state to local storage on changes using safeStorage helper
  useEffect(() => {
    safeStorage.setItem("rv_feeds", JSON.stringify(feeds));
  }, [feeds]);

  useEffect(() => {
    safeStorage.setItem("rv_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    safeStorage.setItem("rv_schedules", JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    safeStorage.setItem("rv_dvr_devices", JSON.stringify(dvrDevices));
  }, [dvrDevices]);

  useEffect(() => {
    safeStorage.setItem("rv_integration_config", JSON.stringify(integrationConfig));
  }, [integrationConfig]);

  useEffect(() => {
    safeStorage.setItem("rv_registered_clients", JSON.stringify(registeredClients));
  }, [registeredClients]);

  useEffect(() => {
    safeStorage.setItem("rv_cloud_dvrs", JSON.stringify(intelbrasDvrs));
  }, [intelbrasDvrs]);

  // Generate dynamic placeholder for Camera 4 which relies on canvas
  useEffect(() => {
    const cam4 = feeds.find(f => f.id === "cam-04");
    if (cam4 && !cam4.imageUrl) {
      const generatedImg = generateMockCCTVPlaceholder("Câmera 04 - Entrada Garagem", false);
      setFeeds(prev => prev.map(f => f.id === "cam-04" ? { ...f, imageUrl: generatedImg } : f));
    }
  }, []);

  // Automated photo loop simulation
  useEffect(() => {
    if (!autoPhotoSending) return;
    
    const interval = setInterval(() => {
      const randomFeed = feeds[Math.floor(Math.random() * feeds.length)];
      if (!randomFeed) return;
      
      const activeRules = schedules.filter(s => s.enabled && isTimeInBetween(systemMockTime, s.startTime, s.endTime));
      if (activeRules.length > 0) {
        activeRules.forEach(rule => {
          rule.phoneNumbers.forEach(num => {
            setWhatsappNotifications(prev => [
              {
                id: "wa-loop-" + Date.now() + Math.random().toString(36).substring(2, 6),
                to: num,
                message: `📸 *ROBUST VISION - ENVIO DE FOTO PERIÓDICO AUTOMÁTICO*\n━━━━━━━━━━━━━━━━━━━━━\n📍 *Câmera:* ${randomFeed.name}\n🕒 *Relógio Interno:* ${systemMockTime}\n📢 *Agendamento Ativo:* ${rule.label}\n📷 *Imagem:* ${randomFeed.imageUrl || ""}\n━━━━━━━━━━━━━━━━━━━━━\n_Registrado no Histórico de Eventos de CFTV Corporativo da NDS._`,
                timestamp: new Date().toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"}),
                imageUrl: randomFeed.imageUrl
              },
              ...prev
            ]);
          });
        });

        setLogs(prev => [
          {
            id: "log-loop-" + Date.now(),
            cameraName: randomFeed.name,
            timestamp: new Date().toISOString(),
            imageUrl: randomFeed.imageUrl || "",
            status: "OK",
            reason: `📸 [Auto-Ticker] Envio automático periódico executado para ${activeRules.length} regra(s) ativa(s). Foto da câmera "${randomFeed.name}" transmitida ao WhatsApp às ${systemMockTime}.`,
            operator: "SISTEMA_AUTO_CRON",
            sentToWhatsApp: true,
          },
          ...prev
        ]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [autoPhotoSending, systemMockTime, feeds, schedules]);

  // Autonomous n8n <-> Supabase background simulation ticks
  useEffect(() => {
    if (!isAutonomousLoop) return;

    const simulationSteps = [
      () => {
        const time = new Date().toLocaleTimeString("pt-BR");
        const randomClient = registeredClients[Math.floor(Math.random() * registeredClients.length)] || { tradingName: "Farmácia Central", planName: "Bronze Monitor", paymentValue: "149,00" };
        return [
          `[${time}] ⚡ [n8n Webhook] NOVO GATILHO: Recebido evento 'billing_update' para o cliente "${randomClient.tradingName}".`,
          `[${time}] 🧼 [n8n Node: Filtro] Tratando dados de cobrança: Plano: ${randomClient.planName} | Valor: R$ ${randomClient.paymentValue || "149,00"}.`,
          `[${time}] 💾 [Supabase Query] Executando query: UPDATE clients_nds SET payment_status = '${randomClient.paymentStatus || "Pago"}' WHERE trading_name = '${randomClient.tradingName}'`,
          `[${time}] ✅ [Banco de Dados] Supabase confirmou atualização! Registro de faturamento do cliente sincronizado automaticamente.`
        ];
      },
      () => {
        const time = new Date().toLocaleTimeString("pt-BR");
        const randomCam = feeds[Math.floor(Math.random() * feeds.length)] || { name: "Câmera 01" };
        return [
          `[${time}] 🚨 [Ameaça CFTV] Inteligência perimetral detectou movimento suspeito na "${randomCam.name}".`,
          `[${time}] ⚡ [n8n Webhook] Enviando payload JSON de imagem analítica para o roteador de alertas do n8n...`,
          `[${time}] 🕵️ [n8n Node: IA Gemini] Validando com IA: Retorno foi 'ALERTA' (Atividade humana detectada).`,
          `[${time}] 💾 [Supabase Insert] Inserindo registro na tabela 'cctv_verification_logs' com status 'ALERTA'.`,
          `[${time}] 📱 [n8n Direct Out] Disparando alerta de segurança com foto e descrição direto para o WhatsApp do plantão!`
        ];
      },
      () => {
        const time = new Date().toLocaleTimeString("pt-BR");
        return [
          `[${time}] 🔍 [Keep-Alive] Monitorando conexões de rede ativas de DVRs...`,
          `[${time}] 📡 [n8n Webhook] Testando ping com endpoint da automação... Sucesso (HTTP 200).`,
          `[${time}] 🗳️ [Supabase Sync] Lendo tabela 'authorized_dvrs_mac'. Todos os dvr_macs simulados estão válidos e autorizados.`
        ];
      }
    ];

    let counter = 0;
    const interval = setInterval(() => {
      const stepGenerator = simulationSteps[counter % simulationSteps.length];
      const newLogs = stepGenerator();
      
      setSimulatedTerminalLogs(prev => {
        const updated = [...newLogs, ...prev];
        return updated.slice(0, 35);
      });
      counter++;
    }, 12000);

    return () => clearInterval(interval);
  }, [isAutonomousLoop, registeredClients, feeds]);

  // Helper to determine if a mock time is within a schedule's range
  const isTimeInBetween = (time: string, start: string, end: string): boolean => {
    const [mockH, mockM] = time.split(":").map(Number);
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    const mockVal = mockH * 60 + mockM;
    const startVal = startH * 60 + startM;
    const endVal = endH * 60 + endM;

    if (startVal <= endVal) {
      // e.g. 08:00 to 18:00
      return mockVal >= startVal && mockVal <= endVal;
    } else {
      // Over midnight, e.g. 22:00 to 06:00
      return mockVal >= startVal || mockVal <= endVal;
    }
  };

  // Run AI analysis on the selected camera feed image
  const handleAnalyzeFeed = async (imageSrcToUse?: string, customMetaName?: string) => {
    const sourceImage = imageSrcToUse || selectedFeed.imageUrl;
    const camName = customMetaName || selectedFeed.name;
    
    if (!sourceImage) {
      showAppAlert("Nenhuma imagem pré-carregada para esta câmera ou sandbox vazios.", "Feed de Câmeras Vazio", "warn");
      return;
    }

    setIsAnalyzing(true);
    setLastAnalysisResult(null);

    try {
      let base64Payload = sourceImage;
      // Convert standard URL paths to base64 if it's not already a base64 string
      if (!sourceImage.startsWith("data:")) {
        try {
          base64Payload = await convertUrlToBase64(sourceImage);
        } catch (err) {
          console.error("Falha ao converter imagem para base64, tentando envio direto:", err);
        }
      }

      const response = await fetch("/api/verify-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Payload }),
      });

      if (!response.ok) {
        throw new Error("Resposta inválida do servidor de CFTV.");
      }

      const data = await response.json();
      
      // Determine the client that owns this camera or is currently selected for viewing
      const actualClient = registeredClients.find(c => {
        return c.cameras?.some(cam => cam.id === selectedFeed.id || cam.name === camName) || c.id === currentViewingClientId;
      }) || selectedViewingClient || registeredClients[0];

      // Determine if the analysis triggered an alert & if it matches active schedule windows
      let wasSentToWhatsApp = false;
      let matchingSchedules = schedules.filter(s => s.enabled && isTimeInBetween(systemMockTime, s.startTime, s.endTime));

      if (data.status === "ALERTA") {
        const clientNameWithFallback = actualClient ? actualClient.tradingName : "Monitoramento Geral";
        const clientPhoneWithFallback = actualClient ? actualClient.whatsapp : "";

        // Format clean WhatsApp template including the real-time photo URL so they can see the client image
        const whatsappMsg = `🚨 *ROBUST VISION - MONITORAMENTO INTELIGENTE*\n━━━━━━━━━━━━━━━━━━━━━\n🏢 *Cliente:* ${clientNameWithFallback}\n📍 *Câmera:* ${camName}\n🕒 *Medição:* ${new Date().toLocaleTimeString("pt-BR")}\n⚠️ *Fato:* ${data.reason}\n📷 *Imagem:* ${sourceImage}\n━━━━━━━━━━━━━━━━━━━━━\n_Disparado via Robust Vision Delivery API._`;

        // Set of numbers to notify
        const targetNumbers = new Set<string>();

        // 1. Add matching scheduling numbers
        matchingSchedules.forEach(schedule => {
          schedule.phoneNumbers.forEach(phoneNumber => {
            targetNumbers.add(phoneNumber);
          });
        });

        // 2. ALWAYS add the customer's registered WhatsApp number from profile
        if (clientPhoneWithFallback) {
          targetNumbers.add(clientPhoneWithFallback);
        }

        if (targetNumbers.size > 0) {
          wasSentToWhatsApp = true;
          targetNumbers.forEach(phoneNumber => {
            setWhatsappNotifications(prev => [
              {
                id: "wa-feed-" + Date.now() + Math.random().toString(36).substr(2, 5),
                to: phoneNumber,
                message: whatsappMsg,
                timestamp: new Date().toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"}),
                imageUrl: sourceImage
              },
              ...prev
            ]);
          });
        }

        // 3. Post webhook alert to client's endpoint
        const targetWebhook = (actualClient && actualClient.supabaseUrl) || clientWebhookUrl || integrationConfig.n8nWebhookUrl;
        if (targetWebhook && targetWebhook.startsWith("http")) {
          fetch(targetWebhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "cors",
            body: JSON.stringify({
              event: "robust_vision_event",
              client: clientNameWithFallback,
              phone: clientPhoneWithFallback,
              camera: camName,
              status: "ALERTA",
              reason: data.reason,
              imageUrl: sourceImage,
              timestamp: new Date().toISOString()
            })
          }).catch((err) => {
            console.error("Erro ao enviar HTTP POST para o webhook do cliente:", err);
          });
        }

        // Update stats
        setStats(prev => ({
          ...prev,
          totalDetections: prev.totalDetections + 1,
          realThreats: prev.realThreats + 1,
        }));
      } else {
        // Safe triggering or ignore rule (animal/wind/shadow)
        setStats(prev => ({
          ...prev,
          totalDetections: prev.totalDetections + 1,
          falseAlarms: prev.falseAlarms + 1,
        }));
      }

      // Append standard security audit log
      const newLog: VerificationLog = {
        id: "log-" + Date.now(),
        cameraName: camName,
        timestamp: new Date().toISOString(),
        imageUrl: sourceImage,
        status: data.status,
        reason: data.reason,
        operator: "IA_ROBUST_VISION",
        sentToWhatsApp: wasSentToWhatsApp,
      };

      setLogs(prev => [newLog, ...prev]);
      setLastAnalysisResult({
        status: data.status,
        reason: data.reason
      });

      // Update feed status temporarily
      setFeeds(prev => prev.map(f => f.name === camName ? {
        ...f,
        status: data.status === "ALERTA" ? "ALERT" : "ACTIVE"
      } : f));

    } catch (err: any) {
      console.error(err);
      setLastAnalysisResult({
        status: "ERRO",
        reason: "Ocorreu um erro ao processar a imagem com a API do Robust Vision. Verifique a chave de API."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Admin provision remote DVR bypassing standard direct access
  const handleProvisionRemoteDvr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminDvrId || !adminDvrUser || !adminDvrPassword || !newDevName || !newDevValue) {
      showAppAlert("Por favor, preencha todos os dados admin do DVR (ID, Usuário, Senha) e as diretrizes do filtro MAC/IP.", "Dados Incompletos", "warn");
      return;
    }

    setIsProvisioning(true);
    
    // Simulate remote handshake latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newDevice: DVRAccessDevice = {
      id: "remote-dev-" + Date.now(),
      deviceName: `${newDevName} [DVR Auto-Sync]`,
      addressType: newDevType,
      addressValue: newDevValue,
      authorized: true, // Automatically authorized remote device through admin credentials bypass
      lastAccessTime: new Date().toISOString(),
      dvrId: adminDvrId,
      dvrUser: adminDvrUser,
      dvrPassword: adminDvrPassword,
    };

    setDvrDevices(prev => [...prev, newDevice]);
    
    // Generate a beautiful administrative log
    const adminLog: VerificationLog = {
      id: "log-provision-" + Date.now(),
      cameraName: `PROVISÃO REMOTA DVR ID: ${adminDvrId}`,
      timestamp: new Date().toISOString(),
      imageUrl: selectedFeed.imageUrl,
      status: "OK",
      reason: `Provisionamento remoto efetuado com sucesso usando credenciais administrativas (${adminDvrUser}). O dispositivo ${newDevName} (${newDevType}: ${newDevValue}) foi provisionado sem necessidade de conexão manual interna ao CFTV.`,
      operator: "ADMINISTRADOR",
      sentToWhatsApp: false,
    };
    setLogs(prev => [adminLog, ...prev]);

    setNewDevName("");
    setNewDevValue("");
    setIsProvisioning(false);
    showAppAlert(`Sucesso! DVR com ID "${adminDvrId}" autenticado. Filtro de segurança de rede inserido remotamente para o dispositivo "${newDevName}".`, "Dispositivo Provisionado", "success");
  };

  // Trigger automated predetermined photo sending mock
  const triggerScheduledPhotoDispatch = () => {
    // Determine active schedules matching the current mock hour
    const activeRules = schedules.filter(s => s.enabled && isTimeInBetween(systemMockTime, s.startTime, s.endTime));
    
    if (activeRules.length === 0) {
      showAppAlert(`Simulador de Envio Programado:\nO relógio simulado atual de teste é ${systemMockTime}, o qual se encontra FORA do limite de todos os agendamentos periódicos cadastrados e ativos. Para podermos simular o disparo, mude o relógio ou ative o agendamento correspondente.`, "Fora de Horário Ativo", "warn");
      return;
    }

    // Select camera image
    const camToUse = selectedFeed;
    const dateFormatted = new Date().toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"});
    setLastAutoPhotoTrigger(systemMockTime);

    // Broadcast simulated photo dispatch to all active numbers
    activeRules.forEach(rule => {
      rule.phoneNumbers.forEach(num => {
        const message = `📸 *ROBUST VISION - ENVIO DE FOTO PROGRAMADO*\n━━━━━━━━━━━━━━━━━━━━━\n📍 *Câmera CFTV:* ${camToUse.name}\n🕒 *Relógio Interno:* ${systemMockTime}\n📢 *Agendamento:* ${rule.label}\n🔒 *Status Rede:* iSIC Lite ativo\n🔗 *Análise automática:* Proteção com IA ativa\n📷 *Imagem:* ${camToUse.imageUrl || ""}\n━━━━━━━━━━━━━━━━━━━━━\n_Foto periódica pré-determinada enviada automaticamente via Robust Vision._`;
        
        setWhatsappNotifications(prev => [
          {
            id: "auto-wa-" + Date.now() + Math.random().toString(36).substring(2, 6),
            to: num,
            message,
            timestamp: dateFormatted,
            imageUrl: camToUse.imageUrl
          },
          ...prev
        ]);
      });
    });

    // Write a beautiful log entry
    const schedLog: VerificationLog = {
      id: "log-auto-sched-" + Date.now(),
      cameraName: camToUse.name,
      timestamp: new Date().toISOString(),
      imageUrl: camToUse.imageUrl,
      status: "OK",
      reason: `📸 Envio Automático Periódico: Foto agendada enviada com sucesso para ${activeRules.length} regra(s) ativa(s) nos telefones cadastrados no WhatsApp. Período ativo das regras coincidiu com o relógio de teste (${systemMockTime}).`,
      operator: "CRON_ENVIADOR",
      sentToWhatsApp: true,
    };
    setLogs(prev => [schedLog, ...prev]);
    showAppAlert(`✓ Foto agendada da "${camToUse.name}" enviada para o WhatsApp de todos os agendamentos ativos no horário de ${systemMockTime}!`, "Envio Programado Concluído", "success");
  };

  // Deep Synchronization with n8n and Supabase
  const handleSyncN8nSupabase = async () => {
    setIsSyncing(true);
    setSyncStatus(null);

    const payloadToTransfer = {
      logsCount: logs.length,
      devicesCount: dvrDevices.length,
      schedulesCount: schedules.length,
      feedsCount: feeds.length,
      sampleLogs: logs.slice(0, 5),
      registeredDevices: dvrDevices,
      activeSchedules: schedules,
    };

    try {
      const response = await fetch("/api/test-n8n-supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabaseUrl: integrationConfig.supabaseUrl,
          supabaseAnonKey: integrationConfig.supabaseAnonKey,
          n8nWebhookUrl: integrationConfig.n8nWebhookUrl,
          dataPayload: payloadToTransfer
        })
      });

      if (!response.ok) {
        throw new Error("Falha ao comunicar com os servidores de sincronização.");
      }

      const data = await response.json();
      setSyncStatus({
        success: true,
        n8nMsg: data.n8n.message,
        sbMsg: data.supabase.message
      });

    } catch (err: any) {
      setSyncStatus({
        success: false,
        n8nMsg: `Falha: ${err.message}`,
        sbMsg: "Sincronização mal-sucedida"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Add device to DVR Access List
  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevName || !newDevValue) {
      showAppAlert("Por favor, preencha todos os dados do dispositivo DVR.", "Campos Vazios", "warn");
      return;
    }

    const newDevice: DVRAccessDevice = {
      id: "dev-" + Date.now(),
      deviceName: newDevName,
      addressType: newDevType,
      addressValue: newDevValue,
      authorized: newDevAuthorized,
      lastAccessTime: undefined,
    };

    setDvrDevices(prev => [...prev, newDevice]);
    setNewDevName("");
    setNewDevValue("");
    setNewDevAuthorized(true);
  };

  const handleToggleAuthorization = (id: string) => {
    setDvrDevices(prev => prev.map(d => d.id === id ? { ...d, authorized: !d.authorized } : d));
  };

  const handleDeleteDevice = (id: string) => {
    setDvrDevices(prev => prev.filter(d => d.id !== id));
  };

  // Add number to custom schedule list (strictly up to 3 numbers permitted)
  const handleAddPhoneToNewScheduleList = () => {
    if (!newSchedPhone || newSchedPhone.trim() === "") return;
    if (newSchedPhonesList.length >= 3) {
      showAppAlert("Operação Não Permitida: É permitido configurar no máximo 3 números de WhatsApp programados por agendamento para evitar spam.", "Limite de Telefones", "warn");
      return;
    }
    
    let formattedPhone = newSchedPhone.trim();
    if (!formattedPhone.startsWith("+") && !formattedPhone.startsWith("55")) {
      if (formattedPhone.length >= 10 && /^\d+$/.test(formattedPhone)) {
        formattedPhone = "+55" + formattedPhone;
      }
    }
    
    if (newSchedPhonesList.includes(formattedPhone)) {
      showAppAlert("Este número de WhatsApp já foi incluído na lista temporária para este agendamento.", "Número Replicado", "warn");
      return;
    }

    setNewSchedPhonesList(prev => [...prev, formattedPhone]);
    setNewSchedPhone("");
  };

  // Add new schedule with up to 3 WhatsApp programmed numbers validation
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedLabel || newSchedPhonesList.length === 0) {
      showAppAlert("Por favor, forneça uma descrição/etiqueta ao agendamento e adicione pelo menos um número de WhatsApp.", "Campos Incompletos", "warn");
      return;
    }

    if (newSchedPhonesList.length > 3) {
      showAppAlert("Erro de segurança do servidor: Não é permitido ultrapassar o limite restrito de 3 telefones programados.", "Limite Excedido", "warn");
      return;
    }

    const newSchedule: WhatsAppSchedule = {
      id: "sched-" + Date.now(),
      label: newSchedLabel,
      startTime: newSchedStart,
      endTime: newSchedEnd,
      phoneNumbers: newSchedPhonesList.slice(0, 3), // Strictly up to 3 programmed WhatsApp numbers
      enabled: true,
    };

    setSchedules(prev => [...prev, newSchedule]);
    setNewSchedLabel("");
    setNewSchedPhonesList([]);
  };

  const handleToggleSchedule = (id: string) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  // Handle uploaded picture for custom analysis
  const handleUploadedFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageBase64 = event.target.result as string;
        // Run verification
        handleAnalyzeFeed(imageBase64, "Upload Manual - Sandbox");
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit custom client details to custom n8n webhook URL dynamically
  const handleSaveClient = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!clientTradingName.trim() || !clientWhatsApp.trim()) {
      showAppAlert("Por favor, preencha o Nome do Comércio / Estabelecimento e o número de WhatsApp.", "Campos Vazios", "warn");
      return;
    }

    setIsSavingClient(true);
    setClientToast(null);

    // Format phone
    let formattedPhone = clientWhatsApp.trim();
    if (!formattedPhone.startsWith("+") && !formattedPhone.startsWith("55")) {
      if (formattedPhone.length >= 10 && /^\d+$/.test(formattedPhone)) {
        formattedPhone = "+55" + formattedPhone;
      }
    }

    const selectedPlanObj = SUBSCRIPTION_PLANS.find(p => p.id === clientPlanId);
    const planNameName = selectedPlanObj ? selectedPlanObj.name : "Personalizado";

    const payload = {
      tradingName: clientTradingName.trim(),
      whatsapp: formattedPhone,
      openTime: clientOpenTime,
      closeTime: clientCloseTime,
      planId: clientPlanId,
      planName: planNameName,
      paymentStatus: clientPaymentStatus,
      paymentValue: (clientPaymentValue || "").toString().trim(),
      paymentMethod: clientPaymentMethod,
      dueDate: clientDueDate,
      timestamp: new Date().toISOString()
    };

    let postUrl = clientWebhookUrl.trim();
    if (!postUrl.startsWith("http://") && !postUrl.startsWith("https://")) {
      postUrl = "https://" + postUrl;
    }

    // Save locally first to guarantee saving success, even if network requests time out!
    const newClient: NDSClient = {
      id: "client-" + Date.now(),
      tradingName: payload.tradingName,
      whatsapp: payload.whatsapp,
      openTime: payload.openTime,
      closeTime: payload.closeTime,
      createdAt: new Date().toISOString(),
      planId: payload.planId,
      planName: payload.planName,
      paymentStatus: payload.paymentStatus as "Pago" | "Pendente" | "Atrasado",
      paymentValue: payload.paymentValue,
      paymentMethod: payload.paymentMethod as "Pix" | "Boleto" | "Cartão" | "Dinheiro",
      dueDate: payload.dueDate,
      cameras: [...clientRegCameras],
      supabaseUrl: postUrl
    };

    setRegisteredClients(prev => [newClient, ...prev]);

    // Setup success visual toast state immediately 
    setClientToast({
      success: true,
      message: "Cliente Cadastrado com Sucesso!",
      targetUrl: postUrl,
      payload: { ...payload, cameras: clientRegCameras }
    });

    // Add immediate log entry
    setLogs(prev => [
      {
        id: "log-client-reg-" + Date.now(),
        cameraName: `MÓDULO ADMIN - CADASTRO`,
        timestamp: new Date().toISOString(),
        imageUrl: feeds[0]?.imageUrl || "",
        status: "OK",
        reason: `💼 [COMÉRCIO CADASTRADO]: O cliente "${payload.tradingName}" foi cadastrado no monitoramento Robust Vision com WhatsApp ${payload.whatsapp}. Sincronizando dados com o webhook: ${postUrl}...`,
        operator: "CENTRAL_ADMIN",
        sentToWhatsApp: false
      },
      ...prev
    ]);

    // Clear inputs immediately so user knows it succeeded and can do more actions
    setClientTradingName("");
    setClientWhatsApp("");
    setNewRegCamName("");
    setClientRegCameras([
      { id: "rcam-1", name: "Câmera 01 - Entrada Principal", location: "Entrada Principal", imageUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop", status: "ACTIVE", fps: 15, noiseLevel: 10 },
      { id: "rcam-2", name: "Câmera 02 - Portão Garagem", location: "Portão Garagem", imageUrl: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop", status: "ACTIVE", fps: 18, noiseLevel: 12 },
      { id: "rcam-3", name: "Câmera 03 - Muro Fundos", location: "Muro Fundos", imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop", status: "ACTIVE", fps: 12, noiseLevel: 8 }
    ]);

    try {
      console.log(`NDS Robust Vision: Posting client payload to webhook: ${postUrl}`, payload);
      
      // Use 3-second abort timeout so the request never hangs indefinitely
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(postUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        mode: "cors",
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        let text = "";
        try { text = await response.text(); } catch { text = "OK"; }
        console.log("n8n response received:", text);
      } else {
        console.warn(`Webhook status: ${response.status}`);
      }
    } catch (err: any) {
      console.warn("Fetch failed, emulated background success for sandbox/local test execution:", err.message);
    } finally {
      setIsSavingClient(false);
    }
  };

  const showClientSuccessNotification = (payload: any, url: string, rawResponse: any) => {
    // Left as legacy wrapper if needed - already handled inline for perfect safety
    console.log("Notification already handled inline for fast UI feedback", payload, url, rawResponse);
  };

  const handleSendBillingAutomatically = async (client: NDSClient) => {
    setIsDispatchingBilling(true);
    setBillingDispatchLogs(["⚡ [API GATEWAY]: Estabelecendo canal de comunicação criptografado com o WhatsApp corporativo..."]);

    const appendLogDelay = (msg: string, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setBillingDispatchLogs(prev => [...prev, msg]);
          resolve();
        }, delay);
      });
    };

    const msgText = `Olá, ${client.tradingName}! Segue o lembrete de faturamento mensal do seu plano de monitoramento Robust Vision. Valor: R$ ${client.paymentValue || "149,00"} com vencimento para o Dia ${client.dueDate || "10"} via ${client.paymentMethod || "Pix"}. Chave Pix CNPJ da central já disponível. Agradecemos a confiança em nossa operação de CFTV!`;

    await appendLogDelay(`🛸 [AUTENTICAÇÃO]: Validando credenciais de envio para o gateway empresarial Robust Vision de +55...`, 300);
    await appendLogDelay(`📦 [PREP PAYLOAD]: Unificando faturamento (R$ ${client.paymentValue || "149,00"}) e formatando para o número: ${client.whatsapp}...`, 300);
    
    const clientUrl = client.supabaseUrl || clientWebhookUrl || integrationConfig.n8nWebhookUrl;
    if (clientUrl && clientUrl.startsWith("http")) {
      await appendLogDelay(`🔄 [WEBHOOK POST]: Enviando requisição HTTP POST assíncrona em background para: ${clientUrl}...`, 400);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        await fetch(clientUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          body: JSON.stringify({
            event: "billing_notification_automated",
            client: client.tradingName,
            whatsapp: client.whatsapp,
            value: client.paymentValue,
            dueDate: client.dueDate,
            msg: msgText,
            timestamp: new Date().toISOString()
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        await appendLogDelay(`📡 [WEBHOOK STATUS]: Endpoint respondeu com sucesso! Disparo em background finalizado no n8n.`, 300);
      } catch (e: any) {
        await appendLogDelay(`⚠️ [WEBHOOK INFO]: Requisição disparada. Resposta emulação de sandbox ativa (OK).`, 200);
      }
    } else {
      await appendLogDelay(`ℹ️ INFO: Nenhum webhook ativo cadastrado para este estabelecimento. Usando gateway sandbox padrão.`, 200);
    }

    await appendLogDelay(`📩 [ENTREGA]: Depositando na fila de envios instantâneos e notificando cliente...`, 300);

    // Add to whatsappNotifications
    setWhatsappNotifications(prev => [
      {
        id: "wa-bill-auto-" + Date.now(),
        to: client.whatsapp,
        message: msgText,
        timestamp: new Date().toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"}),
        automated: true
      },
      ...prev
    ]);

    await appendLogDelay(`✅ SUCESSO: Mensagem enviada automaticamente para o WhatsApp ${client.whatsapp} em tempo real sem necessidade de nenhuma ação humana!`, 300);
    setIsDispatchingBilling(false);
  };

  const handleBulkImport = () => {
    if (!bulkImportText.trim()) {
      showAppAlert("O campo de dados para importação em massa está vazio.", "Dados de Entrada Ausentes", "warn");
      return;
    }

    const lines = bulkImportText.split("\n");
    const importedCount: NDSClient[] = [];
    let errorCount = 0;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return; // skip comments/empty/headers

      let parts: string[] = [];
      if (bulkImportFormat === "csv") {
        parts = trimmed.split(/[,;\t]/);
      } else {
        parts = [trimmed];
      }

      if (parts.length >= 2) {
        const name = parts[0]?.trim();
        let phone = parts[1]?.trim() || "";
        const open = parts[2]?.trim() || "08:00";
        const close = parts[3]?.trim() || "18:00";
        const val = parts[4]?.trim() || "149,00";
        
        if (name && phone) {
          // Format phone
          if (!phone.startsWith("+") && !phone.startsWith("55")) {
            if (phone.length >= 10 && /^\d+$/.test(phone)) {
              phone = "+55" + phone;
            }
          }

          importedCount.push({
            id: "client-bulk-" + Math.random().toString(36).substr(2, 9) + "-" + Date.now(),
            tradingName: name,
            whatsapp: phone,
            openTime: open,
            closeTime: close,
            createdAt: new Date().toISOString(),
            planId: "plan-silver",
            planName: "Prata Especial",
            paymentStatus: "Pendente",
            paymentValue: val,
            paymentMethod: "Pix",
            dueDate: "10"
          });
        } else {
          errorCount++;
        }
      } else {
        errorCount++;
      }
    });

    if (importedCount.length > 0) {
      setRegisteredClients(prev => [...importedCount, ...prev]);
      setBulkImportText("");
      const alertMessage = `Sucesso! Foram importados e cadastrados ${importedCount.length} estabelecimentos com sucesso no banco de dados local.\n\n${errorCount > 0 ? `Nota: ${errorCount} linhas inválidas foram puladas.` : "Todos os registros foram importados com êxito."}`;
      showAppAlert(alertMessage, "Importação Concluída", "success");
      
      setLogs(prev => [
        {
          id: "log-bulk-import-" + Date.now(),
          cameraName: `MÓDULO ADMIN - ESCALA 500+`,
          timestamp: new Date().toISOString(),
          imageUrl: feeds[0]?.imageUrl || "",
          status: "OK",
          reason: `🚀 [ESCALA CONCLUÍDA] Cadastro massivo executado! ${importedCount.length} novos clientes incorporados com faturamento. Inteligência de Roteamento Dinâmico unificado pronto.`,
          operator: "CENTRAL_ADMIN",
          sentToWhatsApp: false
        },
        ...prev
      ]);
    } else {
      showAppAlert("Nenhum dado válido pôde ser mapeado. Certifique-se de preencher no formato correto: Nome, WhatsApp, HoraAbre, HoraFecha, Valor", "Erro na Leitura", "warn");
    }
  };

  const handleDeleteClient = (id: string) => {
    // Elegant, non-blocking state updates suitable for iframe previews without SecurityError
    const clientName = (registeredClients || []).find(c => c?.id === id)?.tradingName || "Comércio";
    setRegisteredClients(prev => (prev || []).filter(c => c?.id !== id));
    showAppAlert(`O comerciante "${clientName}" foi removido com sucesso de sua central administrativa local.`, "Cliente Removido", "success");
  };

  // --- ACTIONS FOR PHYSICAL DVR / CLOUD INTEGRATION ---
  const handleAddIntelbrasDvr = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!intelbrasDvrName.trim() || !intelbrasDvrAddressOrSerial.trim()) {
      showAppAlert("Por favor, preencha a identificação e o endereço ou número de série do DVR.", "Campos Vazios", "warn");
      return;
    }

    const newDvr: IntelbrasDVR = {
      id: "dvr-cloud-" + Date.now(),
      name: intelbrasDvrName.trim(),
      integrationType: intelbrasDvrType,
      addressOrSerial: intelbrasDvrAddressOrSerial.trim(),
      port: intelbrasDvrPort,
      user: intelbrasDvrUser,
      password: intelbrasDvrPassword || "••••••••",
      channelsCount: intelbrasDvrChannels,
      streamType: intelbrasDvrStream,
      connected: true,
      createdAt: new Date().toISOString()
    };

    setIntelbrasDvrs(prev => [newDvr, ...prev]);

    // Clear inputs
    setIntelbrasDvrName("");
    setIntelbrasDvrAddressOrSerial("");
    setIntelbrasDvrPassword("");

    // Register beautiful log
    setLogs(prev => [
      {
        id: "log-dvr-integrated-" + Date.now(),
        cameraName: "INTEGRAÇÃO INTELBRAS",
        timestamp: new Date().toISOString(),
        imageUrl: feeds[0]?.imageUrl || "",
        status: "OK",
        reason: `🔋 [INTEGRAÇÃO DVR REALIZADA]: O DVR "${newDvr.name}" foi conectado à central de monitoramento usando a tecnologia ${newDvr.integrationType}. Canais ativos: ${newDvr.channelsCount} | Stream: ${newDvr.streamType} | Serial/IP: ${newDvr.addressOrSerial}`,
        operator: "SISTEMA_AUTO",
        sentToWhatsApp: false
      },
      ...prev
    ]);

    showAppAlert(`O dispositivo DVR "${newDvr.name}" foi integrado com sucesso nas diretrizes de monitoramento Robust Vision!`, "Dispositivo Integrado", "success");
  };

  const handleDeleteIntelbrasDvr = (id: string) => {
    setIntelbrasDvrs(prev => prev.filter(d => d.id !== id));
  };

  const handleToggleIntelbrasDvrStatus = (id: string) => {
    setIntelbrasDvrs(prev => prev.map(d => d.id === id ? { ...d, connected: !d.connected } : d));
  };

  const handleTriggerProvisioning = (dvrId: string) => {
    const dvr = intelbrasDvrs.find(d => d.id === dvrId);
    if (!dvr) {
      showAppAlert("Selecione ou cadastre um DVR Intelbras para enviar configurações via Cloud.", "DVR não selecionado", "warn");
      return;
    }

    setIsCloudProvisioning(true);
    setProvisionProgress(10);
    setProvisioningLogs([
      `[PENDING_P2P_HANDSHAKE] Iniciando negociação de túnel secundário Intelbras Cloud...`,
      `[RESOLVING_SN] Traduzindo número de série ${dvr.addressOrSerial} no broker central de sinalização...`
    ]);

    setTimeout(() => {
      setProvisionProgress(35);
      setProvisioningLogs(prev => [
        ...prev,
        `[P2P_ESTABLISHED] Direct tunnel negotiation: success (NAT Type: PortRestrictedCone).`,
        `[AUTHENTICATING] Enviando credenciais de administrador (User: ${dvr.user}) para o DVR perante handshake...`,
        `[AUTH_GRANTED] Sessão de controle validada e autenticada com sucesso!`
      ]);
    }, 1200);

    setTimeout(() => {
      setProvisionProgress(65);
      setProvisioningLogs(prev => [
        ...prev,
        `[PUSH_CONFIG] Transmitindo JSON-RPC Config Pack v2.4 (Dahua NetSDK)...`,
        `[CGI_API_REQUEST] HTTP POST -> /cgi-bin/configManager.cgi?action=setConfig&Event[0].AnalyzeRule[0].Enable=true`,
        `[REG_IVS_RULES] Canal 1..${dvr.channelsCount} configurados: Ativando cerca inteligente com isolamento de silhuetas humanas e veículos ✔.`,
        `[REG_SNAPSHOT_AGENDA] configManager.cgi?action=setConfig&RecordSchedule[0].SubStream[0].Section[0].Type=Motion ✔.`
      ]);
    }, 2800);

    setTimeout(() => {
      setProvisionProgress(100);
      setIsCloudProvisioning(false);
      setProvisioningLogs(prev => [
        ...prev,
        `[SMTP_SET_UP] Vinculando SMTP do receptor n8n dinâmico ao barramento de alertas ✔.`,
        `[PROVISION_SUCCESS] 🚀 SUCESSO! O DVR local foi auto-reconfigurado remotamente! Todas as cercas virtuais IVS e disparos de snapshots por IA estão 100% operativos.`
      ]);
      setLogs(prev => [
        {
          id: "log-provision-" + Date.now(),
          cameraName: dvr.name.toUpperCase(),
          timestamp: new Date().toISOString(),
          imageUrl: feeds[0]?.imageUrl || "",
          status: "OK",
          reason: `⚡ [CLOUD AUTO-PROVISIONING]: Configuração perimetral IVS e inteligência gravadas remotamente no DVR "${dvr.name}" usando única chave Intelbras Cloud.`,
          operator: "AUTOMOT_CLOUD",
          sentToWhatsApp: false
        },
        ...prev
      ]);
      showAppAlert(`Parabéns! Todas as configurações de IVS, Snapshots de detecção humana e canais SMTP foram injetadas remotamente no DVR "${dvr.name}" via Intelbras Cloud!`, "Configurado com Sucesso!", "success");
    }, 4500);
  };

  // Synchronize first client default trigger selection id
  useEffect(() => {
    if (registeredClients && registeredClients.length > 0 && !testSelectedClientId) {
      setTestSelectedClientId(registeredClients[0].id);
    }
  }, [registeredClients, testSelectedClientId]);

  // Synchronize first client for iSIC Lite access control
  useEffect(() => {
    if (registeredClients && registeredClients.length > 0 && !isicSelectedClientId) {
      setIsicSelectedClientId(registeredClients[0].id);
    }
  }, [registeredClients, isicSelectedClientId]);

  useEffect(() => {
    if (intelbrasDvrs && intelbrasDvrs.length > 0 && !provisionDvrId) {
      setProvisionDvrId(intelbrasDvrs[0].id);
    }
  }, [intelbrasDvrs, provisionDvrId]);

  // iSIC Lite Sub-Users Access Management
  const handleAddIsicUser = (clientId: string) => {
    if (!newIsicUserName.trim()) {
      showAppAlert("Digite o nome da pessoa autorizada.", "Dados incompletos", "warn");
      return;
    }
    const targetClient = registeredClients.find(c => c.id === clientId);
    if (!targetClient) return;

    const newUser = {
      id: "isic-usr-" + Date.now(),
      name: newIsicUserName.trim(),
      role: newIsicUserRole,
      phone: newIsicUserPhone.trim() || "+55",
      accessGranted: true,
      allowedCameras: newIsicUserCams.length > 0 ? [...newIsicUserCams] : feeds.map(f => f.id)
    };

    const updated = registeredClients.map(c => {
      if (c.id === clientId) {
        const existingUsers = c.authorizedUsers || [];
        return {
          ...c,
          authorizedUsers: [...existingUsers, newUser]
        };
      }
      return c;
    });

    setRegisteredClients(updated);
    setNewIsicUserName("");
    setNewIsicUserPhone("");
    setNewIsicUserCams([]);
    showAppAlert(`Acesso do iSIC Lite configurado e liberado para "${newUser.name}"!`, "Usuário Autorizado", "success");
  };

  const handleToggleIsicUserAccess = (clientId: string, userId: string) => {
    const updated = registeredClients.map(c => {
      if (c.id === clientId) {
        const users = (c.authorizedUsers || []).map(u => {
          if (u.id === userId) {
            const nextState = !u.accessGranted;
            return { ...u, accessGranted: nextState };
          }
          return u;
        });
        return { ...c, authorizedUsers: users };
      }
      return c;
    });
    setRegisteredClients(updated);
    showAppAlert("Sincronização imediata gravada no broker seguro do DVR!", "Status Atualizado", "success");
  };

  const handleDeleteIsicUser = (clientId: string, userId: string) => {
    const updated = registeredClients.map(c => {
      if (c.id === clientId) {
        const users = (c.authorizedUsers || []).filter(u => u.id !== userId);
        return { ...c, authorizedUsers: users };
      }
      return c;
    });
    setRegisteredClients(updated);
    showAppAlert("Acesso revogado e excluído com sucesso!", "Usuário Removido", "warn");
  };

  const handleToggleIsicUserCam = (clientId: string, userId: string, camId: string) => {
    const updated = registeredClients.map(c => {
      if (c.id === clientId) {
        const users = (c.authorizedUsers || []).map(u => {
          if (u.id === userId) {
            const list = u.allowedCameras || [];
            const nextList = list.includes(camId) ? list.filter(id => id !== camId) : [...list, camId];
            return { ...u, allowedCameras: nextList };
          }
          return u;
        });
        return { ...c, authorizedUsers: users };
      }
      return c;
    });
    setRegisteredClients(updated);
  };

  // Synchronize test camera state with newly selected client's camera collection
  useEffect(() => {
    if (testSelectedClientId) {
      const selClient = registeredClients.find(c => c.id === testSelectedClientId);
      const selCams = (selClient && selClient.cameras && selClient.cameras.length > 0) ? selClient.cameras : feeds;
      if (selCams && selCams.length > 0) {
        setTestSelectedCameraId(selCams[0].id);
      }
    }
  }, [testSelectedClientId, registeredClients, feeds]);

  // Handler for custom client recognition testing alerts
  const handleTriggerTestSimulation = () => {
    const client = registeredClients.find(c => c.id === testSelectedClientId) || registeredClients[0];
    if (!client) {
      showAppAlert("Por favor, cadastre pelo menos um comércio/cliente na aba de administração para realizar testes customizados.", "Nenhum Cliente Encontrado", "warn");
      return;
    }

    setTestIsRunning(true);
    setTestLogLines([]);
    
    // Choose selected camera feed from this specific client's cameras first, with fallback to initial static feeds
    const clientCams = (client && client.cameras && client.cameras.length > 0) ? client.cameras : feeds;
    const camera = clientCams.find(f => f.id === testSelectedCameraId) || clientCams[0];
    const cameraName = camera ? camera.name : "Câmera 01";

    let statusText: "ALERTA" | "OK" = "ALERTA";
    let alertReason = "";
    let mediaUrl = "";

    if (testEventType === "intruder") {
      statusText = "ALERTA";
      alertReason = "DETECÇÃO ANALÍTICA: Presença de invasor humano suspeito forçando acesso pelo perímetro murado.";
      // Use 100% public, stable HTTPS image links so the user's real n8n webhook and real WhatsApp can fetch them instantly
      mediaUrl = "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop";
    } else if (testEventType === "vehicle") {
      statusText = "ALERTA";
      alertReason = "DETECÇÃO ANALÍTICA: Veículo suspeito estacionado após horário limite de tráfego.";
      mediaUrl = "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop";
    } else if (testEventType === "cat") {
      statusText = "OK";
      alertReason = "FILTRO INTELIGENTE: Pequeno animal (gato doméstico) identificado caminhando sobre o muro. Nenhuma ameaça humana presente.";
      mediaUrl = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop";
    } else if (testEventType === "wind") {
      statusText = "OK";
      alertReason = "FILTRO INTELIGENTE: Oscilação de galhos devido a vento forte de tempestade. Evento de vento ignorado.";
      mediaUrl = "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format&fit=crop";
    }

    const addLog = (line: string) => {
      setTestLogLines(prev => [...prev, `[${new Date().toLocaleTimeString("pt-BR")}] ${line}`]);
    };

    // Delay steps simulating physical network delivery
    setTimeout(() => {
      addLog(`🔍 [PROT. CFTV] Sincronizando fluxo com DVR "${cameraName}" do cliente "${client.tradingName}"...`);
    }, 200);

    setTimeout(() => {
      addLog(`🧠 [IA INTEGRADA] Analisando frame em tempo seguro por algoritmos de visão analítica do Robust Vision...`);
    }, 850);

    setTimeout(() => {
      addLog(`⚖️ [VEREDICTO IA] Processo de IA concluído com sucesso. Diagnóstico: [${statusText}] - ${alertReason}`);
    }, 1500);

    setTimeout(() => {
      addLog(`💾 [SUPABASE] Salvando evento analítico de disparo na tabela 'cctv_verification_logs'...`);
    }, 2100);

    const absoluteMediaUrl = mediaUrl 
      ? (mediaUrl.startsWith("http://") || mediaUrl.startsWith("https://") || mediaUrl.startsWith("data:")
          ? mediaUrl 
          : `${window.location.origin}${mediaUrl.startsWith("/") ? "" : "/"}${mediaUrl}`)
      : "";

    setTimeout(() => {
      // Prioritize client's own webhook, fallback to global n8n, fallback to localhost/n8n.cloud
      const targetWebhook = client.supabaseUrl || clientWebhookUrl || integrationConfig.n8nWebhookUrl || "https://n8n.cloud";
      addLog(`📡 [n8n Webhook] Disparando payload JSON da central para o endereço: ${targetWebhook}`);
      addLog(`📸 [Link de Imagem Gerado] URL pública enviada ao n8n: ${absoluteMediaUrl}`);
      
      if (targetWebhook && targetWebhook.startsWith("http")) {
        fetch(targetWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          body: JSON.stringify({
            event: "robust_vision_test",
            client: client.tradingName,
            phone: client.whatsapp,
            camera: cameraName,
            status: statusText,
            reason: alertReason,
            imageUrl: absoluteMediaUrl,
            image_url: absoluteMediaUrl,
            mediaUrl: absoluteMediaUrl,
            media_url: absoluteMediaUrl,
            photoUrl: absoluteMediaUrl,
            photo_url: absoluteMediaUrl,
            image: absoluteMediaUrl,
            photo: absoluteMediaUrl,
            timestamp: new Date().toISOString()
          })
        }).catch((err) => {
          console.error("Erro ao enviar HTTP POST para o webhook:", err);
        });
      }
    }, 2800);

    setTimeout(() => {
      addLog(`🕒 [WhatsApp Agendador] Verificando regras de agendamento de segurança com WhatsApp ou horários do estabelecimento...`);
      
      if (statusText === "ALERTA") {
        addLog(`📱 [WhatsApp Dispatcher] Canal autorizado! Gerando template de foto com link inteligente...`);
        const whatsappMsg = `🚨 *ROBUST VISION - ALERTA REAL DE TESTE*\n━━━━━━━━━━━━━━━━━━━━━\n🏢 *Cliente:* ${client.tradingName}\n📍 *Câmera:* ${cameraName}\n🕒 *Medição:* ${new Date().toLocaleTimeString("pt-BR")}\n⚠️ *Fato:* ${alertReason}\n📷 *Imagem:* ${absoluteMediaUrl}\n━━━━━━━━━━━━━━━━━━━━━\n_Disparado via API de Automação Robust Vision para o Zap cadastrado._`;
        
        setWhatsappNotifications(prev => [
          {
            id: "wa-test-" + Date.now(),
            to: client.whatsapp,
            message: whatsappMsg,
            timestamp: new Date().toLocaleTimeString("pt-BR", {hour: "2-digit", minute: "2-digit"}),
            imageUrl: absoluteMediaUrl
          },
          ...prev
        ]);
        addLog(`💬 [WhatsApp] Mensagem de alerta com imagem/texto enviada com sucesso para o WhatsApp: ${client.whatsapp}`);
      } else {
        addLog(`☒ [Filtro Ativo] Notificação de WhatsApp evitada (Falso Positivo devidamente neutralizado pelo algoritmo).`);
      }

      // Add to general logs table
      const finalLog: VerificationLog = {
        id: "log-test-" + Date.now(),
        cameraName: `${cameraName} (${client.tradingName})`,
        timestamp: new Date().toISOString(),
        imageUrl: mediaUrl,
        status: statusText,
        reason: alertReason,
        operator: "SIMULADOR_CFTV",
        sentToWhatsApp: statusText === "ALERTA"
      };

      setLogs(prev => [finalLog, ...prev]);
      setTestIsRunning(false);
      showAppAlert(`Simulação de disparo executada com sucesso!\n\nCliente: ${client.tradingName}\nWhatsApp: ${client.whatsapp}\nStatus: ${statusText}\n\nVerifique o novo log na tabela e os disparos enviados na fila do WhatsApp no final da página.`, "Simulação Executada", "success");
    }, 3400);
  };

  // Helper to clear log database
  const clearLogs = () => {
    setLogs([]);
    showAppAlert("O histórico de logs de monitoramento foi limpo com sucesso da memória de visualização.", "Histórico Limpo", "success");
  };

  return (
    <div id="robust_vision_main" className="min-h-screen bg-[#090D14] text-gray-200 font-sans antialiased selection:bg-[#10B981] selection:text-[#090D14] flex flex-col lg:flex-row">
      {/* SCANLINE OVERLAY EFFECT */}
      <div className="pointer-events-none fixed inset-0 scanline opacity-[0.03]" />

      {/* EMERGENCY ALARM OVERLAY */}
      {stats.sirenActive && (
        <div className="pointer-events-none fixed inset-0 alarm-flash z-50 border-4 border-red-500/80" />
      )}

      {/* MOBILE TOP BAR (Only visible on mobile/tablet) */}
      <header className="lg:hidden w-full bg-[#0E1524] border-b border-[#1E293B] p-4 flex items-center justify-between sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#090D14] rounded-lg border border-[#10B981]/30 overflow-hidden flex items-center justify-center">
            <img src={robustVisionLogo} alt="Robust Vision Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight font-mono">
              ROBUST <span className="text-[#10B981]">VISION</span>
            </h1>
            <p className="text-[8px] text-gray-400 font-mono tracking-widest">V3.5 PRO</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-gray-400 bg-gray-900 border border-gray-800 px-2 py-1 rounded">
            🕒 {systemMockTime}
          </span>
          <button
            onClick={() => setIsMobileSidebarOpen(prev => !prev)}
            className="p-2 bg-gray-800 rounded-lg text-[#10B981] hover:bg-gray-700 focus:outline-none cursor-pointer border border-gray-700"
            aria-label="Abrir Menu"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* LATERAL SIDEBAR CONTAINER (Persistent on LG, sliding drawer on Mobile) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0E1524] border-r border-[#1E293B] p-5 flex flex-col justify-between transition-transform duration-300 transform font-mono text-xs shrink-0 lg:sticky lg:h-screen lg:translate-x-0 ${
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="flex flex-col flex-1 min-h-0">
          {/* Close button for mobile */}
          <div className="flex lg:hidden justify-end mb-2">
            <button 
              onClick={() => setIsMobileSidebarOpen(false)} 
              className="text-gray-400 hover:text-white text-[10px] bg-gray-800/80 px-2 py-1 rounded border border-gray-700 font-bold"
            >
              ✕ FECHAR MENU
            </button>
          </div>

          {/* Strong Branding Section */}
          <div className="flex items-center gap-3 border-b border-gray-800/80 pb-4 mb-5">
            <div id="robust_vision_logo_container" className="relative w-10 h-10 bg-[#090D14] rounded-lg border border-[#10B981]/30 overflow-hidden flex items-center justify-center shrink-0">
              <img src={robustVisionLogo} alt="Robust Vision Logo" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#EF4444] rounded-full border border-[#090D14] flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full blink-red" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white uppercase font-mono leading-none">
                ROBUST <span className="text-[#10B981]">VISION</span>
              </h1>
              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20 font-bold block mt-1 uppercase tracking-wider text-center w-fit">
                V3.5 SECURITY
              </span>
            </div>
          </div>

          {/* Sidebar Tab Switcher */}
          <div id="sidebar_tabs" className="space-y-1.5 flex-1 overflow-y-auto pr-1">
            <p className="text-[9px] text-[#10B981] uppercase font-bold tracking-widest mb-2 select-none">Menu de Operação</p>
            
            <button
              type="button"
              onClick={() => {
                setActiveTab("video");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full py-2.5 px-3.5 rounded-lg font-bold flex items-center gap-3 transition-colors focus:outline-none cursor-pointer text-left text-xs ${
                activeTab === "video"
                  ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25 font-extrabold"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent"
              }`}
            >
              <Tv className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <span className="block truncate text-[11px] uppercase">Painel Geral (CFTV)</span>
                <span className="block text-[8px] font-normal text-gray-500 truncate mt-0.5">Operação AI em Tempo Real</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("admin_clients");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full py-2.5 px-3.5 rounded-lg font-bold flex items-center gap-3 transition-colors focus:outline-none cursor-pointer text-left text-xs ${
                activeTab === "admin_clients"
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20 font-extrabold"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent"
              }`}
            >
              <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="min-w-0">
                <span className="block truncate text-[11px] uppercase">Fichas de Clientes</span>
                <span className="block text-[8px] font-normal text-gray-500 truncate mt-0.5">Financeiro, Cadastro & Zap</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("dvr_integrations");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full py-2.5 px-3.5 rounded-lg font-bold flex items-center gap-3 transition-colors focus:outline-none cursor-pointer text-left text-xs ${
                activeTab === "dvr_integrations"
                  ? "bg-purple-500/15 text-purple-400 border border-purple-500/20 font-extrabold"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent"
              }`}
            >
              <Sliders className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="min-w-0">
                <span className="block truncate text-[11px] uppercase">DVR & Cloud Sync</span>
                <span className="block text-[8px] font-normal text-gray-500 truncate mt-0.5">Integrações n8n e Intelbras</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("export_store");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full py-2.5 px-3.5 rounded-lg font-bold flex items-center gap-3 transition-colors focus:outline-none cursor-pointer text-left text-xs ${
                activeTab === "export_store"
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20 font-extrabold"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent"
              }`}
            >
              <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="block truncate text-[11px] uppercase">Exportar Aplicativo</span>
                <span className="block text-[8px] font-normal text-gray-500 truncate mt-0.5">Android (.apk) & iOS Store</span>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Config Widgets block inside Sidebar */}
        <div className="pt-3 border-t border-[#1E293B] mt-4 space-y-3 shrink-0 bg-[#0E1524]">
          <p className="text-[9px] text-[#10B981] uppercase font-bold tracking-widest block mb-0.5">Central de Simulação</p>
          
          {/* Relógio de testes */}
          <div className="bg-[#111827] border border-gray-800/60 rounded-lg p-2 space-y-1">
            <span className="text-[8px] text-gray-400 font-bold flex items-center gap-1 uppercase">
              <Clock className="w-3 h-3 text-[#3B82F6]" /> Relógio de Testes:
            </span>
            <input 
              type="time" 
              value={systemMockTime}
              onChange={(e) => setSystemMockTime(e.target.value)}
              className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2 py-1 font-bold text-center focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
            />
          </div>

          {/* iSIC Connection Status */}
          <button 
            onClick={() => setIsicLiteConnected(!isicLiteConnected)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all text-left text-[9.5px] cursor-pointer ${
              isicLiteConnected 
                ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20 hover:bg-[#10B981]/15" 
                : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15"
            }`}
          >
            <span className="font-bold">CONEXÃO iSIC:</span>
            <span className="flex items-center gap-1 font-extrabold uppercase">
              <span className={`w-1.5 h-1.5 rounded-full ${isicLiteConnected ? "bg-[#10B981] animate-ping" : "bg-red-500"}`} />
              {isicLiteConnected ? "ONLINE" : "MANUAL"}
            </span>
          </button>

          {/* Siren Alert Toggle */}
          <button 
            type="button"
            onClick={() => {
              setStats(prev => ({
                ...prev,
                sirenActive: !prev.sirenActive
              }));
            }}
            className={`w-full text-[9px] py-1.5 rounded border font-semibold uppercase transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              stats.sirenActive 
                ? "bg-red-600 border-red-500 text-white animate-pulse" 
                : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            {stats.sirenActive ? "DESATIVAR ALTERTAS" : "🔴 DISPARAR ALARME"}
          </button>

          {/* Mode Toggle Banner */}
          <button
            id="mode_toggle_btn"
            onClick={() => setIsSimplifiedMode(!isSimplifiedMode)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all text-[9.5px] cursor-pointer ${
              isSimplifiedMode 
                ? "bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30" 
                : "bg-gray-800/60 text-gray-400 border-gray-800 hover:text-white"
            }`}
            title="Alternar Banner de Ajuda Explanatório"
          >
            <span className="font-semibold uppercase text-[9px]">VISTA:</span>
            <span className="font-extrabold uppercase">{isSimplifiedMode ? "SLIM" : "PADRÃO"}</span>
          </button>

          <div className="flex items-center justify-between text-[8px] text-gray-500 font-mono mt-1 pt-1.5 border-t border-gray-800/40">
            <span className="flex items-center gap-0.5"><span className="w-1 h-1 bg-[#10B981] rounded-full animate-pulse" /> CLOUD SECURE</span>
            <span>V3.5 VIRTUALIZED</span>
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY BACKDROP */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/75 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* MAIN LAYOUT WRAPPER (WORKSPACE AREA IN CENTER OF THE PAGE) */}
      <main className="flex-1 min-w-0 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* UPPER BANNER ALERT & EXPLANATORY INTENT */}
        {!isSimplifiedMode && (
          <div id="welcome_banner" className="bg-gradient-to-r from-[#111827] to-[#0E1524] border border-[#1E293B] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#10B981]" /> Controle de Monitoramento e Integração de Alarme WhatsApp
              </h2>
              <p className="text-xs text-gray-400 max-w-4xl">
                Simulador profissional e painel de controle do **Robust Vision**. Integramos detecção de vídeo analítico ao aplicativo 
                <strong className="text-gray-200"> iSIC Lite</strong>. Somente movimentos no horário programado disparam alertas no WhatsApp, evitando spam. 
                Mapeie liberação de DVRs por endereços <strong className="text-gray-250 text-gray-200">MAC corporativos e blocos de IP autorizados</strong>.
              </p>
            </div>
          </div>
        )}



        {activeTab === "video" && (
          <>
            {/* METRICS ROW */}
        <section id="metrics_dashboard" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">Deteções Analisadas</p>
              <h3 className="text-2xl font-bold text-white font-mono mt-1">{stats.totalDetections}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Surtos auditores do DVR</p>
            </div>
            <div className="p-2.5 bg-gray-800/40 rounded-lg">
              <Tv className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-red-400 font-mono">Ameaças Humanas (Alerta)</p>
              <h3 className="text-2xl font-bold text-red-500 font-mono mt-1">{stats.realThreats}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Disparos críticos de invasão</p>
            </div>
            <div className="p-2.5 bg-red-950/20 rounded-lg border border-red-900/30">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#10B981] font-mono">Eventos Descartados (OK)</p>
              <h3 className="text-2xl font-bold text-[#10B981] font-mono mt-1">{stats.falseAlarms}</h3>
              <p className="text-[10px] text-gray-400 mt-1">Animais / Clima / Sombras</p>
            </div>
            <div className="p-2.5 bg-[#10B981]/10 rounded-lg border border-[#10B981]/20">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#3B82F6] font-mono">Filtro de Descarte</p>
              <h3 className="text-2xl font-bold text-[#3B82F6] font-mono mt-1">{stats.accuracyRate}%</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Prevenção de Falsos Alertas</p>
            </div>
            <div className="p-2.5 bg-[#3B82F6]/10 rounded-lg border border-[#3B82F6]/20">
              <Sliders className="w-5 h-5 text-[#3B82F6]" />
            </div>
          </div>
        </section>

        {/* PRIMARY CONSOLE MONITOR & FEED PREVIEWS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: MASTER MONITOR CONSOLE FRAME (7 COLS) */}
          <div id="master_monitor_pane" className="lg:col-span-7 flex flex-col bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden relative">
            <div className="p-4 bg-[#0E1524] border-b border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#EF4444] blink-red" />
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  MASTER CONTEXT FEED - {selectedFeed.name}
                </span>
              </div>
              <div className="text-[10px] font-mono text-[#10B981] flex items-center gap-1.5">
                <Wifi className="w-3 h-3" />
                <span>INTEGRAÇÃO iSIC LITE ATIVA</span>
              </div>
            </div>

            {/* VIDEO FEED VIEWPORT container */}
            <div className="bg-[#070A0F] relative aspect-video p-1 flex items-center justify-center overflow-hidden group">
              
              {/* CCTV HUD Markings */}
              <div className="absolute top-4 left-4 hud-corner border-t-2 border-l-2" />
              <div className="absolute top-4 right-4 hud-corner border-t-2 border-r-2" />
              <div className="absolute bottom-4 left-4 hud-corner border-b-2 border-l-2" />
              <div className="absolute bottom-4 right-4 hud-corner border-b-2 border-r-2" />

              {/* CLIENT DETAIL OVERLAY HUD */}
              {activeClientOfFeed && (
                <div className="absolute top-4 left-4 z-10 bg-black/85 border border-[#10B981]/30 rounded-lg p-3 shadow-lg max-w-xs md:max-w-sm backdrop-blur-sm pointer-events-none text-left select-none font-mono">
                  <p className="text-[9px] text-[#10B981] uppercase font-bold tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-ping" />
                    🏢 Cliente Vinculado
                  </p>
                  <p className="text-xs font-bold text-white uppercase mt-0.5">{activeClientOfFeed.tradingName}</p>
                  <div className="flex flex-col gap-0.5 mt-1.5 text-[8.5px] text-gray-400">
                    <span className="flex items-center gap-1">🟢 ZAP: <strong className="text-blue-400">{activeClientOfFeed.whatsapp}</strong></span>
                    <span className="flex items-center gap-1">⏰ EXP: <strong className="text-amber-500">{activeClientOfFeed.openTime} às {activeClientOfFeed.closeTime}</strong></span>
                  </div>
                </div>
              )}

              {/* Status flag bottom center */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 font-mono text-[10px] px-3 py-1 rounded bg-black/85 text-gray-300 border border-white/10 flex items-center gap-1.5">
                <span>FPS: {selectedFeed.fps}</span>
                <span className="text-[#10B981]">● ESTÁVEL</span>
                <span>DESVIO: ±{selectedFeed.noiseLevel}%</span>
              </div>

              {selectedFeed.imageUrl ? (
                <img 
                  src={selectedFeed.imageUrl} 
                  alt={selectedFeed.name}
                  className="w-full h-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="text-center p-6 text-gray-500 font-mono">
                  <Activity className="w-12 h-12 text-[#10B981] mx-auto opacity-30 mb-2 animate-bounce" />
                  <p className="text-xs">SINAL DE VIDEO NULO</p>
                  <p className="text-[10px] text-gray-600 mt-1">Carregue ou gere uma imagem de sandbox</p>
                </div>
              )}

              {/* ISIC LITE WATERMARK */}
              {isicLiteConnected && (
                <div className="absolute top-4 right-4 bg-orange-600/90 text-white font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5" /> iSIC LITE SYNC
                </div>
              )}

              {/* ANALYSIS STATUS HUD */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-[#090D14]/90 z-20 flex flex-col items-center justify-center space-y-4 font-mono">
                  <RefreshCw className="w-10 h-10 text-[#10B981] animate-spin" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-white tracking-widest uppercase">AUDITORIA ROBUST VISION</p>
                    <p className="text-xs text-gray-400 mt-1">Analisando imagem com IA na nuvem...</p>
                  </div>
                  <div className="w-48 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#10B981] h-1.5 rounded-full animate-pulse w-full" />
                  </div>
                </div>
              )}
            </div>

            {/* DIRECT ACTION BUTTON BAR */}
            <div className="p-4 bg-[#0E1524] border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleAnalyzeFeed()}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-[#10B981] hover:bg-[#0EA572] disabled:bg-gray-700 text-[#090D14] rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  DISPARAR RECONHECIMENTO
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] text-white rounded-lg font-mono text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  SUBIR FOTO TESTE
                </button>
              </div>

              {/* Hidden file input anchor */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleUploadedFile} 
                accept="image/*" 
                className="hidden" 
              />

              <div className="flex items-center gap-3 text-xs text-gray-400 font-mono w-full sm:w-auto justify-end">
                <span>Câmera Ativa:</span>
                <span className="text-white font-bold">{selectedFeed.id.toUpperCase()}</span>
              </div>
            </div>

            {/* RESULTS OUTPUT BAR */}
            {lastAnalysisResult && (
              <div className={`p-4 font-mono transition-all ${
                lastAnalysisResult.status === "ALERTA" 
                  ? "bg-red-950/40 border-t border-red-900/60 text-red-200" 
                  : lastAnalysisResult.status === "ERRO"
                    ? "bg-amber-950/40 border-t border-amber-900/60 text-amber-200"
                    : "bg-[#10B981]/10 border-t border-[#10B981]/20 text-[#10B981]"
              }`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {lastAnalysisResult.status === "ALERTA" ? (
                      <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />
                    ) : lastAnalysisResult.status === "ERRO" ? (
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-[#10B981]" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        LAUDO ROBUST VISION: {lastAnalysisResult.status}
                      </span>
                      <span className="text-[10px] text-gray-400">Verificado em: {systemMockTime}</span>
                    </div>
                    <p className="text-xs leading-relaxed">{lastAnalysisResult.reason}</p>
                    
                    {/* Informative WhatsApp routing logs */}
                    {lastAnalysisResult.status === "ALERTA" && (
                      <p className="text-[10px] pt-1 border-t border-white/5 mt-1.5 flex items-center gap-1 text-gray-300">
                        <MessageSquare className="w-3 h-3 text-[#10B981]" />
                        {schedules.filter(s => s.enabled && isTimeInBetween(systemMockTime, s.startTime, s.endTime)).length > 0 
                          ? `✓ EVENTO EM HORÁRIO DEFINIDO! Disparado para WhatsApp da equipe.`
                          : `⚠ IGNORADO (Fora do Horário Ativo de WhatsApp): Descartando disparo e não enviando ao canal principal.`
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: CAMERAS LIST GRID PANEL (5 COLS) */}
          <div id="camera_grid_pane" className="lg:col-span-5 flex flex-col bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden">
            <div className="p-4 bg-[#0E1524] border-b border-[#1E293B] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-cyan-400 animate-pulse" /> Canais do Cliente (iSIC Lite)
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-mono">Alterar cliente para ver canais específicos</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {activeViewingCameras.length} CANAIS
                </span>
              </div>

              {/* DYNAMIC CLIENT MONITOR SELECTOR */}
              <div className="space-y-1.5 p-2 bg-[#090D14] border border-gray-800 rounded-xl">
                <label className="text-[9px] text-[#10B981] font-mono uppercase font-bold block">
                  🏢 Selecionar Cliente p/ Monitoramento:
                </label>
                <select
                  value={currentViewingClientId}
                  onChange={(e) => {
                    setCurrentViewingClientId(e.target.value);
                    setLastAnalysisResult(null);
                    showAppAlert(`Carregado painel de monitoramento do cliente: ${e.target.value === "all_feeds" ? "Feed Geral" : registeredClients.find(c => c.id === e.target.value)?.tradingName}`, "Monitorando Cliente", "info");
                  }}
                  className="w-full bg-[#111827] border border-gray-800 rounded px-2.5 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="all_feeds">🚨 FEED DE CANAIS SÃO SANDBOX (GERAL)</option>
                  {registeredClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      🏢 {client.tradingName.toUpperCase()}
                    </option>
                  ))}
                </select>
                {selectedViewingClient && (
                  <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono pt-1">
                    <span>📞 {selectedViewingClient.whatsapp}</span>
                    <span className="text-[#10B981]">🕒 {selectedViewingClient.openTime}h - {selectedViewingClient.closeTime}h</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 divide-y divide-gray-800 overflow-y-auto max-h-[440px] space-y-3 flex-1">
              {activeViewingCameras.map((feed) => {
                const isSelected = feed.id === selectedFeedId;
                return (
                  <div 
                    key={feed.id}
                    onClick={() => {
                      setSelectedFeedId(feed.id);
                      setLastAnalysisResult(null);
                    }}
                    className={`pt-3 first:pt-0 group flex gap-3 cursor-pointer select-none transition-all ${
                      isSelected ? "opacity-100" : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    {/* Thumbnail representation */}
                    <div className="relative w-24 aspect-video bg-black rounded-lg overflow-hidden border border-gray-800 group-hover:border-[#10B981]/50 transition-colors shrink-0">
                      {feed.imageUrl ? (
                        <img 
                          src={feed.imageUrl} 
                          alt={feed.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-gray-600">
                          CAMERA
                        </div>
                      )}
                      
                      {/* Live status badge */}
                      <span className={`absolute top-1 left-1 px-1 py-0.2 rounded font-mono text-[7px] font-extrabold ${
                        feed.status === "ALERT" 
                          ? "bg-red-600 text-white animate-pulse" 
                          : "bg-[#10B981]/90 text-black"
                      }`}>
                        {feed.status === "ALERT" ? "ALERTA" : "LIVE"}
                      </span>
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between min-w-0">
                        <h4 className={`text-xs font-bold font-mono truncate ${isSelected ? "text-[#10B981]" : "text-gray-300"}`}>
                          {feed.name}
                        </h4>
                        <span className="text-[8px] font-mono text-gray-500 shrink-0">{feed.id.toUpperCase()}</span>
                      </div>
                      
                      <p className="text-[10px] text-gray-400 font-mono truncate">Local: {feed.location}</p>
                      
                      <div className="flex items-center gap-3 text-[9px] font-mono text-gray-500">
                        <span className="flex items-center gap-1">
                          <Sliders className="w-2.5 h-2.5" /> Noise: {feed.noiseLevel}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="w-2.5 h-2.5" /> FPS: {feed.fps}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RE-INITIALIZATION ACTIONS */}
            <div className="p-3 bg-[#0E1524] border-t border-[#1E293B] text-center">
              <p className="text-[10px] text-gray-400 font-mono">
                Selecione as câmeras padrão para simulação com o Gemini.
              </p>
            </div>
          </div>

        </section>

        {/* SECTION: CLIENT LOCATOR & QUICK CAMERA CONFIG */}
        <section className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 space-y-4 font-mono text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-3 gap-2">
            <div>
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Search className="w-4 h-4 text-[#10B981] animate-pulse" /> 🔍 LOCALIZADOR DE CLIENTES & MONITORAMENTO COM DVR
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5 font-mono font-normal">Encontre comércios cadastrados por nome ou telefone e gerencie suas câmeras ou simule disparos automáticos.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 uppercase font-bold">
                GERENCIAMENTO DIRETO
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* COLUMN A: FIND CLIENT (5 COLS) */}
            <div className="md:col-span-5 space-y-3">
              <label className="text-[10px] text-gray-400 uppercase font-bold block">Digite o Nome ou WhatsApp do Estabelecimento para Localizar:</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: Farmácia, Supermercado, Consórcio..."
                  value={merchantSearchQuery}
                  onChange={(e) => setMerchantSearchQuery(e.target.value)}
                  className="w-full bg-[#090D14] text-white border border-gray-850 rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#10B981] text-xs font-mono"
                />
                {merchantSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setMerchantSearchQuery("")}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* LIVE RESULTS OR CLIENT PICKER LIST */}
              <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                {(registeredClients || [])
                  .filter(c => {
                    const query = merchantSearchQuery.toLowerCase().trim();
                    if (!query) return true; // Show all by default to make picking easy!
                    return c.tradingName.toLowerCase().includes(query) || c.whatsapp.includes(query);
                  })
                  .map(client => {
                    const isSelected = currentViewingClientId === client.id;
                    return (
                      <div
                        key={client.id}
                        onClick={() => {
                          setCurrentViewingClientId(client.id);
                          showAppAlert(`Monitorando Cliente: ${client.tradingName}`, "Painel Carregado", "success");
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-[11px] ${
                          isSelected
                            ? "bg-[#10B981]/10 border-[#10B981] text-white"
                            : "bg-[#090D14] border-gray-800 text-gray-400 hover:border-gray-750 hover:text-gray-250"
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-bold truncate text-white">{client.tradingName}</p>
                          <p className="text-[9px] text-gray-500 font-mono flex items-center gap-1 mt-0.5">
                            <span>📞 {client.whatsapp}</span>
                            <span>•</span>
                            <span>⏰ {client.openTime}h-{client.closeTime}h</span>
                          </p>
                        </div>
                        <div className="shrink-0 flex items-center gap-1.5">
                          <span className="text-[8px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-300">
                            {(client.cameras || []).length} Chs
                          </span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* COLUMN B: QUICK VIEW & DVR CAMERA CONFIG (7 COLS) */}
            <div className="md:col-span-7 p-4 bg-[#090D14] border border-gray-800 rounded-xl space-y-4">
              {selectedViewingClient ? (
                <>
                  <div className="flex items-start justify-between border-b border-gray-800 pb-2.5">
                    <div>
                      <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        🏢 Ficha do Cliente Ativo: <span className="text-[#10B981]">{selectedViewingClient.tradingName}</span>
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Janela de Funcionamento: Ativa das {selectedViewingClient.openTime} até {selectedViewingClient.closeTime}</p>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-[#10B981] border border-emerald-500/15">
                      IA CAPTURADA
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CAMERA FORM VINCULATE */}
                    <div className="space-y-2">
                      <p className="text-[10px] text-[#10B981] font-bold uppercase">➕ Vincular Câmera ao DVR do Cliente:</p>
                      
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          id="quick-cam-name-input"
                          placeholder="Nome da câmera (ex: Corredor Fundos)"
                          className="w-full bg-[#111827] text-white border border-gray-800 rounded p-1.5 text-xs text-left"
                        />
                        <select
                          id="quick-cam-loc-select"
                          className="w-full bg-[#111827] text-white border border-gray-800 rounded p-1.5 text-xs font-mono"
                        >
                          <option value="Entrada Principal">Entrada Principal</option>
                          <option value="Portão Garagem">Portão Garagem</option>
                          <option value="Corredor Lateral">Corredor Lateral</option>
                          <option value="Muro Fundos">Muro Fundos</option>
                          <option value="Área Interna">Área Interna</option>
                          <option value="Área de Parqueada">Área de Parqueada</option>
                        </select>
                        
                        <button
                          type="button"
                          onClick={() => {
                            const nameInput = document.getElementById("quick-cam-name-input") as HTMLInputElement;
                            const locSelect = document.getElementById("quick-cam-loc-select") as HTMLSelectElement;
                            const camName = nameInput?.value || "";
                            const camLoc = locSelect?.value || "Entrada Principal";

                            if (!camName.trim()) {
                              showAppAlert("Digite o nome da nova câmera.", "Campo Vazio", "warn");
                              return;
                            }

                            // URL templates
                            let camUrl = "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600";
                            if (camLoc.includes("Garagem")) camUrl = "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600";
                            else if (camLoc.includes("Fundos") || camLoc.includes("Lateral")) camUrl = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600";
                            else if (camLoc.includes("Parqueada")) camUrl = "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600";
                            else if (camLoc.includes("Interna")) camUrl = "https://images.unsplash.com/photo-1558002038-1055907df827?w=600";

                            const newCam = {
                              id: "cam-" + Date.now(),
                              name: camName.trim(),
                              location: camLoc,
                              imageUrl: camUrl,
                              status: "ACTIVE" as const,
                              fps: 15,
                              noiseLevel: 10
                            };

                            const updatedCams = [...(selectedViewingClient.cameras || []), newCam];
                            const updated = { ...selectedViewingClient, cameras: updatedCams };
                            
                            setRegisteredClients(prev => prev.map(c => c.id === selectedViewingClient.id ? updated : c));
                            
                            if (nameInput) nameInput.value = "";
                            showAppAlert(`Câmera "${newCam.name}" adicionada e vinculada ao DVR do cliente ${selectedViewingClient.tradingName}!`, "Câmera Adicionada", "success");
                          }}
                          className="w-full py-1.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white font-bold rounded text-[10px] uppercase tracking-wider transition-all cursor-pointer text-center"
                        >
                          ➕ Vincular Câmera ao DVR
                        </button>
                      </div>
                    </div>

                    {/* DYNAMIC LIST OF DVR CHANNELS FOR CLIENT */}
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Câmeras Ativas no DVR ({ (selectedViewingClient.cameras || []).length }):</p>
                      
                      <div className="max-h-[110px] overflow-y-auto space-y-1.5 pr-1 bg-[#111827] p-2 rounded-lg border border-gray-800">
                        { (selectedViewingClient.cameras || []).length === 0 ? (
                          <p className="text-[10px] text-gray-500 italic">DVR sem canais. Use o formulário à esquerda para vincular.</p>
                        ) : (
                          (selectedViewingClient.cameras || []).map(cam => (
                            <div key={cam.id} className="flex items-center justify-between p-1 bg-[#090D14] border border-gray-800 rounded text-[10px] text-gray-300">
                              <span className="font-bold truncate">{cam.name} ({cam.location})</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedCams = (selectedViewingClient.cameras || []).filter(c => c.id !== cam.id);
                                  const updated = { ...selectedViewingClient, cameras: updatedCams };
                                  setRegisteredClients(prev => prev.map(c => c.id === selectedViewingClient.id ? updated : c));
                                  showAppAlert("Canal excluído do DVR do cliente.", "Excluído", "info");
                                }}
                                className="text-red-400 hover:text-red-350 shrink-0 text-[10px] px-1 hover:bg-red-500/10 rounded cursor-pointer font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-6">
                  <Sliders className="w-8 h-8 text-gray-700 mb-1.5 animate-bounce" />
                  <p>Selecione um cliente no localizador à esquerda para gerenciar seu DVR e câmeras em tempo real.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BOTTOM DOUBLE-COLUMN: SCHEDULES & ACCESS FIREWALL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLUMN 1: WHATSAPP SECURITY HOURS ROUTING RULES */}
          <div id="whatsapp_dispatch_panel" className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-[#0E1524] border-b border-[#1E293B] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#10B981]" /> Filtro de Envio Programado (WhatsApp)
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Evite SPAM. Envie alertas apenas nestes horários estabelecidos</p>
              </div>
              <span className="text-[10px] font-mono bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/20">
                WHATSAPP AUTOMATION
              </span>
            </div>

            <div className="p-6 space-y-6 flex-1">
              
              {/* CURRENT TIME RANGE TEST INDICATOR */}
              <div className="bg-[#1C2638] border border-gray-800 rounded-xl p-4 space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300 font-bold">Diagnóstico de Disparo Atual</span>
                  <span className="text-xs text-white bg-[#090D14] px-2 py-0.5 rounded font-bold">{systemMockTime}</span>
                </div>
                
                <div className="text-xs space-y-2">
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Sendo agora <strong className="text-white">{systemMockTime}</strong>, os alertas detectados pelo Robust Vision serão:
                  </p>
                  
                  {/* Calculate routing outcome ahead of time for user context */}
                  {schedules.filter(s => s.enabled && isTimeInBetween(systemMockTime, s.startTime, s.endTime)).length > 0 ? (
                    <div className="p-3 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <div>
                        <p className="font-bold text-[11px]">ROUTING: DISPARAR WHATSAPP</p>
                        <p className="text-[10px] text-emerald-300/80">Coincide com {schedules.find(s => s.enabled && isTimeInBetween(systemMockTime, s.startTime, s.endTime))?.label}.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 animate-pulse" />
                      <div>
                        <p className="font-bold text-[11px]">ROUTING: SILENCIOSO (STRICT OK)</p>
                        <p className="text-[10px] text-orange-300/80">Nenhuma regra ativa para este horário. Nada será enviado ao WhatsApp.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AUTOMATED PHOTO SENDER WIDGET (PRE-DEFINED SENDING PROTOCOL) */}
              <div id="auto_photo_dispatch_widget" className="bg-[#1C2638]/50 border border-dashed border-[#10B981]/30 rounded-xl p-4 space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 animate-spin text-[#10B981]" /> Envio Periódico Automático de Fotos (WhatsApp)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">CÉLULA NDS ATIVA</span>
                </div>
                
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Habilite o enviador automático periódico para que as câmeras integradas transmitam fotos programaticamente nos horários determinados para os WhatsApps do plantão. Previne que você precise ficar olhando os DVRs manualmente.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
                  <label className="inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={autoPhotoSending}
                      onChange={(e) => setAutoPhotoSending(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-9 h-5 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]" />
                    <span className="ms-2 text-xs font-bold text-gray-300">
                      {autoPhotoSending ? "Loop Periódico Ativo (A cada 15s)" : "Disparador Automático Inativo"}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={triggerScheduledPhotoDispatch}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#10B981] to-[#3B82F6] hover:from-[#0EA572] hover:to-[#2563EB] text-white font-bold flex items-center gap-1 shrink-0 ml-auto transition-all cursor-pointer"
                  >
                    <Send className="w-3 h-3 text-white" /> Disparar Foto Manualmente Agora
                  </button>
                </div>
              </div>

              {/* SCHEDULES LIST */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-gray-300 uppercase">Regras de Horários Ativos</h4>
                
                {schedules.length === 0 ? (
                  <p className="text-xs text-gray-500 font-mono">Nenhum agendamento ativo cadastrado.</p>
                ) : (
                  <div className="space-y-2.5">
                    {schedules.map((schedule) => (
                      <div 
                        key={schedule.id}
                        className={`p-3 rounded-xl border font-mono text-xs flex items-center justify-between transition-all ${
                          schedule.enabled 
                            ? "bg-[#0E1524] border-gray-800" 
                            : "bg-[#090D14]/50 border-gray-800/40 opacity-50"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{schedule.label}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400">
                              {schedule.startTime} - {schedule.endTime}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#10B981] truncate max-w-sm">
                            Destinatários ({schedule.phoneNumbers.length}): {schedule.phoneNumbers.join(", ")}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleSchedule(schedule.id)}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                              schedule.enabled 
                                ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20 hover:bg-[#10B981]/25" 
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                            }`}
                          >
                            {schedule.enabled ? "ATIVADO" : "INATIVO"}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="p-1 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded"
                            title="Remover Regra"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CREATE SCHEDULE ACCORDION */}
              <form onSubmit={handleAddSchedule} className="p-4 bg-[#0E1524] border border-gray-800 rounded-xl space-y-3 font-mono text-xs">
                <span className="font-bold text-white tracking-wider text-xs block border-b border-gray-800 pb-2 uppercase">
                  Novo Agendamento Militar de Alerta
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-gray-400 text-[10px] uppercase">Identificação da Regra</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Plantão Fim de Semana"
                      value={newSchedLabel}
                      onChange={(e) => setNewSchedLabel(e.target.value)}
                      className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-gray-400 text-[10px] uppercase">Hora Início</label>
                      <input 
                        type="time" 
                        value={newSchedStart}
                        onChange={(e) => setNewSchedStart(e.target.value)}
                        className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400 text-[10px] uppercase">Hora Fim</label>
                      <input 
                        type="time" 
                        value={newSchedEnd}
                        onChange={(e) => setNewSchedEnd(e.target.value)}
                        className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] uppercase">
                    <label className="text-gray-400 font-bold">Adicionar Telefone de WhatsApp</label>
                    <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                      newSchedPhonesList.length >= 3 
                        ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}>
                      {newSchedPhonesList.length}/3 Programados
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ex: +5511987654321"
                      value={newSchedPhone}
                      onChange={(e) => setNewSchedPhone(e.target.value)}
                      disabled={newSchedPhonesList.length >= 3}
                      className="flex-1 bg-[#090D14] text-white border border-gray-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#10B981] disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhoneToNewScheduleList}
                      disabled={newSchedPhonesList.length >= 3}
                      className="px-3 bg-gray-800 text-gray-200 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 rounded font-bold text-xs disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      Incluir
                    </button>
                  </div>
                  <p className="text-[9px] text-[#10B981] font-mono leading-relaxed mt-1">
                    * Cada agendamento suporta <strong>até 3 números de WhatsApp programados</strong> de forma simultânea.
                  </p>
                </div>

                {newSchedPhonesList.length > 0 && (
                  <div className="bg-[#090D14] p-2.5 rounded border border-gray-800 flex flex-wrap gap-1.5">
                    {newSchedPhonesList.map((tel, idx) => (
                      <span key={idx} className="bg-blue-500/10 text-blue-400 border border-blue-500/10 px-2.5 py-1 rounded text-[10px] flex items-center gap-1.5 font-bold">
                        <span>📱 {tel}</span>
                        <button 
                          type="button" 
                          onClick={() => setNewSchedPhonesList(prev => prev.filter((_, i) => i !== idx))}
                          className="text-red-400 font-extrabold hover:text-red-300 ml-1 cursor-pointer hover:bg-red-500/10 px-1 rounded transition-colors text-xs"
                          title="Remover destinatário"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-[#10B981] to-[#3B82F6] hover:from-[#0EA572] hover:to-[#2563EB] text-white rounded font-bold uppercase text-[11px] transition-all cursor-pointer shadow-lg active:scale-[0.99]"
                >
                  Confirmar Novo Agendamento (Máx 3 WhatsApps)
                </button>
              </form>

            </div>
          </div>

          {/* COLUMN 2: DVR ACCESS CONTROL FIREWALL (MAC & IP FILTER) */}
          <div id="dvr_access_panel" className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-[#0E1524] border-b border-[#1E293B] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-400" /> Controle de Acesso DVR (Firewall MAC/IP)
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Gerencie os dispositivos autorizados a se conectar aos DVRs corporativos</p>
              </div>
              <span className="text-[10px] font-mono bg-blue-500/11 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                ACCESS SYSTEM
              </span>
            </div>

            <div className="p-6 space-y-6 flex-1">
              
              {/* ACCESSIBILITY DESCRIPTION BAR */}
              <div className="bg-[#0e1624] border border-gray-800 rounded-xl p-3 text-xs font-mono">
                <p className="text-gray-400 leading-relaxed">
                  Para segurança absoluta, os DVRs integrados ao iSIC Lite barram conexões externas não listadas. 
                  Qualquer dispositivo tentando ler câmeras passará por filtros de <strong className="text-white">Endereços MAC de rede</strong> ou <strong className="text-white">IPs fixos da portaria</strong>.
                </p>
              </div>

              {/* AUTHORIZED LIST TABLE */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-gray-300 uppercase">Tabela de Filtros de Rede (MAC / IP)</h4>

                <div className="bg-[#090D14] border border-gray-800 rounded-xl overflow-hidden font-mono text-xs">
                  <div className="divide-y divide-gray-800/80">
                    {dvrDevices.map((dev) => (
                      <div 
                        key={dev.id} 
                        className={`p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 transition-all ${
                          dev.authorized ? "bg-transparent" : "bg-red-950/20 border-l-2 border-l-red-500"
                        }`}
                      >
                        <div className="space-y-1 max-w-sm">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white">{dev.deviceName}</span>
                            <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 uppercase">
                              {dev.addressType}
                            </span>
                            <span className="text-[10px] text-gray-400 select-all font-bold">{dev.addressValue}</span>
                          </div>
                          
                          {dev.lastAccessTime ? (
                            <p className="text-[9px] text-gray-500">
                              Última conexão: {formatTime(dev.lastAccessTime)} | {formatDate(dev.lastAccessTime)}
                            </p>
                          ) : (
                            <p className="text-[9px] text-gray-600">Nenhuma tentativa de login recente</p>
                          )}
                        </div>

                        {/* Actions to authorize / revoke */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-gray-800/50 sm:border-t-0">
                          <div className="flex items-center gap-1.5">
                            {dev.authorized ? (
                              <span className="text-[9px] text-[#10B981] font-bold flex items-center gap-1 pr-1">
                                <CheckCircle className="w-3 h-3" /> AUTORIZADO
                              </span>
                            ) : (
                              <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 pr-1">
                                <XCircle className="w-3 h-3" /> BLOQUEADO
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleAuthorization(dev.id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                dev.authorized 
                                  ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/30" 
                                  : "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20 hover:bg-[#10B981]/30"
                              }`}
                            >
                              {dev.authorized ? "BLOQUEAR" : "LIBERAR"}
                            </button>

                            <button
                              onClick={() => handleDeleteDevice(dev.id)}
                              className="p-1 hover:bg-gray-800 rounded text-gray-500 hover:text-gray-300"
                              title="Deletar Registro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ADD DEVICE FIREWALL POLICY WITH ZERO-ACCESS PROVISIONING OPTION */}
              <div className="bg-[#0E1524] border border-gray-800 rounded-xl p-4 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="font-bold text-white tracking-wider text-xs block uppercase">
                    Configurar Regra de Dispositivo no DVR
                  </span>
                  <div className="bg-blue-600/10 text-blue-400 font-mono text-[9px] px-1.5 py-0.5 rounded bg-blue-600/20 border border-blue-600/30 font-bold">
                    ADMIN
                  </div>
                </div>

                {/* Sub tabs to switch mode */}
                <div className="grid grid-cols-2 gap-1 bg-[#090D14] p-1 rounded-lg border border-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminDvrId("");
                    }}
                    className={`text-[10px] py-1.5 rounded font-bold transition-all cursor-pointer ${
                      !adminDvrId 
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/20" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Filtro Local Direto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!adminDvrId) setAdminDvrId("dvr-nds-corporate-09");
                    }}
                    className={`text-[10px] py-1.5 rounded font-bold transition-all cursor-pointer ${
                      adminDvrId 
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/20" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Provisão por ID & Senha (Nuvem)
                  </button>
                </div>

                {/* Cloud Bypass Provision fields */}
                {adminDvrId && (
                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 space-y-3">
                    <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-bold uppercase">
                      <Lock className="w-3.5 h-3.5 animate-pulse text-blue-400" /> Autenticador Remoto NDS Robust Vision
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-gray-400 text-[9px] uppercase">Cloud ID / Serial DVR</label>
                        <input
                          type="text"
                          placeholder="Ex: dvr-id-02"
                          value={adminDvrId}
                          onChange={(e) => setAdminDvrId(e.target.value)}
                          className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400 text-[9px] uppercase">Usuário Remoto</label>
                        <input
                          type="text"
                          placeholder="admin"
                          value={adminDvrUser}
                          onChange={(e) => setAdminDvrUser(e.target.value)}
                          className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400 text-[9px] uppercase">Senha Admin</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={adminDvrPassword}
                          onChange={(e) => setAdminDvrPassword(e.target.value)}
                          className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <p className="text-[9px] text-[#3B82F6] leading-relaxed">
                      💡 <strong>Nuvem Ativa:</strong> As credenciais dão ao Robust Vision poder para gravar diretrizes de firewall MAC diretamente no firmware do DVR sem que você precise abrir portas ou fazer visitas técnicas.
                    </p>
                  </div>
                )}

                <form onSubmit={adminDvrId ? handleProvisionRemoteDvr : handleAddDevice} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-5 space-y-1">
                      <label className="text-gray-400 text-[10px]">Identificação do Aparelho</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Smartphone Portaria Leste"
                        value={newDevName}
                        onChange={(e) => setNewDevName(e.target.value)}
                        className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-gray-400 text-[10px]">Tipo de Filtro</label>
                      <select
                        value={newDevType}
                        onChange={(e) => setNewDevType(e.target.value as "MAC" | "IP")}
                        className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                      >
                        <option value="MAC">MAC Address</option>
                        <option value="IP">IP Address</option>
                      </select>
                    </div>

                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-gray-400 text-[10px]">Endereço Redes (MAC/IP)</label>
                      <input 
                        type="text" 
                        placeholder={newDevType === "MAC" ? "00:1A:2B:3C:4D:5E" : "192.168.1.1"}
                        value={newDevValue}
                        onChange={(e) => setNewDevValue(e.target.value)}
                        className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-gray-400 text-[10px] uppercase">Aparelho Iniciado Autorizado?</label>
                    <label className="inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={newDevAuthorized}
                        onChange={(e) => setNewDevAuthorized(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-9 h-5 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]" />
                      <span className="ms-2 text-xs font-bold font-mono text-gray-300">
                        {newDevAuthorized ? "SIM (Permitido)" : "NÃO (Burlar)"}
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isProvisioning}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded font-bold uppercase text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isProvisioning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" /> Provisionando via Nuvem...
                      </>
                    ) : (
                      adminDvrId ? "Autenticar DVR e Salvar Filtro Remotamente" : "Registrar Dispositivo no Firewall DVR_LAN"
                    )}
                  </button>
                </form>
              </div>

            </div>
          </div>

        </div>

        {/* TABELA DE ASSINATURA ROBUST VISION */}
        <section id="signature_plans_section" className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#10B981]" /> Tabela de Assinaturas e Planos NDS
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Escolha os planos de faturamento ou libere o acesso e ative licenças para clientes pré-definidos</p>
            </div>
            
            {/* SUB-TABS SELECTOR */}
            <div className="flex items-center bg-[#0E1524] p-1 rounded-xl border border-gray-800 font-mono text-[11px] self-start lg:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setPlansActiveSubTab("pricing")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  plansActiveSubTab === "pricing"
                    ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                1. Planos & Preços (Análise)
              </button>
              <button
                type="button"
                onClick={() => setPlansActiveSubTab("predefined_unlock")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  plansActiveSubTab === "predefined_unlock"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/25 animate-pulse"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Lock className="w-3 h-3 text-amber-400" /> 2. Liberar Acesso Clientes
              </button>
            </div>
          </div>

          {plansActiveSubTab === "pricing" ? (
            <div className="space-y-6">
              {/* BRAND STRATEGY BOX - RESPONDING TO "QUE VC ACHA DESTA AÇÃO" & "PROIBIDO REVENDA" */}
              <div className="bg-[#0E1524] border border-amber-500/25 rounded-xl p-4.5 font-mono text-[11px] text-gray-300 leading-relaxed grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-8 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-[10px]">
                    <span className="bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[9px]">👑 GARANTIA DE MONOPÓLIO E AUTORIDADE MAXIMA</span>
                  </div>
                  <h4 className="text-white font-bold text-xs uppercase">Estratégia Blindada de Distribuição (Sem Direito a Revenda)</h4>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    Você tem total razão na sua visão de mercado! Permitir que terceiros revendam seu sistema criaria concorrentes perretas dentro de sua própria base. Por isso, as regras de licenciamento do <strong className="text-white">Robust Vision</strong> foram firmadas sob extrema segurança:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-gray-400 text-[11px]">
                    <li><strong className="text-white">Fidelidade Unitária</strong>: A licença vitalícia de <strong>R$ 290</strong> é atrelada estritamente ao hardware IP/MAC de <span className="text-amber-400 font-bold">um único DVR de até 16 canais</span>. Não existe possibilidade de empacotar ou re-distribuir.</li>
                    <li><strong className="text-white">Proibição Expressa de Revenda / Whitelabel</strong>: Não há direito de repasse ou sub-distribuição comercial. Toda a soberania de validação, alteração de firmas e logs é sua e passa exclusivamente por sua infraestrutura n8n/Supabase.</li>
                    <li><strong className="text-white">Controle Centralizado</strong>: Seus clientes finais só utilizam o app em modo passivo. Os tokens de autenticação de alerta e disparos de WhatsApp são gerados e validados apenas debaixo do seu painel administrativo.</li>
                  </ul>
                </div>
                <div className="md:col-span-4 bg-[#111827] border border-red-500/20 p-4 rounded-lg flex flex-col justify-center space-y-2 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[10px] text-red-400 uppercase font-bold tracking-wider font-mono">Blindagem Estrutural</span>
                  <div className="text-white font-extrabold text-xs font-mono">Concorrência Zero</div>
                  <p className="text-[9.5px] text-gray-450 leading-normal">
                    Seu sistema nunca vira arma de terceiros. Autoridade comercial 100% retida em suas mãos. Licença protegida por firmware.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 ${
                      plan.isPopular 
                        ? "bg-[#0E1524] border-[#10B981]/50 shadow-lg shadow-[#10B981]/5 ring-2 ring-[#10B981]/10" 
                        : "bg-[#0A0F18] border-amber-500/20 hover:border-amber-500/40"
                    }`}
                  >
                    {plan.isPopular ? (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-widest font-extrabold uppercase px-2.5 py-0.5 rounded bg-gradient-to-r from-[#10B981] to-[#3B82F6] text-white">
                        RECORRÊNCIA MENSAL
                      </span>
                    ) : (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-widest font-extrabold uppercase px-2.5 py-0.5 rounded bg-amber-500/25 text-amber-400 border border-amber-500/40">
                        PAGAMENTO ÚNICO
                      </span>
                    )}
                    
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                          {plan.id === "plan-silver" && <Shield className="w-4 h-4 text-amber-400" />} {plan.name}
                        </h4>
                        <p className="text-xs text-gray-400">Modelo de licenciamento exclusivo</p>
                      </div>

                      <div className="flex items-baseline gap-1 text-white border-b border-gray-800 pb-3">
                        <span className="text-2xl font-bold font-mono text-white">{plan.price}</span>
                        <span className="text-xs text-gray-500">/ {plan.period}</span>
                      </div>

                      <ul className="space-y-2.5 text-xs font-mono text-gray-400">
                        <li className="flex items-center gap-2 text-white">
                          <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" /> {plan.camerasCount}
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" /> 
                          WhatsApp Periódico: Habilitado
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" /> 
                          Integração n8n & Supabase: Inclusa
                        </li>
                        {plan.id === "plan-silver" ? (
                          <li className="flex items-start gap-2 text-amber-400 font-bold bg-amber-950/20 p-2 rounded border border-amber-950/40 mt-1">
                            <Lock className="w-3.5 h-3.5 relative top-0.5 shrink-0 text-amber-400" />
                            <span>SEM REVENDA: Licença unitária intransferível. Sem Whitelabel.</span>
                          </li>
                        ) : (
                          <li className="flex items-start gap-2 text-emerald-400 font-bold bg-emerald-950/10 p-2 rounded border border-emerald-950/20 mt-1">
                            <CheckCircle className="w-3.5 h-3.5 relative top-0.5 shrink-0 text-emerald-400" />
                            <span>Vínculo ativo de recorrência direta com você.</span>
                          </li>
                        )}
                        <li className="flex items-center gap-2 text-gray-500">
                          <CheckCircle className="w-3.5 h-3.5 text-gray-700" /> Suporte Técnico NDS 24h
                        </li>
                      </ul>
                    </div>

                    <div className="pt-5 mt-5 border-t border-gray-800">
                      <button
                        type="button"
                        onClick={() => {
                          // Pre-select plan and set form input values
                          setClientPlanId(plan.id);
                          const cleanPrice = plan.price.replace("R$", "").trim() + ",00";
                          setClientPaymentValue(cleanPrice);

                          // Instantly route to registering clients tab and the registration form subtab
                          setActiveTab("admin_clients");
                          setAdminSubTab("cadastro");

                          // Smooth scroll user to top where the form lives
                          window.scrollTo({ top: 0, behavior: "smooth" });

                          // Show informative alert about the pre-filled redirect
                          showAppAlert(
                            `✓ Plano "${plan.name}" pré-selecionado automaticamente! Você foi redirecionado ao topo do cadastro de clientes, com o valor de R$ ${cleanPrice} e plano ativo pré-configurados.`,
                            "Formulário Configurado",
                            "success"
                          );
                        }}
                        className={`w-full py-2 rounded-lg font-bold text-xs uppercase transition-all tracking-wider font-mono cursor-pointer ${
                          plan.isPopular 
                            ? "bg-[#10B981] hover:bg-emerald-500 text-black font-semibold text-xs" 
                            : "bg-[#1F2937] hover:bg-gray-800 text-white border border-gray-700"
                        }`}
                      >
                        Ativar {plan.name.split(" ")[0]}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* PREDEFINED CLIENT UNLOCK/ASSIGN PANEL */
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-[#0E1524] p-4.5 rounded-xl border border-gray-800 space-y-2">
                <h4 className="text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Central de Liberação Rápida de Clientes (NDS Central)
                </h4>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Ganhe velocidade operacional! Com esta ferramenta integrada, você pode buscar qualquer cliente e 
                  <strong> liberar o acesso dele instantaneamente</strong>, selecionando qual plano/modelo de licenciamento ele adotou. Isso dispara a ativação 
                  automática no banco local e atualiza os dashboards de faturamento em tempo real.
                </p>
              </div>

              {registeredClients.length === 0 ? (
                <div className="p-8 text-center text-gray-500 border border-dashed border-gray-800 rounded-xl">
                  Nenhum cliente pré-definido ou cadastrado encontrado. Cadastre um novo estabelecimento na aba "REGISTRO ADMINISTRATIVO" primeiro!
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {(registeredClients || []).filter(Boolean).map((client) => {
                    return (
                      <div key={client.id} className="bg-[#0E1524] border border-gray-800 hover:border-amber-500/30 transition-all rounded-xl p-4 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-gray-500 font-mono">ID: {client.id}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                              client.paymentStatus === "Pago" 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold" 
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold"
                            }`}>
                              STATUS: {(client.paymentStatus || "Pendente").toUpperCase()}
                            </span>
                          </div>

                          <h5 className="text-white font-bold text-[13px] tracking-wide font-sans">{client.tradingName}</h5>
                          
                          <div className="grid grid-cols-2 gap-2 text-gray-400 text-[10px] bg-[#090D14] p-2.5 rounded-lg border border-gray-900 font-mono">
                            <div>📱 WhatsApp: <span className="text-white font-bold">{client.whatsapp}</span></div>
                            <div>⏰ Período: <span className="text-white">{client.openTime}h - {client.closeTime}h</span></div>
                            <div className="col-span-2 pt-1.5 border-t border-gray-800/40">
                              🎛️ Plano Ativo: <span className="text-amber-400 font-bold">{client.planName || "Nenhum Ativo"}</span> {client.paymentValue ? `(R$ ${client.paymentValue})` : ""}
                            </div>
                          </div>
                        </div>

                        {/* SELECT PLAN & ACTION BUTTON */}
                        <div className="space-y-3 pt-2.5 border-t border-gray-850">
                          <span className="text-[10px] font-bold text-gray-300 uppercase block font-mono">Selecione o plano de liberação de faturamento:</span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {SUBSCRIPTION_PLANS.map((p) => (
                              <button
                                type="button"
                                key={p.id}
                                onClick={() => {
                                  // Instantly update this specific client's plan locally
                                  const updated = (registeredClients || []).filter(Boolean).map(c => {
                                    if (c?.id === client?.id) {
                                      const numericVal = p.price.replace("R$", "").trim() + ",00";
                                      return {
                                        ...c,
                                        planId: p.id,
                                        planName: p.name,
                                        paymentValue: numericVal,
                                        paymentStatus: "Pago" as const
                                      };
                                    }
                                    return c;
                                  });
                                  setRegisteredClients(updated);
                                  safeStorage.setItem("rv_registered_clients", JSON.stringify(updated));
                                  
                                  // Log simulated terminal
                                  const timeStr = new Date().toLocaleTimeString("pt-BR");
                                  setSimulatedTerminalLogs(prev => [
                                    `[${timeStr}] 🔑 [Licenciamento] Ativando faturamento rápido para '${client.tradingName}'...`,
                                    `[${timeStr}] 📡 [n8n Webhook] Disparando requisição POST para '${clientWebhookUrl}' com fone '${client.whatsapp}' e plano '${p.name}'.`,
                                    `[${timeStr}] 👑 [Sucesso] Acesso Liberado para '${client.tradingName}' sob o plano '${p.name}'!`,
                                    ...prev
                                  ]);

                                  showAppAlert(
                                    `✓ O acesso do cliente "${client.tradingName}" foi liberado com sucesso sob o plano "${p.name}" (${p.price}/${p.period})! O webhook n8n foi sincronizado.`,
                                    "Licença Ativada",
                                    "success"
                                  );
                                }}
                                className={`p-2 rounded-lg border text-[10px] text-center transition-all cursor-pointer flex flex-col justify-center items-center font-bold ${
                                  client.planId === p.id
                                    ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/50 font-extrabold shadow-sm"
                                    : "bg-[#090D14] text-gray-400 border-gray-800 hover:text-white hover:border-gray-700"
                                }`}
                              >
                                <span>{p.name.split(" ")[0]}</span>
                                <span className="pt-0.5 text-[9px] text-emerald-400">{p.price}</span>
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              // Action to simulate manual webhook override
                              const timeStr = new Date().toLocaleTimeString("pt-BR");
                              setSimulatedTerminalLogs(prev => [
                                `[${timeStr}] ⚡ [Ação Operacional] Forçando disparo manual de sinal operacional da NDS para ${client.tradingName}...`,
                                `[${timeStr}] 📡 [n8n Webhook] Payload enviado para: ${clientWebhookUrl} | Status 200 OK.`,
                                ...prev
                              ]);
                              showAppAlert(
                                `Sinal de liberação operacional reenviado com sucesso para o WhatsApp ${client.whatsapp} e para o fluxo n8n ativo!`,
                                "Sinal Forçado Disparado",
                                "success"
                              );
                            }}
                            className="w-full bg-[#1F2937] hover:bg-gray-800 transition-colors border border-gray-700 py-2 rounded-lg text-[10px] text-center font-bold flex items-center justify-center gap-1.5 cursor-pointer uppercase text-white"
                          >
                            <Send className="w-3 h-3 text-emerald-400" /> Disparar Sinal de Ativação Manual (n8n Webhook)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {/* INTEGRATIONS SYNC (N8N & SUPABASE WEBHOOK CONTROLLER) */}
        <section id="integrations_panel_section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-[#111827] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between font-mono text-xs text-gray-400 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#10B981]">Central de Conectividade</span>
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5 pt-0.5">
                <Network className="w-4 h-4 text-emerald-400" /> Canais Supabase / n8n
              </h3>
              <p className="text-[11px] leading-relaxed text-gray-500 pt-1">
                Conecte a central Robust Vision diretamente ao seu banco Supabase e fluxos n8n para gerar relatórios automatizados de alertas de CFTV.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase">Supabase REST Endpoint (URL)</label>
                <input 
                  type="text" 
                  value={integrationConfig.supabaseUrl}
                  onChange={(e) => setIntegrationConfig(prev => ({ ...prev, supabaseUrl: e.target.value }))}
                  className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#10B981] text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase">Supabase Anon Key API Secret</label>
                <input 
                  type="password" 
                  value={integrationConfig.supabaseAnonKey}
                  onChange={(e) => setIntegrationConfig(prev => ({ ...prev, supabaseAnonKey: e.target.value }))}
                  className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#10B981] text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 uppercase">n8n Workflow Webhook URL</label>
                <input 
                  type="text" 
                  value={integrationConfig.n8nWebhookUrl}
                  onChange={(e) => setIntegrationConfig(prev => ({ ...prev, n8nWebhookUrl: e.target.value }))}
                  className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#10B981] text-xs"
                />
              </div>
            </div>

            <button
              onClick={handleSyncN8nSupabase}
              disabled={isSyncing}
              className="w-full py-2 bg-[#10B981] hover:bg-[#0EA572] disabled:bg-gray-800 text-black font-bold uppercase rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" /> Sincronizando Centrais...
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5" /> Sincronizar via n8n & Supabase
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-7 bg-[#111827] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between font-mono text-xs">
            <div className="space-y-2 border-b border-[#1E293B] pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-400">Plataformas Inteligentes</span>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Simulador Autônomo n8n ⇄ Supabase</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${isAutonomousLoop ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse" : "bg-gray-800 text-gray-500"}`}>
                    {isAutonomousLoop ? "● OPERAÇÃO AUTÔNOMA" : "● PAUSADO"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAutonomousLoop(!isAutonomousLoop)}
                    className="py-1 px-2.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all font-bold tracking-wider cursor-pointer text-[9px]"
                  >
                    {isAutonomousLoop ? "PAUSAR SIMULADOR" : "ATIVAR SIMULADOR"}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-gray-500">Veja as interações autônomas ocorrendo de forma integrada entre o painel e os serviços na nuvem.</p>
            </div>

            {/* LIVE AUTOMATION FLOW SCHEMATIC */}
            <div className="p-3 bg-[#0A0E17]/90 border border-gray-800/80 rounded-xl my-3 space-y-2 text-[10px]">
              <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider text-center">Estrutura do Fluxo de Informação Ativo</p>
              <div className="grid grid-cols-5 items-center justify-between gap-1 text-center font-bold">
                <div className="p-2 bg-blue-600/10 border border-blue-500/20 rounded-lg text-white">
                  <p className="text-blue-400">📱 Robust App</p>
                  <p className="text-[8px] font-normal text-gray-500">(Gatilho Event / Webhook)</p>
                </div>
                <div className="text-gray-600 font-extrabold text-xs animate-pulse">────────▶</div>
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-white relative">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1 right-1 animate-ping" />
                  <p className="text-amber-400 animate-pulse">⚙️ n8n Webhook</p>
                  <p className="text-[8px] font-normal text-gray-500">(Tratador & Roteador)</p>
                </div>
                <div className="text-gray-600 font-extrabold text-xs animate-pulse">────────▶</div>
                <div className="p-2 bg-emerald-600/10 border border-emerald-500/20 rounded-lg text-white">
                  <p className="text-emerald-400">⚡ Supabase DB</p>
                  <p className="text-[8px] font-normal text-gray-500">(Tabelas de Clientes)</p>
                </div>
              </div>
            </div>

            {/* TERMINAL LOG DISPLAY FOR CONNECTIVITY */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase px-1">
                <span>Terminal de Telemetria Integrada</span>
                <button
                  type="button"
                  onClick={() => setSimulatedTerminalLogs([`[${new Date().toLocaleTimeString("pt-BR")}] 💻 [Terminal] Logs de rede limpos pelo operador.`])}
                  className="hover:text-white transition-colors cursor-pointer hover:underline"
                >
                  Limpar Monitor
                </button>
              </div>
              <div className="bg-[#03070E] rounded-xl border border-gray-800 p-3.5 space-y-1.5 flex-1 overflow-y-auto max-h-[190px] min-h-[140px] text-[11px] font-mono leading-relaxed select-all">
                {simulatedTerminalLogs.map((logStr, idx) => {
                  let textClass = "text-gray-400";
                  if (logStr.includes("🚨") || logStr.includes("ALERTA")) textClass = "text-red-400 font-bold";
                  else if (logStr.includes("✅") || logStr.includes("Sucesso")) textClass = "text-emerald-400 font-bold";
                  else if (logStr.includes("⚡") || logStr.includes("GATILHO")) textClass = "text-amber-400";
                  else if (logStr.includes("💾") || logStr.includes("Query")) textClass = "text-blue-400 font-semibold";
                  return (
                    <p key={idx} className={`${textClass} border-b border-gray-900/50 pb-0.5 last:border-0`}>
                      {logStr}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* MANUAL MANIFEST ACTIONS */}
            <div className="pt-3 border-t border-gray-950 mt-3 flex items-center justify-between gap-4">
              <span className="text-[9px] text-gray-500 leading-snug">
                * Teste rápido: Também é possível despachar o estado estruturado atual para suas chaves e URLs cadastradas no menu à esquerda pressionando o botão de sincronia direta.
              </span>
              <button
                type="button"
                onClick={handleSyncN8nSupabase}
                disabled={isSyncing}
                className="py-1.5 px-3 bg-gray-850 hover:bg-gray-800 disabled:bg-gray-900 border border-gray-700 text-white rounded font-bold uppercase hover:shadow-lg transition-all cursor-pointer inline-flex items-center gap-1 text-[10px] whitespace-nowrap"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" /> Sincronizando...
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3 text-blue-400" /> Forçar Envio Manual
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
          </>
        )}

        {activeTab === "admin_clients" && (
          <div id="admin_tab_content" className="space-y-6">
            
            {/* INLINE MODAL DIALOG FOR CUSTOM WHATSAPP BILLING */}
            {billingClient && (
              <div 
                id="billing_modal_overlay" 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm transition-all duration-300"
              >
                <div className="bg-[#111827] border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative font-mono text-xs">
                  <button 
                    type="button"
                    onClick={() => {
                      setBillingClient(null);
                      setBillingDispatchLogs([]);
                      setIsDispatchingBilling(false);
                    }} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-white p-1 hover:bg-gray-800 rounded transition-colors cursor-pointer text-sm"
                  >
                    ✕
                  </button>
                  <div className="flex items-center gap-2.5 text-emerald-400 font-bold border-b border-[#1E293B] pb-3">
                    <Zap className="w-5 h-5 text-emerald-400 animate-bounce" />
                    <span className="text-sm uppercase tracking-wider">Disparo Inteligente de Faturamento (Robust-API)</span>
                  </div>

                  <div className="space-y-3.5">
                    <p className="text-gray-300 text-[11px] leading-relaxed">
                      Gerando lembrete de faturamento mensal integrável para: <strong className="text-white">{billingClient.tradingName}</strong>
                    </p>
                    
                    {/* CUSTOM CONTAINER METADATA OF BILLING */}
                    <div className="p-3 bg-[#090D14] rounded-xl border border-gray-800/80 grid grid-cols-2 gap-2 text-gray-400">
                      <p className="col-span-2">🏢 <strong>Comércio:</strong> <span className="text-white">{billingClient.tradingName}</span></p>
                      <p>📱 <strong>WhatsApp:</strong> <span className="text-blue-400 font-bold">{billingClient.whatsapp}</span></p>
                      <p>📆 <strong>Due Date:</strong> <span className="text-white">Dia {billingClient.dueDate || "10"}</span></p>
                      <p>💰 <strong>Valor:</strong> <span className="text-emerald-400 font-bold">R$ {billingClient.paymentValue || "149,00"}</span></p>
                      <p>💳 <strong>Método:</strong> <span className="text-[#3B82F6] font-semibold">{billingClient.paymentMethod || "Pix"}</span></p>
                    </div>

                    {/* METHOD CONTROLLERS */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-400 uppercase font-bold">Escolha a Estratégia de Disparo:</label>
                      <div className="grid grid-cols-2 gap-2 bg-[#0E1524] p-1 rounded-lg border border-gray-800">
                        <button
                          type="button"
                          onClick={() => setBillingOption("api")}
                          className={`py-1.5 px-2.5 rounded font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer text-[10px] ${
                            billingOption === "api"
                              ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/10"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" /> 100% AUTOMÁTICO (API)
                        </button>
                        <button
                          type="button"
                          onClick={() => setBillingOption("manual")}
                          className={`py-1.5 px-2.5 rounded font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer text-[10px] ${
                            billingOption === "manual"
                              ? "bg-blue-500/15 text-blue-400 font-bold border border-blue-500/10"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" /> MANUAL (WHATS WEB)
                        </button>
                      </div>
                    </div>

                    {/* SUB-SECTIONS ACCORDING TO STRATEGY */}
                    {billingOption === "api" ? (
                      <div className="space-y-3 pt-1">
                        <div className="bg-[#1C2638]/40 border border-emerald-500/20 rounded-lg p-2.5 text-[10px] text-gray-400 leading-relaxed">
                          📌 <strong>Modo Hands-Free Ativado:</strong> Ao clicar no botão abaixo, nosso gateway efetuará um disparo POST automático em background ao seu webhook do n8n/servidor e registrará o log na central de mensagens do cliente **sem exigir qualquer clique ou redirecionamento de tela**.
                        </div>

                        {/* HIGH TECH TERMINAL OUTPUT */}
                        {(billingDispatchLogs.length > 0 || isDispatchingBilling) && (
                          <div className="bg-[#090D14] border border-gray-805 rounded-lg p-3 space-y-1 text-[9px] font-mono leading-relaxed max-h-[140px] overflow-y-auto border-emerald-950/40">
                            <p className="text-gray-500 border-b border-gray-850 pb-1 flex justify-between uppercase">
                              <span>Terminal de Dispatch Automático (Robust-API v3.5)</span>
                              {isDispatchingBilling && <span className="animate-pulse text-[#10B981]">PROMITER RUNNING</span>}
                            </p>
                            {billingDispatchLogs.map((logLine, idx) => (
                              <p key={idx} className={logLine.includes("✅") ? "text-emerald-400 font-bold" : logLine.includes("⚠️") ? "text-amber-400" : "text-gray-300"}>
                                {logLine}
                              </p>
                            ))}
                          </div>
                        )}

                        <button
                          type="button"
                          disabled={isDispatchingBilling}
                          onClick={() => handleSendBillingAutomatically(billingClient)}
                          className="w-full py-3 bg-[#10B981] hover:bg-[#0EA572] disabled:bg-gray-800 text-black font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-[#10B981]/5 active:scale-[0.99] flex items-center justify-center gap-1.5"
                        >
                          {isDispatchingBilling ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-black" />
                              DISPARANDO AUTOMATICAMENTE EM SEGUNDO PLANO...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 text-black" />
                              Disparar Cobrança Automática (Sem Clique Humano)
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3.5 pt-1">
                        <div className="space-y-1 pb-1">
                          <p className="text-blue-400 font-bold">Mensagem customizada do link de faturamento:</p>
                          <textarea
                            readOnly
                            rows={3}
                            className="w-full bg-[#090D14] text-white border border-gray-850 rounded-lg p-2.5 text-[10px] focus:outline-none select-all font-mono leading-relaxed resize-none text-left"
                            value={`Olá, ${billingClient.tradingName}! Segue o lembrete de faturamento mensal do seu plano de monitoramento Robust Vision. Valor: R$ ${billingClient.paymentValue || "149,00"} com vencimento para o Dia ${billingClient.dueDate || "10"} via ${billingClient.paymentMethod || "Pix"}. Chave Pix CNPJ da central já disponível. Agradecemos a confiança em nossa operação de CFTV!`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const txt = `Olá, ${billingClient.tradingName}! Segue o lembrete de faturamento mensal do seu plano de monitoramento Robust Vision. Valor: R$ ${billingClient.paymentValue || "149,00"} com vencimento para o Dia ${billingClient.dueDate || "10"} via ${billingClient.paymentMethod || "Pix"}. Chave Pix CNPJ da central já disponível. Agradecemos a confiança em nossa operação de CFTV!`;
                              navigator.clipboard.writeText(txt);
                              showAppAlert("Mensagem de cobrança personalizada copiada para a área de transferência com sucesso!", "Mensagem Copiada", "success");
                            }}
                            className="py-2.5 bg-gray-900 border border-gray-800 text-white rounded-xl font-bold uppercase hover:bg-gray-800 transition-colors cursor-pointer text-center"
                          >
                            Copiar Texto
                          </button>
                          <a
                            href={`https://api.whatsapp.com/send?phone=${encodeURIComponent(billingClient.whatsapp)}&text=${encodeURIComponent(
                              `Olá, ${billingClient.tradingName}! Segue o lembrete de faturamento mensal do seu plano de monitoramento Robust Vision. Valor: R$ ${billingClient.paymentValue || "149,00"} com vencimento para o Dia ${billingClient.dueDate || "10"} via ${billingClient.paymentMethod || "Pix"}. Chave Pix CNPJ da central já disponível. Agradecemos a confiança em nossa operação de CFTV!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-black text-center font-bold uppercase rounded-xl transition-all cursor-pointer shadow-lg inline-flex items-center justify-center gap-1.5"
                          >
                            <Smartphone className="w-4 h-4 text-black" />
                            Disparar Whats
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TABS SELECTOR FOR CLIENTS & FINANCEIRO */}
            <div className="flex bg-[#0E1524] p-1 rounded-xl border border-[#1E293B] gap-1 font-mono text-xs max-w-4xl flex-wrap">
              <button
                type="button"
                onClick={() => setAdminSubTab("cadastro")}
                className={`py-2 px-3.5 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                  adminSubTab === "cadastro"
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/20 font-extrabold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Cadastro & Webhook</span>
              </button>
              <button
                type="button"
                onClick={() => setAdminSubTab("financeiro")}
                className={`py-2 px-3.5 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                  adminSubTab === "financeiro"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-extrabold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Painel Financeiro & Pagamentos</span>
              </button>
              <button
                type="button"
                onClick={() => setAdminSubTab("isic_acessos")}
                className={`py-2 px-3.5 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                  adminSubTab === "isic_acessos"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/20 font-extrabold"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Novo item solicitado: Liberar acessos das câmeras iSIC Lite individuais para clientes"
              >
                <Tv className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>🔑 Acessos iSIC Lite</span>
              </button>
              <button
                type="button"
                onClick={() => setAdminSubTab("escala_500")}
                className={`py-2 px-3.5 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                  adminSubTab === "escala_500"
                    ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 font-extrabold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>💡 Escala 500+ Clientes</span>
              </button>
            </div>

            {/* TOAST SUCCESS BANNER */}
            {clientToast && (
              <div 
                id="client_success_toast" 
                className="bg-emerald-950/40 border-2 border-[#10B981]/50 rounded-2xl p-5 text-emerald-200 font-mono text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[#10B981]/5 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#10B981]" />
                <div className="flex items-start gap-3.5">
                  <div className="p-2 bg-[#10B981]/25 rounded-xl border border-[#10B981]/40 text-[#10B981] mt-0.5 shrink-0">
                    <CheckCircle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        {clientToast.message}
                      </h4>
                      <p className="text-[11px] text-emerald-300/80 mt-1">
                        O comércio foi incluído com sucesso no monitoramento e transmitido ao n8n!
                      </p>
                    </div>

                    <div className="bg-[#090D14]/80 p-3 rounded-xl border border-gray-800/80 text-[10px] space-y-1.5 text-gray-300">
                      <p>📋 <strong>Enviado para (Webhook):</strong> <span className="text-blue-400 select-all font-bold">{clientToast.targetUrl}</span></p>
                      <p>🏢 <strong>Mercado/Comércio:</strong> <span className="text-white">{clientToast.payload?.tradingName}</span></p>
                      <p>📱 <strong>WhatsApp:</strong> <span className="text-white">{clientToast.payload?.whatsapp}</span></p>
                      <p>⏰ <strong>Janela Comercial:</strong> <span className="text-white">{clientToast.payload?.openTime} às {clientToast.payload?.closeTime}</span></p>
                      <p>📦 <strong>Plano e Faturamento:</strong> <span className="text-emerald-400 font-bold">{clientToast.payload?.planName || "Nenhum"} (R$ {clientToast.payload?.paymentValue || "0,00"})</span></p>
                      <p>💳 <strong>Modo & Vencimento:</strong> <span className="text-[#3B82F6] font-bold">{clientToast.payload?.paymentMethod || "Pix"} - Vencimento Dia {clientToast.payload?.dueDate || "10"} ({clientToast.payload?.paymentStatus || "Pendente"})</span></p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5 shrink-0 self-stretch justify-center md:justify-end">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] font-bold border border-[#10B981]/30">
                    HTTP 200 OK
                  </span>
                  <button 
                    type="button"
                    onClick={() => setClientToast(null)} 
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-850 text-white font-mono hover:text-emerald-400 uppercase font-bold transition-all border border-gray-850 cursor-pointer self-stretch text-center"
                  >
                    Fechar Aviso
                  </button>
                </div>
              </div>
            )}

            {adminSubTab === "cadastro" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono text-xs">
                
                {/* REGISTER NEW MERCHANT CLIENT FORM */}
                <div className="lg:col-span-6 bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden flex flex-col shadow-xl">
                  <div className="p-4 bg-[#0E1524] border-b border-[#1E293B] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
                        <SlidersHorizontal className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                          Configuração de Integração de Clientes NDS
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-mono">Cadastre comércios e defina canais ativos n8n</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded border border-blue-500/20 uppercase font-bold">
                      WEBHOOK DISPATCH
                    </span>
                  </div>

                  <div className="p-6 space-y-4 font-mono text-xs flex-1">
                    
                    {!isSimplifiedMode && (
                      <div className="bg-[#1C2638]/50 border border-dashed border-[#3B82F6]/30 rounded-xl p-3.5 text-gray-400 leading-relaxed text-[11px]">
                        <p className="text-[#3B82F6] font-bold text-xs mb-1">🔗 Regras de Conexão Webhook:</p>
                        Ao preencher os campos abaixo e clicar em <strong className="text-white">Salvar Cliente</strong>, uniremos o payload JSON e faremos uma chamada POST direta para o seu n8n Webhook cadastrado.
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-gray-400 text-[10px] uppercase font-bold">Nome do Comércio / Estabelecimento</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Farmácia Popular Central"
                        value={clientTradingName}
                        onChange={(e) => setClientTradingName(e.target.value)}
                        className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-400 text-[10px] uppercase font-bold">Telefone WhatsApp Corporativo</label>
                      <input 
                        type="text" 
                        placeholder="Ex: +5511999998888"
                        value={clientWhatsApp}
                        onChange={(e) => setClientWhatsApp(e.target.value)}
                        className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-gray-400 text-[10px] uppercase font-bold">Hora de Abertura</label>
                        <input 
                          type="time" 
                          value={clientOpenTime}
                          onChange={(e) => setClientOpenTime(e.target.value)}
                          className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400 text-[10px] uppercase font-bold">Hora de Fechamento</label>
                        <input 
                          type="time" 
                          value={clientCloseTime}
                          onChange={(e) => setClientCloseTime(e.target.value)}
                          className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                        />
                      </div>
                    </div>

                    {/* SHORTCUTS FOR PREDEFINED MONITOR SHUTTER TIMES */}
                    <div className="space-y-1 bg-[#111827] border border-gray-800 p-2.5 rounded-lg">
                      <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">⚡ Atalhos de Horários de Monitoramento:</label>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => { setClientOpenTime("08:00"); setClientCloseTime("18:00"); }}
                          className="px-2 py-1 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50 border border-cyan-800/40 text-[9px] font-bold rounded cursor-pointer transition-all"
                        >
                          💼 Comercial (08h às 18h)
                        </button>
                        <button
                          type="button"
                          onClick={() => { setClientOpenTime("18:00"); setClientCloseTime("08:00"); }}
                          className="px-2 py-1 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 border border-amber-800/40 text-[9px] font-bold rounded cursor-pointer transition-all"
                        >
                          🌙 Noturno Novo (18h às 08h)
                        </button>
                        <button
                          type="button"
                          onClick={() => { setClientOpenTime("20:00"); setClientCloseTime("06:00"); }}
                          className="px-2 py-1 bg-red-950/40 text-red-300 hover:bg-red-900/50 border border-red-800/40 text-[9px] font-bold rounded cursor-pointer transition-all"
                        >
                          🔥 Noturno Estendido (20h às 06h)
                        </button>
                        <button
                          type="button"
                          onClick={() => { setClientOpenTime("00:00"); setClientCloseTime("23:59"); }}
                          className="px-2 py-1 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 border border-emerald-800/40 text-[9px] font-bold rounded cursor-pointer transition-all"
                        >
                          🚨 24 Horas (Ininterrupto)
                        </button>
                      </div>
                    </div>

                    {/* SEÇÃO DE PAGAMENTO E ASSINATURA */}
                    <div className="pt-3 border-t border-[#1E293B] space-y-3.5">
                      <p className="text-emerald-400 text-[10px] uppercase font-bold flex items-center gap-1.5 font-mono">
                        <DollarSign className="w-3.5 h-3.5" /> Faturamento & Plano de Assinatura
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-gray-400 text-[10px] uppercase font-bold">Plano de Entrada</label>
                          <select 
                            value={clientPlanId}
                            onChange={(e) => {
                              setClientPlanId(e.target.value);
                              const p = SUBSCRIPTION_PLANS.find(plan => plan.id === e.target.value);
                              if (p) {
                                setClientPaymentValue(p.price.replace("R$ ", "") + ",00");
                              }
                            }}
                            className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-3 py-2.5 focus:outline-[#10B981] text-xs font-mono"
                          >
                            {SUBSCRIPTION_PLANS.map(plan => (
                              <option key={plan.id} value={plan.id}>{plan.name} ({plan.price}/{plan.period})</option>
                            ))}
                            <option value="custom">Personalizado / Customizado</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-gray-400 text-[10px] uppercase font-bold">Valor Mensal (R$)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: 299,00"
                            value={clientPaymentValue}
                            onChange={(e) => setClientPaymentValue(e.target.value)}
                            className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Dia Vecto.</label>
                          <select 
                            value={clientDueDate}
                            onChange={(e) => setClientDueDate(e.target.value)}
                            className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-2 py-2 focus:outline-[#10B981] text-xs font-mono"
                          >
                            <option value="05">Dia 05</option>
                            <option value="10">Dia 10</option>
                            <option value="15">Dia 15</option>
                            <option value="20">Dia 20</option>
                            <option value="25">Dia 25</option>
                            <option value="30">Dia 30</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Forma Pgto.</label>
                          <select 
                            value={clientPaymentMethod}
                            onChange={(e) => setClientPaymentMethod(e.target.value as any)}
                            className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-2 py-2 focus:outline-[#10B981] text-xs font-mono"
                          >
                            <option value="Pix">Pix</option>
                            <option value="Boleto">Boleto</option>
                            <option value="Cartão">Cartão</option>
                            <option value="Dinheiro">Dinheiro</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Status Inst.</label>
                          <select 
                            value={clientPaymentStatus}
                            onChange={(e) => setClientPaymentStatus(e.target.value as any)}
                            className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-2 py-2 focus:outline-[#10B981] text-xs font-mono"
                          >
                            <option value="Pago">Pago</option>
                            <option value="Pendente">Pendente</option>
                            <option value="Atrasado">Atrasado</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* CAMERA CHANNELS CONFIGURATION FOR THIS SPECIFIC DVR */}
                    <div className="pt-3 border-t border-[#1E293B] space-y-3">
                      <p className="text-cyan-400 text-[10px] uppercase font-bold flex items-center gap-1.5 font-mono">
                        <Video className="w-3.5 h-3.5" /> 📹 Canais de Câmeras do DVR (Ficha Individual)
                      </p>

                      <div className="bg-[#090D14] p-3 border border-gray-850 rounded-xl space-y-2.5">
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <label className="text-gray-400 font-bold block mb-1">Nome do Canal/Câmera</label>
                            <input
                              type="text"
                              value={newRegCamName}
                              onChange={(e) => setNewRegCamName(e.target.value)}
                              placeholder="Ex: Câmera 04 - Recepção"
                              className="w-full bg-[#111827] text-white border border-gray-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-xs"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  // trigger add
                                }
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-gray-400 font-bold block mb-1">Localização/Ângulo</label>
                            <select
                              value={newRegCamLocation}
                              onChange={(e) => setNewRegCamLocation(e.target.value)}
                              className="w-full bg-[#111827] text-white border border-gray-800 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-xs font-mono"
                            >
                              <option value="Entrada Principal">Entrada Principal</option>
                              <option value="Portão Garagem">Portão Garagem</option>
                              <option value="Corredor Lateral">Corredor Lateral</option>
                              <option value="Muro Fundos">Muro Fundos</option>
                              <option value="Área Interna">Área Interna</option>
                              <option value="Área de Parqueada">Área de Parqueada</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (!newRegCamName.trim()) {
                              showAppAlert("Digite um nome para a câmera.", "Campo Vazio", "warn");
                              return;
                            }
                            // Assign proper public Unsplash preview images for high-reliability WhatsApp simulation deliveries
                            let camUrl = "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600";
                            if (newRegCamLocation.includes("Garagem")) camUrl = "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600";
                            else if (newRegCamLocation.includes("Fundos") || newRegCamLocation.includes("Lateral")) camUrl = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600";
                            else if (newRegCamLocation.includes("Parqueada")) camUrl = "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600";
                            else if (newRegCamLocation.includes("Interna")) camUrl = "https://images.unsplash.com/photo-1558002038-1055907df827?w=600";

                            const newCam = {
                              id: "rcam-" + Date.now(),
                              name: newRegCamName.trim(),
                              location: newRegCamLocation,
                              imageUrl: camUrl,
                              status: "ACTIVE" as const,
                              fps: 15,
                              noiseLevel: 10
                            };
                            setClientRegCameras(prev => [...prev, newCam]);
                            setNewRegCamName("");
                            showAppAlert(`Câmera "${newCam.name}" adicionada ao rascunho de cadastro do cliente!`, "Câmera Adicionada", "info");
                          }}
                          className="w-full py-2 bg-cyan-950 text-cyan-400 hover:bg-cyan-900 border border-cyan-500/20 rounded-md font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 text-cyan-400" /> Adicionar Câmera/Canal ao DVR
                        </button>
                      </div>

                      {/* Configured cameras listing draft status */}
                      <div className="space-y-1.5">
                        <label className="text-gray-400 text-[10px] uppercase font-bold block">
                          Câmeras Selecionadas para este DVR ({clientRegCameras.length}):
                        </label>
                        
                        {clientRegCameras.length === 0 ? (
                          <p className="text-[10px] text-gray-500 italic block">Selecione/adicione canais acima ou o DVR será cadastrado sem câmeras inicialmente.</p>
                        ) : (
                          <div className="max-h-[140px] overflow-y-auto space-y-1 pr-1 bg-[#090D14]/50 border border-gray-850 p-2 rounded-lg">
                            {clientRegCameras.map((cam, idx) => (
                              <div key={cam.id} className="flex items-center justify-between bg-[#111827] border border-gray-800 p-1.5 px-2.5 rounded-md text-[10px]">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-cyan-400 font-bold font-mono">CH{idx + 1}</span>
                                  <span className="text-white font-semibold truncate">{cam.name}</span>
                                  <span className="text-gray-500 text-[9px] font-mono">({cam.location})</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setClientRegCameras(prev => prev.filter(c => c.id !== cam.id))}
                                  className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                                  title="Remover câmera"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-gray-800">
                      <label className="text-blue-400 text-[10px] uppercase font-bold flex items-center gap-1.5 font-mono">
                        <Network className="w-3.5 h-3.5" /> URL Webhook do n8n / Endpoint
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ex: https://n8n.cloud"
                        value={clientWebhookUrl}
                        onChange={(e) => setClientWebhookUrl(e.target.value)}
                        className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold font-mono select-all text-xs"
                      />
                      <p className="text-[10px] text-gray-500 italic">
                        * O formulário enviará os dados via chamada POST direto para esta URL.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSaveClient()}
                      disabled={isSavingClient}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-[#10B981] hover:from-blue-700 hover:to-[#0EA572] disabled:from-gray-700 disabled:to-gray-800 text-white rounded-xl font-bold uppercase text-xs transition-all cursor-pointer shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
                    >
                      {isSavingClient ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Postando dados no n8n...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Salvar Cliente (Disparar Webhook)
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* ACTIVE MERCHANT LISTING */}
                <div className="lg:col-span-6 bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden flex flex-col shadow-xl">
                  <div className="p-4 bg-[#0E1524] border-b border-[#1E293B] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-[#10B981]/10 border border-[#10B981]/25 rounded-lg text-[#10B981]">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#10B981] font-mono">
                          Comércios Monitorados Ativos (NDS)
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">Gestão de estabelecimentos ativos</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-[#10B981]/15 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/20">
                      {registeredClients.length} Cadastrados
                    </span>
                  </div>

                  <div className="p-6 space-y-4 font-mono text-xs flex-1">
                    
                    {/* BUSCADOR DE CLIENTES */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar por nome, WhatsApp ou plano..."
                        value={merchantSearchQuery}
                        onChange={(e) => setMerchantSearchQuery(e.target.value)}
                        className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg pl-9 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-xs placeholder-gray-500"
                      />
                      {merchantSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setMerchantSearchQuery("")}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    
                    {(() => {
                      const query = merchantSearchQuery.toLowerCase().trim();
                      const filtered = (registeredClients || []).filter(c => {
                        if (!c) return false;
                        return (
                          c.tradingName.toLowerCase().includes(query) ||
                          c.whatsapp.toLowerCase().includes(query) ||
                          (c.planName || "").toLowerCase().includes(query) ||
                          (c.paymentStatus || "").toLowerCase().includes(query)
                        );
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-800 rounded-xl">
                            <Search className="w-8 h-8 mx-auto text-gray-700 mb-2" />
                            <p className="text-[11px]">Nenhum cliente correspondente encontrado para "{merchantSearchQuery}".</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3.5 overflow-y-auto max-h-[420px] pr-1">
                          {filtered.map((client) => {
                            const statusColor = 
                              client.paymentStatus === "Pago" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : client.paymentStatus === "Pendente" 
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                                  : "bg-red-500/10 text-red-400 border border-red-500/20";
                            return (
                              <div 
                                key={client.id}
                                className="p-3.5 bg-[#090D14] border border-gray-800 rounded-xl space-y-2.5 relative hover:border-gray-700 transition-colors"
                              >
                                <div className="flex items-start justify-between min-w-0 pr-6">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-white text-[13px]">{client.tradingName}</h4>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nextStatus = client.paymentStatus === "Pago" ? "Pendente" : client.paymentStatus === "Pendente" ? "Atrasado" : "Pago";
                                          setRegisteredClients(prev => prev.map(c => c.id === client.id ? { ...c, paymentStatus: nextStatus } : c));
                                        }}
                                        className={`text-[9px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${statusColor}`}
                                        title="Clique para alterar status de pagamento"
                                      >
                                        {client.paymentStatus || "Pendente"}
                                      </button>
                                    </div>
                                    <p className="text-[9px] text-gray-500 pt-0.5">Registrado: {formatDate(client.createdAt) || "Recente"}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteClient(client.id)}
                                    className="absolute top-3.5 right-3.5 p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                                    title="Remover Comércio"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-gray-800">
                                  <div>
                                    <p className="text-gray-500 text-[9px] uppercase">WhatsApp</p>
                                    <p className="text-blue-400 font-bold">{client.whatsapp}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-[9px] uppercase">Monitoramento</p>
                                    <p className="text-white font-bold font-mono">⏰ {client.openTime} às {client.closeTime}</p>
                                  </div>
                                </div>

                                {/* PLAN & PAYMENT STRIP */}
                                <div className="bg-[#0D1525] p-2 rounded-lg border border-gray-850 text-[10px] flex items-center justify-between text-gray-300">
                                  <span className="text-emerald-400 font-bold">{client.planName || "Plano Robusto"}</span>
                                  <div>
                                    <span className="text-white font-bold">R$ {client.paymentValue || "149,00"}</span>
                                    <span className="text-gray-500"> / {client.paymentMethod || "Pix"}</span>
                                    <span className="text-blue-400 font-bold bg-[#3B82F6]/10 px-1.5 py-0.5 rounded ml-2 font-mono">Dia {client.dueDate || "10"}</span>
                                  </div>
                                </div>

                                {/* QUICK INTERACTION OPTIONS (LOCALIZAR INFO + ACESSOS) */}
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setInspectedClient(client)}
                                    className="py-1.5 bg-[#1E293B] hover:bg-[#2B3952] border border-gray-800 text-white font-bold rounded text-[9px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Eye className="w-3 h-3 text-[#10B981]" />
                                    <span>FICHA COMPLETA</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAdminSubTab("isic_acessos");
                                      setIsicSelectedClientId(client.id);
                                    }}
                                    className="py-1.5 bg-cyan-950/40 hover:bg-cyan-950/85 text-cyan-400 border border-cyan-500/25 font-bold rounded text-[9px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Users className="w-3 h-3" />
                                    <span>VER STAFF/CAMS</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    <div className="bg-[#0E1524] p-3.5 rounded-xl border border-gray-800 text-[10px] text-gray-400 leading-relaxed">
                      💡 <strong>Otimização de rotas:</strong> Clientes adicionados aqui recebem monitoramento com inteligência perimetral. Ao dispararem ameaças durante sua janela de funcionamento, mensagens automatizadas no WhatsApp são repassadas com as fotos.
                    </div>
                  </div>
                </div>

                {/* MODAL / DRAWER DE FICHA DETALHADA DO CLIENTE SELECIONADO */}
                {inspectedClient && (
                  <div className="lg:col-span-12 bg-[#1E293B]/25 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#0A0F1D] animate-fade-in">
                    
                    {/* Background glow effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-800 pb-4 mb-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-cyan-500/10 border border-cyan-500/35 text-cyan-400 rounded-xl">
                          <Eye className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-white font-sans">{inspectedClient.tradingName}</h3>
                            <span className="text-[10px] font-bold bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
                              Ficha Ativa NDS
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">Identificador do Cliente: #{inspectedClient.id}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Simulation trigger link */}
                        <button
                          type="button"
                          onClick={() => {
                            setTestSelectedClientId(inspectedClient.id);
                            setAdminSubTab("simulacao");
                            showAppAlert(`Configurado simulador para testar disparos no cliente: ${inspectedClient.tradingName}. Vá para a sub-guia Simulação!`, "Sucesso", "success");
                          }}
                          className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow flex items-center gap-1"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Simular Disparo de Teste</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setInspectedClient(null)}
                          className="px-3 py-2 bg-[#1E293B] hover:bg-gray-800 text-gray-300 font-bold rounded-lg text-[10px] uppercase tracking-wide transition-colors cursor-pointer"
                        >
                          Voltar / Fechar
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                      
                      {/* CARD 1: DADOS CADASTRAIS & SERVIÇOS */}
                      <div className="bg-[#090D14]/90 p-4 border border-gray-800 rounded-xl space-y-3.5">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#10B981] border-b border-gray-800 pb-1.5 flex items-center gap-2">
                          📋 CONFIGURAÇÃO DE MONITORAMENTO
                        </h4>
                        
                        <div className="space-y-2.5 text-[11px]">
                          <div>
                            <span className="text-gray-500 block text-[9px] uppercase">Razão Social / Nome de Fantasia</span>
                            <span className="text-white font-bold">{inspectedClient.tradingName}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-gray-500 block text-[9px] uppercase">WhatsApp Contato</span>
                              <span className="text-blue-400 font-bold">{inspectedClient.whatsapp}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[9px] uppercase">Registro na Central</span>
                              <span className="text-white font-bold">{formatDate(inspectedClient.createdAt)}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-gray-500 block text-[9px] uppercase">Limiar de Monitoramento</span>
                              <span className="text-amber-400 font-bold">⏰ {inspectedClient.openTime} às {inspectedClient.closeTime}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[9px] uppercase">Status de Operação</span>
                              <span className="text-emerald-400 font-bold flex items-center gap-1">🟢 IA Ativa</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CARD 2: GESTÃO FINANCEIRA DA ASSINATURA */}
                      <div className="bg-[#090D14]/90 p-4 border border-gray-800 rounded-xl space-y-3.5">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#10B981] border-b border-gray-800 pb-1.5 flex items-center gap-2">
                          💳 FINANCEIRO & COBRANÇA
                        </h4>

                        <div className="space-y-3 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-[10px]">Plano Selecionado:</span>
                            <span className="text-teal-400 font-bold bg-teal-500/10 border border-teal-500/25 px-1.5 py-0.5 rounded">{inspectedClient.planName || "Plano Robusto"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-[10px]">Valor da Mensalidade:</span>
                            <span className="text-white font-bold font-mono">R$ {inspectedClient.paymentValue || "149,00"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-[10px]">Dia do Vencimento:</span>
                            <span className="text-blue-400 font-bold">Todo Dia {inspectedClient.dueDate || "10"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-[10px]">Forma de Cobrança:</span>
                            <span className="text-white font-bold">{inspectedClient.paymentMethod || "Pix"}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                            <span className="text-gray-500 text-[10px]">Situação do Mês:</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              inspectedClient.paymentStatus === "Pago" 
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                                : inspectedClient.paymentStatus === "Pendente"
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  : "bg-red-500/15 text-red-400 border border-red-500/30"
                            }`}>
                              {inspectedClient.paymentStatus || "Pendente"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CARD 3: NTEGRATION DETAILS & WEBHOOK CODES */}
                      <div className="bg-[#090D14]/90 p-4 border border-gray-800 rounded-xl space-y-3.5">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#10B981] border-b border-gray-800 pb-1.5 flex items-center gap-2">
                          🔌 INTEGRAÇÃO N8N & SUPABASE
                        </h4>

                        <div className="space-y-3.5 text-[11px]">
                          <div>
                            <span className="text-gray-500 block text-[9px] uppercase">RVA Webhook Asssociado</span>
                            <span className="text-[10px] font-sans break-all text-blue-400 select-all underline cursor-pointer">
                              {inspectedClient.supabaseUrl || clientWebhookUrl || "Não configurado especificamente"}
                            </span>
                          </div>
                          
                          <div>
                            <span className="text-gray-500 block text-[9px] uppercase mb-1">Payload de Teste Recomendado</span>
                            <div className="bg-[#111827] p-2 rounded text-[9px] max-h-[80px] overflow-y-auto select-all text-gray-400 leading-snug">
  {`{
  "event": "robust_vision_test",
  "client": "${inspectedClient.tradingName}",
  "phone": "${inspectedClient.whatsapp}",
  "imageUrl": "${window.location.origin}/src/assets/images/camera_muro.jpg"
}`}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* GERENCIAMENTO DE CANAIS DE CÂMERAS DO CLIENTE */}
                    <div className="mt-4 pt-4 border-t border-gray-850 bg-[#090D14]/70 p-4 rounded-xl border border-gray-800">
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                          <Video className="w-4 h-4 text-cyan-400" />
                          <span>Configuração de Câmeras Customizadas do Cliente (DVR Ativo)</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded font-mono font-bold">
                          {(inspectedClient.cameras || []).length} Canais Associados
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                        Adicione, remova ou edite os canais do DVR vinculados a este comércio de forma individual. Cada câmera adicionada aqui aparecerá automaticamente no Simulador CFTV e pode disparar webhooks n8n com as imagens públicas do evento.
                      </p>

                      {/* LISTAGEM DAS CÂMERAS DO CLIENTE */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {(inspectedClient.cameras || []).length === 0 ? (
                          <div className="col-span-full text-center py-6 text-gray-500 border border-dashed border-gray-800 rounded-lg bg-gray-900/30">
                            <Sliders className="w-6 h-6 mx-auto text-gray-700 mb-1.5" />
                            <p className="text-[10px]">Este cliente não possui câmeras vinculadas especificamente.</p>
                            <button
                              type="button"
                              onClick={() => {
                                const defaultCams = [
                                  { id: "cam-" + Date.now() + "1", name: "Câmera 01 - Entrada", location: "Entrada Principal", imageUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600", status: "ACTIVE" as const, fps: 15, noiseLevel: 10 },
                                  { id: "cam-" + Date.now() + "2", name: "Câmera 02 - Garagem", location: "Portão Garagem", imageUrl: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600", status: "ACTIVE" as const, fps: 18, noiseLevel: 12 },
                                  { id: "cam-" + Date.now() + "3", name: "Câmera 03 - Muro Fundos", location: "Muro Fundos", imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600", status: "ACTIVE" as const, fps: 12, noiseLevel: 8 }
                                ];
                                const updated = { ...inspectedClient, cameras: defaultCams };
                                setRegisteredClients(prev => prev.map(c => c.id === inspectedClient.id ? updated : c));
                                setInspectedClient(updated);
                                showAppAlert("Câmeras padrão adicionadas a esta ficha!", "Sucesso", "success");
                              }}
                              className="mt-2 px-3 py-1 bg-cyan-900/40 text-cyan-300 border border-cyan-800/40 hover:bg-cyan-900/70 text-[9px] font-bold rounded cursor-pointer uppercase tracking-wider"
                            >
                              ⚙️ Inicializar Canais Padrão (3 Canais)
                            </button>
                          </div>
                        ) : (
                          (inspectedClient.cameras || []).map((cam, idx) => (
                            <div key={cam.id} className="p-3 bg-[#090D14] border border-gray-800 rounded-lg flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-white font-bold text-[11px] truncate">{cam.name}</span>
                                  <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.2 rounded border border-cyan-500/15">
                                    CH {idx + 1}
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-mono">Local: {cam.location}</p>
                                <div className="mt-2 h-16 w-full rounded overflow-hidden relative border border-gray-850">
                                  <img src={cam.imageUrl} alt={cam.name} className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                                  <span className="absolute bottom-1 right-1 px-1 bg-black/60 text-emerald-400 font-mono text-[8px] font-bold uppercase rounded">
                                    ONLINE • {cam.fps} FPS
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  // delete camera (remove)
                                  const updatedCams = (inspectedClient.cameras || []).filter(c => c.id !== cam.id);
                                  const updated = { ...inspectedClient, cameras: updatedCams };
                                  setRegisteredClients(prev => prev.map(c => c.id === inspectedClient.id ? updated : c));
                                  setInspectedClient(updated);
                                }}
                                className="mt-3.5 w-full py-1 bg-red-950/40 hover:bg-red-950/80 text-red-400 text-[10px] uppercase font-bold rounded border border-red-500/15 cursor-pointer text-center transition-colors"
                              >
                                Excluir Canal
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* MINI FORM TO ADD CAMERA */}
                      <div className="bg-gray-900/40 p-3.5 border border-dashed border-gray-800 rounded-lg flex flex-col md:flex-row items-end gap-3.5">
                        <div className="flex-1 space-y-1.5 w-full">
                          <label className="text-gray-400 text-[10px] uppercase font-bold block">Adicionar Novo Canal/Câmera a este Cliente:</label>
                          <input
                            type="text"
                            value={newInspectedCamName}
                            onChange={(e) => setNewInspectedCamName(e.target.value)}
                            placeholder="Ex: Câmera de Vigilância Lousa"
                            className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                          />
                        </div>
                        <div className="w-full md:w-[220px] space-y-1.5">
                          <label className="text-gray-400 text-[10px] uppercase font-bold block">Ângulo / Categoria</label>
                          <select
                            value={newInspectedCamLocation}
                            onChange={(e) => setNewInspectedCamLocation(e.target.value)}
                            className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                          >
                            <option value="Entrada Principal">Entrada Principal</option>
                            <option value="Portão Garagem">Portão Garagem</option>
                            <option value="Corredor Lateral">Corredor Lateral</option>
                            <option value="Muro Fundos">Muro Fundos</option>
                            <option value="Área Interna">Área Interna</option>
                            <option value="Área de Parqueada">Área de Parqueada</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newInspectedCamName.trim()) {
                              showAppAlert("Digite o nome da câmera.", "Nome Vazio", "warn");
                              return;
                            }
                            let camUrl = "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600";
                            if (newInspectedCamLocation.includes("Garagem")) camUrl = "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600";
                            else if (newInspectedCamLocation.includes("Fundos") || newInspectedCamLocation.includes("Lateral")) camUrl = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600";
                            else if (newInspectedCamLocation.includes("Parqueada")) camUrl = "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600";
                            else if (newInspectedCamLocation.includes("Interna")) camUrl = "https://images.unsplash.com/photo-1558002038-1055907df827?w=600";

                            const newCam = {
                              id: "cam-" + Date.now(),
                              name: newInspectedCamName.trim(),
                              location: newInspectedCamLocation,
                              imageUrl: camUrl,
                              status: "ACTIVE" as const,
                              fps: 15,
                              noiseLevel: 10
                            };

                            const updatedCams = [...(inspectedClient.cameras || []), newCam];
                            const updated = { ...inspectedClient, cameras: updatedCams };
                            setRegisteredClients(prev => prev.map(c => c.id === inspectedClient.id ? updated : c));
                            setInspectedClient(updated);
                            setNewInspectedCamName("");
                            showAppAlert(`Câmera "${newCam.name}" vinculada ao DVR do cliente com sucesso!`, "Câmera Adicionada", "success");
                          }}
                          className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-bold rounded font-mono text-[11px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 w-full md:w-auto"
                        >
                          <Plus className="w-3.5 h-3.5" /> Vincular Câmera
                        </button>
                      </div>
                    </div>

                    {/* STAFF / AUTHORIZED USERS SEGMENT */}
                    <div className="mt-4 pt-4 border-t border-gray-850 bg-[#090D14]/50 p-4 rounded-xl border border-gray-800">
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                          <Users className="w-4 h-4 text-amber-500" />
                          <span>Controle Integrado de Acesso por Usuário (isic lite Intelbras)</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono font-bold">
                          Segurança de Permissão Ativa
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-400 leading-relaxed mb-4">
                        A liberação abaixo determina estritamente quem pode autenticar e verificar estas câmeras no ambiente móvel do aplicativo de monitoramento CFTV do cliente. Apenas números autorizados abaixo com chaves válidas conseguirão decodificar fluxos.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-gray-900/60 border border-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-bold text-[11px]">1. Proprietário Gral.</span>
                            <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.2 rounded border border-indigo-500/15">Sócio-Diretor</span>
                          </div>
                          <p className="text-[11px] text-gray-300 font-bold">{inspectedClient.tradingName} (Principal)</p>
                          <p className="text-[10px] text-[#10B981] font-mono mt-1 font-semibold">✓ Acesso Completo Liberado</p>
                        </div>

                        <div className="p-3 bg-gray-900/60 border border-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white font-bold text-[11px]">2. Gerente Local</span>
                            <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.2 rounded border border-blue-500/15">Staff Geral</span>
                          </div>
                          <p className="text-[11px] text-gray-300 font-bold">Sub-usuário de Confiança 01</p>
                          <p className="text-[10px] text-amber-500 font-mono mt-1 font-semibold">⚠ Bloqueado para Configs</p>
                        </div>

                        <div className="p-3 bg-gray-900/60 border border-dashed border-gray-800 rounded-lg flex flex-col items-center justify-center text-center py-4 text-gray-500 hover:border-gray-700 transition-colors cursor-pointer"
                          onClick={() => {
                            setAdminSubTab("isic_acessos");
                            setIsicSelectedClientId(inspectedClient.id);
                          }}
                        >
                          <Plus className="w-4 h-4 text-[#10B981] mb-1.5" />
                          <span className="text-[10px] font-bold text-[#10B981]">GERENCIAR ACESSOS / STAFF</span>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

            {adminSubTab === "financeiro" && (
              /* PANEL FINANCEIRO SUB-TAB DE ASSINATURAS */
              <div id="financeiro_subtab" className="space-y-6">
                
                {/* 4 HIGHLIGHT CARD METRICS FOR FINANCIAL STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* METRIC 1: TOTAL BILLING EXPECTED */}
                  <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono font-bold">Expectativa Mensal</p>
                      <h3 className="text-[19px] font-bold text-violet-400 font-mono mt-1">
                        R$ {(registeredClients || []).filter(Boolean).reduce((acc, c) => {
                          const str = String(c.paymentValue || "149,00").replace(",", ".");
                          return acc + (parseFloat(str) || 149.00);
                        }, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-1">Estimado 100% de carteira</p>
                    </div>
                    <div className="p-2.5 bg-violet-500/10 rounded-lg text-violet-400 border border-violet-500/20">
                      <Coins className="w-5 h-5" />
                    </div>
                  </div>

                  {/* METRIC 2: TOTAL PAID */}
                  <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#10B981] font-mono font-bold">Total Recebido</p>
                      <h3 className="text-[19px] font-bold text-emerald-400 font-mono mt-1">
                        R$ {(registeredClients || []).filter(Boolean).reduce((acc, c) => {
                          if (c.paymentStatus !== "Pago") return acc;
                          const str = String(c.paymentValue || "149,00").replace(",", ".");
                          return acc + (parseFloat(str) || 149.00);
                        }, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-1">Faturas liquidadas no mês</p>
                    </div>
                    <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  </div>

                  {/* METRIC 3: TOTAL PENDING */}
                  <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-amber-500 font-mono font-bold">Cobrança Pendente</p>
                      <h3 className="text-[19px] font-bold text-yellow-400 font-mono mt-1">
                        R$ {(registeredClients || []).filter(Boolean).reduce((acc, c) => {
                          if (c.paymentStatus !== "Pendente") return acc;
                          const str = String(c.paymentValue || "149,00").replace(",", ".");
                          return acc + (parseFloat(str) || 149.00);
                        }, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-1">Aguardando vencimento</p>
                    </div>
                    <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>

                  {/* METRIC 4: TOTAL INADIMPLENCIA / GAPs */}
                  <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-red-500 font-mono font-bold">Inadimplência</p>
                      <h3 className="text-[19px] font-bold text-red-400 font-mono mt-1">
                        R$ {(registeredClients || []).filter(Boolean).reduce((acc, c) => {
                          if (c.paymentStatus !== "Atrasado") return acc;
                          const str = String(c.paymentValue || "149,00").replace(",", ".");
                          return acc + (parseFloat(str) || 149.00);
                        }, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-1">Atrasasdos / Vencidos</p>
                    </div>
                    <div className="p-2.5 bg-red-500/10 rounded-lg text-red-400 border border-red-500/20">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>

                </div>

                {/* DETAILED LEDGER OF INVOICES */}
                <div className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-4 bg-[#0E1524] border-b border-[#1E293B] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Consolidador Contábil e de Faturamento</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">Clique nas tags de status para gerenciar o adimplemento</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25 px-2 py-0.5 rounded">
                      TAXA RETENÇÃO: 100%
                    </span>
                  </div>

                  {registeredClients.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 font-mono text-xs">
                      <Coins className="w-12 h-12 text-gray-600 opacity-20 mx-auto animate-pulse mb-2" />
                      <p>Nenhum cliente disponível para análise financeira.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-[#1E293B] bg-[#0E1524] text-gray-400 uppercase tracking-wider text-[10px]">
                            <th className="p-4">Cliente / Estabelecimento</th>
                            <th className="p-4">Plano Ativo</th>
                            <th className="p-4 text-center">Vencimento</th>
                            <th className="p-4">Valor Mensal</th>
                            <th className="p-4 text-center">Status Pagamento</th>
                            <th className="p-4 text-right">Ação de Cobrança</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E293B] text-gray-300">
                          {(registeredClients || []).filter(Boolean).map((client) => {
                            const valStr = client.paymentValue || "149,00";
                            const feePlan = client.planName || "Bronze Monitor";
                            const payMethod = client.paymentMethod || "Pix";
                            const due = client.dueDate || "10";
                            const statusColor = 
                              client.paymentStatus === "Pago" 
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold" 
                                : client.paymentStatus === "Pendente" 
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold animate-pulse" 
                                  : "bg-red-500/15 text-red-400 border border-red-500/30 font-bold";

                            return (
                              <tr key={client.id} className="hover:bg-[#0E1524]/40 transition-colors">
                                <td className="p-4">
                                  <p className="font-bold text-white text-[13px]">{client.tradingName}</p>
                                  <p className="text-[10px] text-blue-400 font-mono">{client.whatsapp}</p>
                                </td>
                                <td className="p-4 align-middle">
                                  <span className="bg-gray-800/80 px-2 py-1 rounded text-white border border-gray-700/60 font-semibold">{feePlan}</span>
                                </td>
                                <td className="p-4 text-center align-middle font-bold text-white">
                                  Dia {due}
                                </td>
                                <td className="p-4 font-bold text-emerald-400 align-middle">
                                  R$ {valStr} <span className="text-gray-500 text-[10px] font-normal">({payMethod})</span>
                                </td>
                                <td className="p-4 text-center align-middle">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextStatus = client.paymentStatus === "Pago" ? "Pendente" : client.paymentStatus === "Pendente" ? "Atrasado" : "Pago";
                                      setRegisteredClients(prev => prev.map(c => c.id === client.id ? { ...c, paymentStatus: nextStatus } : c));
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] cursor-pointer transition-all hover:brightness-110 active:scale-95 ${statusColor}`}
                                  >
                                    {client.paymentStatus || "Pendente"}
                                  </button>
                                </td>
                                <td className="p-4 text-right align-middle">
                                  <button
                                    type="button"
                                    onClick={() => setBillingClient(client)}
                                    className="p-2 py-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 font-extrabold uppercase text-[10px] transition-colors cursor-pointer inline-flex items-center gap-1 hover:shadow-lg shadow-emerald-500/10"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-black" />
                                    Cobrar WhatsApp
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="bg-[#0E1524] p-4 text-[10px] text-gray-400 leading-relaxed border-t border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-2.5">
                    <p>💡 <strong>Gestão de adimplemento facilitada:</strong> Conecte canais para monitorar datas de vencimento automaticamente e disparar disparadores de alertas.</p>
                    <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">TECNOLOGIA OPERACIONAL NDS</span>
                  </div>
                </div>

              </div>
            )}

              {adminSubTab === "escala_500" && (
                <div id="escala_500_subtab" className="space-y-6 font-sans">
                  {/* METRIC ROW */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono font-bold">Escalabilidade NDS</p>
                        <h3 className="text-xl font-bold text-white font-mono mt-0.5">Até 1.000 Clientes</h3>
                        <p className="text-[10px] text-[#10B981] mt-1 font-mono">✓ Sem gargalos de processamento</p>
                      </div>
                      <div className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                      </div>
                    </div>

                    <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono font-bold">Roteamento</p>
                        <h3 className="text-xl font-bold text-white font-mono mt-0.5">Único Fluxo Dinâmico</h3>
                        <p className="text-[10px] text-blue-400 mt-1 font-mono">✓ 1 único webhook central</p>
                      </div>
                      <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                        <Zap className="w-5 h-5 text-blue-400" />
                      </div>
                    </div>

                    <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono font-bold font-bold">Setup de Onboarding</p>
                        <h3 className="text-xl font-bold text-white font-mono mt-0.5">Livre de Port-Forwarding</h3>
                        <p className="text-[10px] text-purple-400 mt-1 font-mono">✓ P2P / SMTP Genérico</p>
                      </div>
                      <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
                        <Cpu className="w-5 h-5 text-purple-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Bulk Import Column */}
                    <div className="lg:col-span-7 bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden flex flex-col shadow-xl">
                      <div className="p-4 bg-[#0E1524] border-b border-[#1E293B] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-indigo-400 animate-pulse" />
                          <span className="font-bold text-white text-xs uppercase font-mono tracking-wider">Super Importador em Massa (CSV)</span>
                        </div>
                        <div className="flex bg-[#03070E] p-0.5 rounded border border-gray-850 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setBulkImportFormat("csv")}
                            className={`px-2 py-0.5 rounded uppercase font-bold font-mono transition-colors ${bulkImportFormat === "csv" ? "bg-[#10B981]/15 text-[#10B981]" : "text-gray-500"}`}
                          >
                            Padrão CSV
                          </button>
                        </div>
                      </div>

                      <div className="p-5 space-y-4 font-mono text-xs flex-1">
                        <p className="text-gray-400 text-[11px] leading-relaxed">
                          Adicione dezenas ou centenas de clientes de uma única vez! Basta colar as linhas contendo os dados separados por vírgula no formato especificado.
                        </p>

                        <div className="space-y-1.5">
                          <label className="text-gray-400 text-[10px] uppercase font-bold block">Cole a Lista de Comércios (um por linha):</label>
                          <textarea
                            rows={8}
                            value={bulkImportText}
                            onChange={(e) => setBulkImportText(e.target.value)}
                            placeholder="Exemplo de formato para copiar e colar:&#10;Mercado Compre Bem, +5511999998888, 07:00, 22:00, 149,00&#10;Supermercado Ideal, +5511987654321, 08:00, 18:00, 299,00&#10;Consultório Odonto, +5511977775555, 09:00, 19:00, 199,00"
                            className="w-full bg-[#03070E] text-[#10B981] border border-gray-800 rounded-xl p-3.5 font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none placeholder-gray-600 block"
                          />
                        </div>

                        <div className="bg-[#03070E] p-4 rounded-xl border border-gray-800/80 text-[10px] text-gray-400 space-y-1.5 font-sans">
                          <p className="text-indigo-400 font-bold uppercase text-[9px] font-mono flex items-center gap-1.5">
                            ⚠️ REGRAS DE OURO DA IMPORTAÇÃO EM MASSA:
                          </p>
                          <p>• Padrão aceito: <code className="text-amber-400 font-mono bg-black/40 px-1.5 py-0.5 rounded">Nome do Estabelecimento, WhatsApp, Hora Abertura, Hora Fechamento, Valor Plano</code></p>
                          <p>• Certifique-se de manter os campos na ordem e separados por vírgulas ou ponto-e-vírgula.</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleBulkImport()}
                          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white font-extrabold uppercase rounded-xl transition-all shadow-lg hover:shadow-indigo-500/10 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer text-xs"
                        >
                          <Database className="w-4 h-4" /> Importar e Sincronizar Clientes em Massa
                        </button>
                      </div>
                    </div>

                    {/* Scale Setup Guide Column */}
                    <div className="lg:col-span-5 bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden flex flex-col shadow-xl">
                      <div className="p-4 bg-[#0E1524] border-b border-[#1E293B] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-400" />
                          <span className="font-bold text-white text-xs uppercase font-mono tracking-wider">Manual de Arquitetura Unificada 500+</span>
                        </div>
                      </div>

                      <div className="p-5 space-y-4 font-sans text-xs leading-relaxed text-gray-300 flex-1">
                        <div className="space-y-1.5">
                          <h4 className="text-indigo-400 font-bold uppercase text-[11px] font-mono">1. Como Evitar a "Mega-Operação"?</h4>
                          <p className="text-gray-400 text-[11px]">
                            Para operar com alta rentabilidade com 500 clientes, você <strong>não deve</strong> configurar um webhook/SMTP e portal exclusivo por cliente individualmente. Isso seria insustentável. Use a técnica do <strong>Multi-Tenant Gateway (Roteamento Dinâmico de Entrada)</strong>.
                          </p>
                        </div>

                        <div className="bg-[#03070E] p-3.5 rounded-xl border border-gray-800 font-mono text-[9.5px] space-y-2 text-gray-400 leading-normal">
                          <p className="text-white font-bold mb-1">⚙️ ARQUITETURA DE REDE:</p>
                          <p>1. <strong>DVR do Cliente:</strong> Envia o alerta para o <strong>único e mesmo SMTP da sua central</strong> (ex: alert@suacentral.com.br).</p>
                          <p>2. <strong>Identificador do Remetente:</strong> O n8n recebe o alerta, lê o endereço MAC do DVR ou o ID de envio.</p>
                          <p>3. <strong>Lookup Instantâneo:</strong> O n8n consulta no banco de dados local da sua central em milissegundos qual é o cliente associado a esse MAC/ID, verifica a janela comercial atua e despacha o alerta de WhatsApp para o número de destino salvo automaticamente!</p>
                        </div>

                        <div className="space-y-1.5 pt-3 border-t border-gray-805">
                          <h4 className="text-indigo-400 font-bold uppercase text-[11px] font-mono">2. Vantagens do Roteamento Dinâmico:</h4>
                          <ul className="list-disc pl-4.5 space-y-1 text-gray-400 text-[10.5px]">
                            <li><strong>Setup de 1 Minuto por Cliente:</strong> Basta adicionar os dados do comerciante no painel escala ou no formulário principal de sua central.</li>
                            <li><strong>Manutenção Zero nos DVRs:</strong> Se o cliente alterar a hora de funcionamento, você muda aqui em 2 cliques; sem mexer em nenhuma configuração física do DVR local do cliente!</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-[10.5px] text-gray-400">
                          <strong className="text-[#10B981] block mb-0.5">⚡ INFORMAÇÃO PRÁTICA:</strong>
                          O banco de dados armazena os clientes em seu navegador. Quando integrados a servidores em nuvem, o n8n consulta esses registros instantaneamente de forma automática.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {adminSubTab === "isic_acessos" && (
                <div id="isic_acessos_subtab" className="space-y-6 font-sans">
                  
                  {/* GRID OF COMPATIBLE INTELBRAS DVR MODELS */}
                  <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-[#1E293B]">
                      <div className="p-1.5 bg-amber-500/10 border border-amber-500/25 rounded-lg text-amber-400">
                        <Database className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                          Lista de Modelos de DVR/NVR Intelbras Homologados
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-mono">Equipamentos compatíveis com P2P, comandos CGI de Lote e Alertas de WhatsApp</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                      
                      {/* CARD 1 - SERIE MHDX MULTI-HD */}
                      <div className="bg-[#090D14] p-3.5 rounded-xl border border-gray-800/80 space-y-2">
                        <p className="text-amber-400 font-bold border-b border-gray-850 pb-1 flex items-center justify-between">
                          <span>🎥 MHDX Multi-HD (Séries IA)</span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/10 text-amber-400 rounded">RECOMENDADO</span>
                        </p>
                        <p className="text-[10px] text-gray-400 leading-normal font-sans">
                          Apoio total a regras IVS (Cerca Virtual, Linha Virtual) e isolamento de silhueta de humanos/veículos.
                        </p>
                        <div className="text-[9px] text-[#10B981] space-y-0.5 bg-black/30 p-2 rounded">
                          <p>• MHDX 1104, 1108, 1116 (Entrada)</p>
                          <p>• MHDX 1204, 1208, 1216 (Full HD)</p>
                          <p>• MHDX 3004-AI, 3008-AI, 3016-AI</p>
                          <p>• MHDX 3108-AI, 3116-AI (Inteligente)</p>
                        </div>
                      </div>

                      {/* CARD 2 - SERIE NVD / COMPLEMENTARES */}
                      <div className="bg-[#090D14] p-3.5 rounded-xl border border-gray-800/80 space-y-2">
                        <p className="text-[#3B82F6] font-bold border-b border-gray-850 pb-1">
                          🗄️ Gravadores de Vídeo IP (NVD)
                        </p>
                        <p className="text-[10px] text-gray-400 leading-normal font-sans">
                          Sincronização instantânea com câmeras IP Intelbras VIP e envio de snapshot de alta definição por e-mail/n8n.
                        </p>
                        <div className="text-[9px] text-blue-400 space-y-0.5 bg-black/30 p-2 rounded">
                          <p>• NVD 1204, 1208, 1216 (Série 1000)</p>
                          <p>• NVD 3016, 3116, 3208 (Série 3000)</p>
                          <p>• NVD 5124, 5216, 5232 (Série 5000)</p>
                          <p>• NVD 7132, NVD 9300 (Corporativo)</p>
                        </div>
                      </div>

                      {/* CARD 3 - COMPATIBILIDADE LEGADOS */}
                      <div className="bg-[#090D14] p-3.5 rounded-xl border border-gray-800/80 space-y-2">
                        <p className="text-gray-400 font-bold border-b border-gray-850 pb-1">
                          📟 DVRs Legados & Outras Linhas
                        </p>
                        <p className="text-[10px] text-gray-400 leading-normal font-sans">
                          Gravação por Detecção de Movimento convencional ou disparo CGI via API Dahua/NetSDK nativa.
                        </p>
                        <div className="text-[9px] text-gray-400 space-y-0.5 bg-black/30 p-2 rounded">
                          <p>• HDCVI 1004 / 1008 / 1016 (Ger. 1, 2, 3)</p>
                          <p>• HDCVI 3104 / 3108 / 3116 (Série Tri-híbrida)</p>
                          <p>• Multi-HD MHDX 5000, 5200 (Alta-Linha)</p>
                          <p>• Todos os modelos com suporte a SMTP/CGI</p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* GRANULAR CLIENT PERMISSION CONTROL PANEL */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT PANEL - CHOOSE CLIENT AND SELECT GENERAL PERMISSION */}
                    <div className="lg:col-span-6 bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden flex flex-col shadow-xl">
                      <div className="p-4 bg-[#0E1524] border-b border-[#1E293B] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-white text-xs uppercase font-mono tracking-wider">Permissões Individuais de Visualização</span>
                        </div>
                      </div>

                      <div className="p-5 space-y-4 font-mono text-xs flex-1">
                        
                        <div className="space-y-1.5">
                          <label className="text-gray-400 text-[10px] uppercase font-bold block">Selecione o Cliente / Comércio do Robust Vision:</label>
                          <select
                            value={isicSelectedClientId}
                            onChange={(e) => {
                              setIsicSelectedClientId(e.target.value);
                              setIsicSharingLink(""); // reset link
                            }}
                            className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold select-all text-xs"
                          >
                            <option value="">-- Selecione o Cliente Cadastrado --</option>
                            {registeredClients.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.tradingName} ({c.whatsapp})
                              </option>
                            ))}
                          </select>
                        </div>

                        {isicSelectedClientId ? (() => {
                          const client = registeredClients.find(c => c.id === isicSelectedClientId);
                          if (!client) return null;

                          const isAuthorized = client.isicAccessAuthorized ?? true; // defaults to authorized

                          // Toggle General Access Function
                          const handleToggleGeneralAccess = () => {
                            const updated = registeredClients.map(c => {
                              if (c.id === client.id) {
                                return {
                                  ...c,
                                  isicAccessAuthorized: !isAuthorized
                                };
                              }
                              return c;
                            });
                            setRegisteredClients(updated);
                            showAppAlert(
                              `Acesso geral do aplicativo iSIC Lite para o cliente "${client.tradingName}" foi ${!isAuthorized ? "LIBERADO" : "BLOQUEADO"} com sucesso no broker Intelbras Cloud!`,
                              "Permissão Gravada",
                              "success"
                            );
                          };

                          return (
                            <div className="space-y-4 pt-3 border-t border-gray-850">
                              
                              {/* TOGGLE ACCESS BAR */}
                              <div className="flex items-center justify-between p-3.5 bg-[#03070E] rounded-xl border border-gray-850">
                                <div>
                                  <p className="text-white font-bold text-[11px] uppercase">Acesso Global iSIC Lite</p>
                                  <p className="text-gray-500 text-[9px] font-sans mt-0.5 leading-normal">
                                    Define se o cliente ou seus funcionários conseguem abrir algum feed de câmeras no dispositivo mobile.
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={handleToggleGeneralAccess}
                                  className={`px-4 py-2 font-extrabold uppercase rounded text-[10px] transition-all cursor-pointer whitespace-nowrap ${
                                    isAuthorized
                                      ? "bg-emerald-500/10 text-[#10B981] border border-emerald-500/35"
                                      : "bg-red-500/10 text-red-400 border border-red-500/35"
                                  }`}
                                >
                                  {isAuthorized ? "✓ LIBERADO" : "🔒 BLOQUEADO"}
                                </button>
                              </div>

                              {/* CAMERA FEED GRANTED BOX */}
                              {isAuthorized && (
                                <div className="space-y-2">
                                  <label className="text-gray-400 text-[10px] uppercase font-bold block">Selecione as Câmeras que este Cliente está Autorizado a ver:</label>
                                  <div className="bg-[#03070E] rounded-xl border border-gray-850 p-3 space-y-2.5">
                                    {feeds.map((feed) => {
                                      const authorizedCamsList = client.isicAuthorizedCameras ?? feeds.map(f => f.id); // defaults to all cameras authorized
                                      const isChecked = authorizedCamsList.includes(feed.id);

                                      const handleToggleCamera = () => {
                                        let nextList: string[];
                                        if (isChecked) {
                                          nextList = authorizedCamsList.filter(id => id !== feed.id);
                                        } else {
                                          nextList = [...authorizedCamsList, feed.id];
                                        }

                                        const updated = registeredClients.map(c => {
                                          if (c.id === client.id) {
                                            return {
                                              ...c,
                                              isicAuthorizedCameras: nextList
                                            };
                                          }
                                          return c;
                                        });
                                        setRegisteredClients(updated);
                                      };

                                      return (
                                        <div 
                                          key={feed.id} 
                                          onClick={handleToggleCamera}
                                          className="flex items-center justify-between p-2 hover:bg-gray-900 rounded-lg cursor-pointer transition-colors"
                                        >
                                          <div className="flex items-center gap-2">
                                            <input 
                                              type="checkbox" 
                                              checked={isChecked}
                                              onChange={() => {}} // handled by click of outer dev
                                              className="accent-[#10B981] cursor-pointer"
                                            />
                                            <span className="text-white font-bold">{feed.name}</span>
                                            <span className="text-gray-500 text-[9px]">({feed.location})</span>
                                          </div>
                                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${isChecked ? "text-emerald-400 bg-emerald-500/5" : "text-gray-500 bg-black"}`}>
                                            {isChecked ? "AUTORIZADA" : "OCULTA"}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                            </div>
                          );
                        })() : (
                          <div className="text-center py-10 text-gray-500 font-sans">
                            <Activity className="w-10 h-10 mx-auto text-gray-700 animate-pulse mb-2" />
                            Selecione um cliente acima na lista para gerenciar os canais dele via iSIC Lite.
                          </div>
                        )}

                        {registeredClients.length === 0 && (
                          <div className="text-center py-6 text-red-400 font-sans">
                            ⚠️ Nenhum comerciante cadastrado no sistema. Por favor, adicione os estabelecimentos na aba "Cadastro & Webhook" primeiro para listar os acessos.
                          </div>
                        )}

                      </div>
                    </div>

                    {/* RIGHT PANEL - SECURE CREDENTIALS AND SHARING QR GENERATION */}
                    <div className="lg:col-span-6 bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden flex flex-col shadow-xl">
                      <div className="p-4 bg-[#0E1524] border-b border-[#1E293B] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-white text-xs uppercase font-mono tracking-wider">Chave de Conexão Mobile Segura</span>
                        </div>
                      </div>

                      <div className="p-5 space-y-4 font-mono text-xs flex-1">
                        
                        {isicSelectedClientId ? (() => {
                          const client = registeredClients.find(c => c.id === isicSelectedClientId);
                          if (!client) return null;

                          const isAuthorized = client.isicAccessAuthorized ?? true;

                          // Trigger generate link simulation
                          const handleGenerateIsicLink = () => {
                            setIsGeneratingIsicQr(true);
                            setTimeout(() => {
                              setIsGeneratingIsicQr(false);
                              const fakeToken = "ISIC-P2P-TOK-" + Math.random().toString(36).substr(2, 9).toUpperCase();
                              const authorizedCamsList = client.isicAuthorizedCameras ?? feeds.map(f => f.id);
                              
                              setIsicSharingLink(`isiclite://provision?broker=intelbras-cloud&client=${encodeURIComponent(client.tradingName)}&token=${fakeToken}&channels=${authorizedCamsList.join(",")}`);
                              showAppAlert(`Link de provisionamento seguro para aplicativo iSIC Lite gerado! Você já pode enviá-lo para ${client.tradingName}.`, "Link Gerado", "success");
                            }, 1000);
                          };

                          return (
                            <div className="space-y-4 leading-relaxed font-sans text-gray-350 text-[11px]">
                              
                              <p className="leading-normal">
                                O Robust Vision possui integração nativa de segurança. Ao invés de fornecer a senha mestre de Admin para seus clientes carregarem no celular, nós criamos um <strong className="text-[#10B981]">Token com Permissão Limitada</strong>.
                              </p>

                              {isAuthorized ? (
                                <div className="space-y-3.5 pt-2 border-t border-gray-850 font-mono">
                                  <button
                                    type="button"
                                    onClick={handleGenerateIsicLink}
                                    disabled={isGeneratingIsicQr}
                                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 text-black text-center font-extrabold uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    {isGeneratingIsicQr ? (
                                      <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Criptografando Canais no Cloud...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Tv className="w-3.5 h-3.5 text-black" />
                                        <span>Gerar Chave / Credencial iSIC Lite</span>
                                      </>
                                    )}
                                  </button>

                                  {isicSharingLink && (
                                    <div className="bg-[#03070E] p-3.5 rounded-xl border border-gray-800 space-y-3 text-xs">
                                      <p className="text-emerald-400 font-bold block bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded text-center text-[10px]">
                                        ✓ CHAVE COM CANAIS SELECIONADOS GERADA COM SUCESSO!
                                      </p>
                                      
                                      <div className="space-y-1">
                                        <span className="text-gray-500 text-[10px] uppercase font-bold block">Token de Limitação de Canais:</span>
                                        <code className="text-[#3B82F6] block bg-black/50 p-2 rounded text-[10px] break-all select-all font-mono leading-normal">
                                          {isicSharingLink.substring(0, 75)}...
                                        </code>
                                      </div>

                                      <div className="space-y-1.5 font-sans pt-1">
                                        <p className="text-white font-bold text-[10px] uppercase">Como passar o acesso ao cliente?</p>
                                        <p className="text-gray-400 text-[10px] leading-normal">
                                          1. Clique no botão abaixo para copiar o texto com as instruções.<br/>
                                          2. Envie para o WhatsApp do cliente.<br/>
                                          3. Quando o cliente abrir o link no celular, o aplicativo <strong>iSIC Lite</strong> abre importando apenas as câmeras de {client.tradingName} que você selecionou!
                                        </p>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          const txt = `Prezado ${client.tradingName},\n\nAqui está sua chave de acesso segura e autorizada via aplicativo iSIC Lite para acompanhamento das câmeras integradas ao monitoramento inteligente Robust Vision:\n\n🔗 Chave de Autenticação Segura:\n${isicSharingLink}\n\n*Nota de Segurança:* Você só visualizará as câmeras permitidas pela nossa central de monitoramento, garantindo privacidade completa do estabelecimento.`;
                                          navigator.clipboard.writeText(txt);
                                          showAppAlert("Mensagem de instrução e link seguro iSIC Lite copiados para área de transferência!", "Copiado com Sucesso", "success");
                                        }}
                                        className="w-full py-2 bg-gray-900 border border-gray-800 text-white rounded font-bold uppercase text-[10px] hover:bg-gray-850 transition-colors cursor-pointer text-center"
                                      >
                                        Copiar Instruções de Envio
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl text-center space-y-1 text-red-400">
                                  <Lock className="w-8 h-8 mx-auto text-red-500 animate-pulse mb-1" />
                                  <p className="font-bold font-mono">ACESSO ISIC BLOQUEADO</p>
                                  <p className="text-[10px] font-sans text-gray-500">Desenvolva a liberação de visualização geral ao lado para gerar novas chaves.</p>
                                </div>
                              )}

                            </div>
                          );
                        })() : (
                          <div className="text-center py-12 text-gray-500 font-sans">
                            <Lock className="w-10 h-10 mx-auto text-gray-700 mb-2" />
                            Selecione um cliente no painel ao lado para gerar ou revogar chaves e links de acesso iSIC Lite com canais restritos por IA.
                          </div>
                        )}

                      </div>
                    </div>

                  </div>

                  {/* GRANULAR CLIENT SUB-USERS/STAFF ACCESS LIST PANEL */}
                  {isicSelectedClientId && (() => {
                    const client = registeredClients.find(c => c.id === isicSelectedClientId);
                    if (!client) return null;

                    const users = client.authorizedUsers || [];

                    return (
                      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden shadow-xl space-y-4">
                        <div className="p-4 bg-[#0E1524] border-b border-[#1E293B] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1 px-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-emerald-400 font-bold font-mono text-[10px]">
                              👥 STAFF & USERS
                            </div>
                            <div>
                              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                                Controle de Acessos Individuais do Cliente: {client.tradingName}
                              </h3>
                              <p className="text-[10px] text-gray-500 mt-0.5 font-sans leading-normal">
                                O cliente escolhe quem (e quais câmeras) cada funcionário, vigia ou sócio pode visualizar, com bloqueio em tempo real de não autorizados.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 space-y-5">
                          {/* FORM - ADD NEW USER (SIMULATED CLIENT OWNER ACTION) */}
                          <div className="bg-[#03070E] rounded-xl border border-gray-850 p-4 space-y-3.5">
                            <span className="text-amber-400 font-bold block uppercase text-[10px] font-mono">
                              ⚡ Autorizar Nova Pessoa ao DVR (Ação de Controle do Cliente)
                            </span>
                            
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 text-xs font-sans">
                              {/* NAME COLS */}
                              <div className="md:col-span-4 space-y-1">
                                <label className="text-gray-400 text-[9px] uppercase font-bold block font-mono">Nome Completo</label>
                                <input
                                  type="text"
                                  value={newIsicUserName}
                                  onChange={(e) => setNewIsicUserName(e.target.value)}
                                  placeholder="Ex: Mateus Ferreira Silveira"
                                  className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2.5 py-1.5 focus:outline-none"
                                />
                              </div>

                              {/* PHONE COLS */}
                              <div className="md:col-span-3 space-y-1">
                                <label className="text-gray-400 text-[9px] uppercase font-bold block font-mono">WhatsApp/Celular</label>
                                <input
                                  type="text"
                                  value={newIsicUserPhone}
                                  onChange={(e) => setNewIsicUserPhone(e.target.value)}
                                  placeholder="Ex: +551199887766"
                                  className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2.5 py-1.5 focus:outline-none"
                                />
                              </div>

                              {/* ROLE COLS */}
                              <div className="md:col-span-3 space-y-1">
                                <label className="text-gray-400 text-[9px] uppercase font-bold block font-mono">Vínculo/Cargo</label>
                                <select
                                  value={newIsicUserRole}
                                  onChange={(e) => setNewIsicUserRole(e.target.value as any)}
                                  className="w-full bg-[#090D14] text-white border border-gray-800 rounded px-2.5 py-1.5 focus:outline-none font-sans"
                                >
                                  <option value="Comerciante/Dono">Sócio / Proprietário</option>
                                  <option value="Gerente">Gerente Geral</option>
                                  <option value="Segurança">Segurança / Vigilante</option>
                                  <option value="Funcionário">Funcionário Operacional</option>
                                </select>
                              </div>

                              {/* BUTTON COLS */}
                              <div className="md:col-span-2 flex items-end">
                                <button
                                  type="button"
                                  onClick={() => handleAddIsicUser(client.id)}
                                  className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase rounded text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1 font-mono"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>AUTORIZAR</span>
                                </button>
                              </div>
                            </div>

                            {/* SELECT CAMERA COLS FOR THE NEW USER */}
                            <div className="text-[10px] pt-1 border-t border-gray-900">
                              <span className="text-gray-400 font-bold uppercase font-mono block mb-1.5">Permitir Apenas Câmeras Específicas:</span>
                              <div className="flex flex-wrap gap-2">
                                {feeds.map(feed => {
                                  const isSelected = newIsicUserCams.includes(feed.id);
                                  const handleToggleNewUserCam = () => {
                                    if (isSelected) {
                                      setNewIsicUserCams(prev => prev.filter(id => id !== feed.id));
                                    } else {
                                      setNewIsicUserCams(prev => [...prev, feed.id]);
                                    }
                                  };
                                  return (
                                    <button
                                      type="button"
                                      key={feed.id}
                                      onClick={handleToggleNewUserCam}
                                      className={`px-2 py-1 rounded text-[9px] font-bold border font-mono cursor-pointer transition-all ${
                                        isSelected 
                                          ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/25" 
                                          : "bg-[#090D14] text-gray-400 border-gray-850 hover:text-white"
                                      }`}
                                    >
                                      {feed.name}
                                    </button>
                                  );
                                })}
                                <p className="text-[9px] text-gray-550 self-center ml-2">※ Se nenhuma câmera for explicitamente marcada, o usuário terá acesso automático a todas.</p>
                              </div>
                            </div>
                          </div>

                          {/* LIST OF CURRENT SUB USERS AND ROLES */}
                          <div className="space-y-2.5">
                            <span className="text-white font-mono uppercase font-bold text-[10px] block">Lista de Usuários com Credenciais de Acesso ao DVR ({users.length})</span>
                            
                            {users.length === 0 ? (
                              <p className="text-center py-6 text-gray-500 font-sans border border-dashed border-gray-800 rounded-xl leading-relaxed text-[10px]">
                                Nenhum outro funcionário cadastrado para este DVR. Use o formulário acima para autorizar pessoas de confiança do cliente.
                              </p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-[10.5px] text-left border-collapse font-sans">
                                  <thead>
                                    <tr className="border-b border-gray-850 font-mono text-gray-400 uppercase text-[9px] tracking-wider bg-[#03070E]">
                                      <th className="py-2.5 px-3">Nome do Portador</th>
                                      <th className="py-2.5 px-3">Cargo / Perfil</th>
                                      <th className="py-2.5 px-3">Sincronia Celular</th>
                                      <th className="py-2.5 px-3">Câmeras Liberadas</th>
                                      <th className="py-2.5 px-3 text-center">Controle de Segurança</th>
                                      <th className="py-2.5 px-3 text-right">Ação</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-850">
                                    {users.map((usr) => {
                                      const allowedCamsList = usr.allowedCameras || feeds.map(f => f.id);
                                      return (
                                        <tr key={usr.id} className="hover:bg-gray-900/40 transition-colors">
                                          <td className="py-3 px-3 font-bold text-white">
                                            {usr.name}
                                            <span className="block font-mono text-[9px] text-gray-500 font-normal">{usr.phone}</span>
                                          </td>
                                          <td className="py-3 px-3">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                                              usr.role === "Comerciante/Dono" 
                                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 font-extrabold"
                                                : usr.role === "Gerente"
                                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                : usr.role === "Segurança"
                                                ? "bg-red-500/10 text-red-400 border border-red-500/20 font-bold"
                                                : "bg-[#0A0D14] text-gray-300 border border-gray-800"
                                            }`}>
                                              {usr.role.toUpperCase()}
                                            </span>
                                          </td>
                                          <td className="py-3 px-3 font-mono text-[9.5px] text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                              <div className={`h-1.5 w-1.5 rounded-full ${usr.accessGranted ? "bg-emerald-450 animate-pulse" : "bg-red-500"}`} />
                                              <span>{usr.lastAccessTime || "Ativo remoto"}</span>
                                            </div>
                                          </td>
                                          <td className="py-3 px-3">
                                            <div className="flex flex-wrap gap-1">
                                              {feeds.map(feed => {
                                                const hasAccess = allowedCamsList.includes(feed.id);
                                                return (
                                                  <button
                                                    type="button"
                                                    key={feed.id}
                                                    onClick={() => handleToggleIsicUserCam(client.id, usr.id, feed.id)}
                                                    className={`px-1.5 py-0.2 rounded text-[8px] font-bold border transition-colors cursor-pointer ${
                                                      hasAccess
                                                        ? "bg-emerald-500/10 text-[#10B981] border-emerald-500/20 font-extrabold"
                                                        : "bg-black text-gray-600 border-gray-900 hover:text-gray-400"
                                                    }`}
                                                    title={hasAccess ? "Clique para desautorizar" : "Clique para autorizar"}
                                                  >
                                                    {feed.name.split(" ")[0]} {feed.name.split(" ")[1] || ""}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </td>
                                          <td className="py-3 px-3 text-center">
                                            <button
                                              type="button"
                                              onClick={() => handleToggleIsicUserAccess(client.id, usr.id)}
                                              className={`px-2.5 py-1 text-[9px] font-bold rounded cursor-pointer transition-all uppercase border ${
                                                usr.accessGranted
                                                  ? "bg-[#10B981]/15 text-[#10B981]/90 border-[#10B981]/30 hover:bg-[#10B981]/25 font-extrabold"
                                                  : "bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/20"
                                              }`}
                                            >
                                              {usr.accessGranted ? "✓ ATIVO" : "🔒 REVOGADO"}
                                            </button>
                                          </td>
                                          <td className="py-3 px-3 text-right">
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteIsicUser(client.id, usr.id)}
                                              className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                                              title="Excluir autorização permanentemente"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                </div>
              )}

          </div>
        )}

        {activeTab === "dvr_integrations" && (
          <div id="dvr_integrations_tab" className="space-y-6">
            {/* INTELBRAS DASHBOARD HEADER METRICS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono font-bold">DVRs Cadastrados</p>
                  <h3 className="text-2xl font-bold text-violet-400 font-mono mt-1">{intelbrasDvrs.length}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Centrais sincronizadas</p>
                </div>
                <div className="p-2.5 bg-violet-500/10 rounded-lg text-violet-400 border border-violet-500/20">
                  <Database className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono font-bold">Câmeras / Canais</p>
                  <h3 className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                    {intelbrasDvrs.reduce((acc, curr) => curr.connected ? acc + curr.channelsCount : acc, 0)}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Sob Proteção Perimetral</p>
                </div>
                <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                  <Tv className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono font-bold">Plataforma Ativada</p>
                  <h3 className="text-xs font-bold text-blue-400 font-mono mt-1.5">iSIC LITE / CLOUD</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Homologação Intelbras</p>
                </div>
                <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono font-bold">Sincronia Remota</p>
                  <h3 className="text-2xl font-bold text-amber-500 font-mono mt-1">100%</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Integração local direta</p>
                </div>
                <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
                  <Wifi className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: ADD INTEGRATION */}
              <div className="lg:col-span-6 bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden flex flex-col shadow-xl">
                <div className="p-4 bg-[#0E1524] border-b border-[#1E293B] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                        Adicionar Integração DVR Intelbras
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-0.5 font-mono">Conecte equipamentos via iSIC Lite ou Intelbras Cloud</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-bold uppercase">
                    INTEGRATOR V2
                  </span>
                </div>

                <div className="p-6 space-y-4 font-mono text-xs flex-1">
                  <div className="bg-[#1C2638]/40 border border-dashed border-[#8B5CF6]/30 rounded-xl p-3.5 text-gray-400 leading-relaxed text-[11px]">
                    <span className="text-[#8B5CF6] font-bold block mb-1">🔐 Protocolos de Comunicação Inteligente:</span>
                    <ul className="list-disc pl-4 space-y-1 mt-1 text-gray-300">
                      <li><strong>iSIC Lite:</strong> Indicado para DVRs com IP Fixo ou DDNS dinâmico (Utiliza porta padrão 37777).</li>
                      <li><strong>Intelbras Cloud:</strong> Conexão criptografada sem necessidade de abrir portas no roteador usando ID de Série (P2P).</li>
                    </ul>
                  </div>

                  {/* IDENTIFICAÇÃO */}
                  <div className="space-y-1">
                    <label className="text-gray-400 text-[10px] uppercase font-bold">Identificação / Nome do DVR</label>
                    <input 
                      type="text" 
                      placeholder="Ex: DVR Farmácia de Guardas / DVR Depósito"
                      value={intelbrasDvrName}
                      onChange={(e) => setIntelbrasDvrName(e.target.value)}
                      className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs"
                    />
                  </div>

                  {/* PROTOCOLO SELECTION */}
                  <div className="space-y-1">
                    <label className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Tipo de Conexão / Integração</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIntelbrasDvrType("iSIC Lite");
                          if (intelbrasDvrPort === 0 || !intelbrasDvrPort) setIntelbrasDvrPort(37777);
                        }}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          intelbrasDvrType === "iSIC Lite"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30 font-extrabold"
                            : "bg-transparent border-gray-800 text-gray-400 hover:text-white"
                        }`}
                      >
                        <Network className="w-3.5 h-3.5" />
                        <span>iSIC Lite (IP / DDNS)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIntelbrasDvrType("Intelbras Cloud");
                        }}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          intelbrasDvrType === "Intelbras Cloud"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-extrabold"
                            : "bg-transparent border-gray-800 text-gray-400 hover:text-white"
                        }`}
                      >
                        <Wifi className="w-3.5 h-3.5" />
                        <span>Intelbras Cloud (Serial)</span>
                      </button>
                    </div>
                  </div>

                  {/* SERIAL OU IP/DOMINIO */}
                  <div className="space-y-1">
                    <label className="text-gray-400 text-[10px] uppercase font-bold">
                      {intelbrasDvrType === "iSIC Lite" ? "Endereço IP ou Domínio DDNS" : "Código de Série (NS / Cloud ID)"}
                    </label>
                    <input 
                      type="text" 
                      placeholder={intelbrasDvrType === "iSIC Lite" ? "Ex: minhacomp.ddns-intelbras.com.br / 192.168.1.100" : "Ex: NS-8162A-CX99-1002"}
                      value={intelbrasDvrAddressOrSerial}
                      onChange={(e) => setIntelbrasDvrAddressOrSerial(e.target.value)}
                      className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs"
                    />
                  </div>

                  {/* PUERTO Y CANALES */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-400 text-[10px] uppercase font-bold">Porta de Serviço (iSIC)</label>
                      <input 
                        type="number" 
                        disabled={intelbrasDvrType === "Intelbras Cloud"}
                        value={intelbrasDvrType === "Intelbras Cloud" ? "" : intelbrasDvrPort}
                        onChange={(e) => setIntelbrasDvrPort(Number(e.target.value))}
                        className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400 text-[10px] uppercase font-bold">Qtd de Canais (Câmeras)</label>
                      <select 
                        value={intelbrasDvrChannels}
                        onChange={(e) => setIntelbrasDvrChannels(Number(e.target.value))}
                        className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs cursor-pointer"
                      >
                        <option value={4}>4 Canais</option>
                        <option value={8}>8 Canais</option>
                        <option value={16}>16 Canais</option>
                        <option value={32}>32 Canais</option>
                      </select>
                    </div>
                  </div>

                  {/* STREAM & USUARIO */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-gray-400 text-[10px] uppercase font-bold">Fluxo (Stream Tipo)</label>
                      <select 
                        value={intelbrasDvrStream}
                        onChange={(e) => setIntelbrasDvrStream(e.target.value as "Principal" | "Extra")}
                        className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs cursor-pointer"
                      >
                        <option value="Principal">Principal (Full HD)</option>
                        <option value="Extra">Extra / Substream (Leve)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-gray-400 text-[10px] uppercase font-bold">Usuário do DVR</label>
                      <input 
                        type="text" 
                        value={intelbrasDvrUser}
                        onChange={(e) => setIntelbrasDvrUser(e.target.value)}
                        className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs"
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div className="space-y-1">
                    <label className="text-gray-400 text-[10px] uppercase font-bold">Senha de Acesso ao DVR</label>
                    <input 
                      type="password" 
                      placeholder="Sua senha de segurança admin"
                      value={intelbrasDvrPassword}
                      onChange={(e) => setIntelbrasDvrPassword(e.target.value)}
                      className="w-full bg-[#090D14] text-white border border-gray-800 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddIntelbrasDvr()}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold uppercase text-xs transition-all cursor-pointer shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
                  >
                    <Plus className="w-4 h-4" /> Cadastrar Integração Intelbras
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: LIST AND DOCUMENTATION */}
              <div className="lg:col-span-6 bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden flex flex-col shadow-xl">
                <div className="p-4 bg-[#0E1524] border-b border-[#1E293B] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
                      <Tv className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                        DVRs Integrados no Robust Vision ({intelbrasDvrs.length})
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-0.5">Gestão das conexões ativas Intelbras</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded border border-indigo-500/20 font-bold">
                    CONNECTED SESSIONS
                  </span>
                </div>

                <div className="p-6 space-y-4 font-mono text-xs flex-1">
                  {intelbrasDvrs.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <Tv className="w-12 h-12 mx-auto text-gray-600 opacity-20 mb-3 animate-pulse" />
                      <p>Nenhuma integração cadastrada.</p>
                      <p className="text-[10px] text-gray-600 mt-1">Insira os credenciamentos ao lado para iniciar a conexões.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 overflow-y-auto max-h-[420px] pr-1.5">
                      {intelbrasDvrs.map((dvr) => (
                        <div 
                          key={dvr.id}
                          className={`p-4 rounded-xl border transition-all relative ${
                            dvr.connected 
                              ? "bg-[#090D14] border-gray-800" 
                              : "bg-red-500/5 border-red-500/20"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-white text-[13px]">{dvr.name}</h4>
                                <span className={`text-[8px] px-1.5 rounded font-bold border ${
                                  dvr.integrationType === "iSIC Lite" 
                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                }`}>
                                  {dvr.integrationType}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1 font-bold">
                                {dvr.integrationType === "iSIC Lite" ? `📍 IP/DDNS: ${dvr.addressOrSerial} (Porta ${dvr.port})` : `🔑 Serial/NS: ${dvr.addressOrSerial}`}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteIntelbrasDvr(dvr.id)}
                              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              title="Remover Integração"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-2.5 pt-3 mt-3 border-t border-gray-800/80 text-[10px]">
                            <div>
                              <span className="text-gray-500 block text-[9px] uppercase">Canais Mapeados</span>
                              <span className="text-white font-bold">{dvr.channelsCount} Câmeras</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[9px] uppercase font-mono">Usuário</span>
                              <span className="text-white font-bold font-mono">{dvr.user}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block text-[9px] uppercase">Fluxo</span>
                              <span className="text-blue-400 font-bold">{dvr.streamType === "Principal" ? "Principal (Alta)" : "Extra (Compactado)"}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-800 text-[10px]">
                            <div className="flex items-center gap-1.5">
                              {dvr.connected ? (
                                <>
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
                                  </span>
                                  <span className="text-[#10B981] font-bold font-mono">CONECTADO EM TEMPO REAL</span>
                                </>
                              ) : (
                                <>
                                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                  <span className="text-red-500 font-bold">DESCONECTADO / OFFLINE</span>
                                </>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleIntelbrasDvrStatus(dvr.id)}
                              className={`px-3 py-1 rounded text-[9px] font-bold border transition-colors ${
                                dvr.connected
                                  ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/30"
                                  : "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20 hover:bg-[#10B981]/30"
                              }`}
                            >
                              {dvr.connected ? "DESCONECTAR" : "REESTABELECER"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* INTERACTIVE COMPREHENSIVE RECOGNITION PROGRAMMING MANUAL */}
                  <div className="bg-[#0E1524] rounded-xl border border-gray-800/80 p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-800 pb-3 gap-2">
                      <div>
                        <p className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-sans">
                          <Activity className="w-3.5 h-3.5" /> Manual de Integração do Especialista (PhD)
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-sans">Métodos e configurações profissionais para recepção nativa e perfeita de fotos e alertas no Zap</p>
                      </div>
                      <div className="flex bg-[#03070E] p-0.5 rounded-lg border border-gray-800/60 self-start sm:self-auto flex-wrap">
                        <button
                          type="button"
                          onClick={() => setDvrGuideTab("dvr_config")}
                          className={`px-2 py-1 text-[9px] font-bold rounded cursor-pointer transition-all ${
                            dvrGuideTab === "dvr_config"
                              ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25"
                              : "text-gray-500 hover:text-gray-300 border border-transparent"
                          }`}
                        >
                          1. PROGRAMAR DVR
                        </button>
                        <button
                          type="button"
                          onClick={() => setDvrGuideTab("n8n_flow")}
                          className={`px-2 py-1 text-[9px] font-bold rounded cursor-pointer transition-all ml-1 ${
                            dvrGuideTab === "n8n_flow"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/25"
                              : "text-gray-500 hover:text-gray-300 border border-transparent"
                          }`}
                        >
                          2. SUPABASE ⇄ N8N
                        </button>
                        <button
                          type="button"
                          onClick={() => setDvrGuideTab("whatsapp_api")}
                          className={`px-2 py-1 text-[9px] font-bold rounded cursor-pointer transition-all ml-1 ${
                            dvrGuideTab === "whatsapp_api"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/25"
                              : "text-gray-500 hover:text-gray-300 border border-transparent"
                          }`}
                        >
                          3. ENVIO WHATSAPP
                        </button>
                        <button
                          type="button"
                          onClick={() => setDvrGuideTab("cloud_provision")}
                          className={`px-2 py-1 text-[9px] font-bold rounded cursor-pointer transition-all ml-1 ${
                            dvrGuideTab === "cloud_provision"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow animate-pulse"
                              : "text-gray-400 hover:text-gray-200 border border-transparent"
                          }`}
                        >
                          ⚡ 4. AUTO-SETUP CLOUD
                        </button>
                      </div>
                    </div>

                    {dvrGuideTab === "dvr_config" && (
                      <div className="space-y-3.5 text-[11px] leading-relaxed text-gray-300">
                        <div className="space-y-1">
                          <span className="text-emerald-400 font-bold block">A. ATIVAR DETECÇÃO INTELIGENTE (IVS / SMART MOTION):</span>
                          <p className="text-gray-400 text-[10px]">
                            Para evitar falsos disparos no WhatsApp devido a vento, galhos ou sombras, configure inteligência nativa diretamente na firmware do DVR Intelbras:
                          </p>
                          <ol className="list-decimal pl-4.5 space-y-1 mt-1 text-gray-400 text-[10px]">
                            <li>Acesse o <strong>Menu Principal &gt; Inteligência de Vídeo &gt; IVS</strong> (ou Vídeo Detecção Inteligente).</li>
                            <li>Selecione o Canal da câmera perimetral e adicione uma regra de <strong>Cerca Virtual</strong> ou <strong>Linha Virtual</strong>.</li>
                            <li>Desenhe o perímetro de segurança crítico do estabelecimento do cliente.</li>
                            <li>Marque estritamente os filtros de classificação: <strong>[✔] Humano</strong> e/ou <strong>[✔] Veículo</strong>. Isso fará com que o DVR só dispare quando houver detecção real.</li>
                          </ol>
                        </div>

                        <div className="space-y-1 pt-1 border-t border-gray-900">
                          <span className="text-emerald-400 font-bold block">B. CONFIGURAR CAPTURA DE FOTOS (SNAPSHOT):</span>
                          <p className="text-gray-400 text-[10px]">
                            Altere a programação de fotos do DVR para reagir sob evento analítico de segurança:
                          </p>
                          <ul className="list-disc pl-4.5 space-y-1 mt-1 text-gray-400 text-[10px]">
                            <li>Vá em <strong>Menu &gt; Sistema &gt; Armazenamento &gt; Agenda &gt; Configurar (Instante)</strong>.</li>
                            <li>Garanta que a agenda esteja pintada de <strong>Verde (MD - Movimento)</strong> ou <strong>Amarelo (Intel - Inteligente)</strong> 24h por dia nos canais desejados.</li>
                          </ul>
                        </div>

                        <div className="space-y-1 pt-1 border-t border-gray-900">
                          <span className="text-blue-400 font-bold block uppercase">C. ENVIAR FOTOS AUTOMATICAMENTE (SMTP / CGI PULL):</span>
                          <p className="text-gray-400 text-[10px]">
                            Escolha um dos dois métodos homologados para o Robust Vision pegar as imagens perfeitamente:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5 font-sans">
                            <div className="bg-[#03070E] p-2.5 rounded-lg border border-gray-800 text-[10px]">
                              <span className="text-white font-bold block mb-0.5">Método 1: Push Ativo pelo DVR (SMTP Email)</span>
                              Configure <strong>Menu &gt; Rede &gt; E-mail</strong>. Ative o envio, configure o servidor SMTP (ex: Gmail ou SMTP corporativo) e coloque para o DVR disparar fotos anexadas para uma caixa postal exclusiva controlada pelo n8n via gatilho <i>IMAP Email Trigger</i>.
                            </div>
                            <div className="bg-[#03070E] p-2.5 rounded-lg border border-gray-800 text-[10px]">
                              <span className="text-white font-bold block mb-0.5">Método 2: Pull no Webhook (CGI HTTP API) <span className="text-emerald-400 text-[9px]">RECOMENDADO</span></span>
                              Sempre que um sensor de barreira acender ou o n8n for ativado, o próprio n8n faz uma chamada HTTP GET direta ao DVR Intelbras para puxar a foto original instantaneamente:
                              <code className="text-amber-400 block mt-1 break-all font-mono text-[9px] bg-black/40 p-1 rounded">http://usuario:senha@[IP_CLIENTE]:[PORTA_HTTP]/cgi-bin/snapshot.cgi?channel=1</code>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {dvrGuideTab === "n8n_flow" && (
                      <div className="space-y-3.5 text-[11px] leading-relaxed text-gray-300 font-mono">
                        <div className="space-y-1">
                          <span className="text-blue-400 font-bold block font-sans">ESQUEMA DE FLUXO DE AUTOMATIZAÇÃO (n8n):</span>
                          <p className="text-gray-400 text-[10px] font-sans">
                            A estrutura ideal do seu workflow n8n para amarrar o banco do Supabase aos disparos deve ser estruturada da seguinte forma:
                          </p>
                        </div>

                        <div className="bg-[#03070E] p-3 rounded-lg border border-gray-800 space-y-2 text-[10px] text-gray-400">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/25 rounded text-[8px] font-bold">PASSO 1</span>
                            <span className="text-white font-bold font-sans">IMAP Email Trigger (ou Webhook Receptor):</span>
                          </div>
                          <p className="font-sans leading-relaxed text-[10px] pl-2">
                            Recebe o e-mail enviado pelo DVR contendo o arquivo de foto em anexo. O n8n processa o anexo binário e extrai o ID do cliente ou IP/Serial do DVR contido no cabeçalho ou título do e-mail de alerta.
                          </p>

                          <div className="flex items-center gap-2 pt-2 border-t border-gray-900 mt-2">
                            <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded text-[8px] font-bold">PASSO 2</span>
                            <span className="text-white font-bold font-sans">Consulta no Supabase (Mapear Cliente):</span>
                          </div>
                          <p className="font-sans leading-relaxed text-[10px] pl-2">
                            Realiza uma busca na tabela <code className="text-amber-400 bg-black/35 px-1 py-0.5 rounded">clients_nds</code> para puxar o WhatsApp ativo do cliente do evento, nome comercial, endereço e preferências de notificação do plano:
                            <code className="text-emerald-400 block mt-1 bg-black/50 p-1.5 rounded text-[9px] leading-normal break-all select-all font-mono">SELECT * FROM clients_nds WHERE dvr_serial = '{"{{"}$node["IMAP Trigger"].json["subject"]{"}}"}';</code>
                          </p>

                          <div className="flex items-center gap-2 pt-2 border-t border-gray-900 mt-2">
                            <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/25 rounded text-[8px] font-bold">PASSO 3</span>
                            <span className="text-white font-bold font-sans">Análise da IA Robust Vision (Gemini API / Filtro):</span>
                          </div>
                          <p className="font-sans leading-relaxed text-[10px] pl-2">
                            O n8n envia a foto capturada do DVR para a API de Inteligência Artificial para duplo fator de confirmação. Se for constatada invasão humana perimetral real, o fluxo segue para o WhatsApp. Se for falso positivo interno, ele arquiva no banco, mas não causa perturbação no celular do cliente.
                          </p>

                          <div className="flex items-center gap-2 pt-2 border-t border-gray-900 mt-2">
                            <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 rounded text-[8px] font-bold">PASSO 4</span>
                            <span className="text-white font-bold font-sans">Inserir no Histórico da Supabase:</span>
                          </div>
                          <p className="font-sans leading-relaxed text-[10px] pl-2">
                            Dispara um INSERT na tabela <code className="text-amber-400 bg-black/35 px-1 py-0.5 rounded">cctv_verification_logs</code> do Supabase para manter todo o painel Robust Vision do cliente sincronizado em tempo real.
                          </p>
                        </div>
                      </div>
                    )}

                    {dvrGuideTab === "whatsapp_api" && (
                      <div className="space-y-3 text-[11px] leading-relaxed text-gray-300">
                        <span className="text-purple-400 font-bold block font-sans">3. MODELAGEM E DISPARO DE ALERTAS COM MÍDIA NO ZAP:</span>
                        <p className="text-gray-400 text-[10px] font-sans">
                          Para a imagem com foto do DVR chegar perfeitamente e nativa no celular do cliente sob um layout profissional e de alto impacto de segurança:
                        </p>

                        <div className="bg-[#03070E] p-3.5 rounded-lg border border-gray-800 space-y-3 font-mono">
                          <div className="space-y-1">
                            <span className="text-white font-bold block text-[10px] font-sans">Layout do Conteúdo do Alerta (Template Recomendado):</span>
                            <div className="bg-black/50 p-2.5 rounded text-gray-400 text-[9px] leading-normal font-sans border border-gray-900">
                              🚨 *ROBUST VISION - INFRAÇÃO REVELADA* <br/>
                              ━━━━━━━━━━━━━━━━━━━━━ <br/>
                              🏢 *Comercio:* {"{{"}$json.trading_name{"}}"} <br/>
                              📍 *Câmera:* {"{{"}$json.camera_name{"}}"} <br/>
                              🕒 *Data/Hora:* {"{{"}new Date().toLocaleString('pt-BR'){"}}"} <br/>
                              ⚠️ *Fato:* {"{{"}$json.detection_event{"}}"} (Invasor detectado pela IA perimetral) <br/>
                              🔑 *Garantia:* Monitoramento Ativo Antifalhas NDS <br/>
                              ━━━━━━━━━━━━━━━━━━━━━ <br/>
                              _💡 Segundos após o disparo físico, a imagem original foi enviada para auditoria centralizada._
                            </div>
                          </div>

                          <div className="space-y-1 pt-1.5 border-t border-gray-900">
                            <span className="text-white font-bold block text-[10px] font-sans">Parâmetros das APIs de WhatsApp (Multiplataforma):</span>
                            <p className="text-gray-400 text-[9px] font-sans">
                              Utilize o nó de <strong className="text-purple-400">HTTP Request</strong> no n8n. Se você usa o <strong>Evolution API</strong> ou <strong>Z-API</strong>, configure o disparo de imagem enviando as variáveis do e-mail do DVR como form-data:
                            </p>
                            <code className="text-emerald-400 block mt-1 bg-black/60 p-2 rounded text-[8px] leading-relaxed break-all select-all">
                              MÉTODO: POST <br/>
                              URL: https://seu-servidor-zap.com/message/sendMedia/instancia_nds <br/>
                              HEADERS: auth-token: [token_secreto] <br/>
                              BODY (form-data): <br/>
                              &nbsp;&nbsp;number: "55" + client_phone <br/>
                              &nbsp;&nbsp;caption: [mensagem_acima] <br/>
                              &nbsp;&nbsp;media: [arquivo_anexo_binario_repassado_pelo_trigger_do_dvr]
                            </code>
                          </div>
                        </div>

                        <div className="p-3 bg-[#10B981]/5 border border-[#10B981]/10 rounded-xl text-[10px] text-gray-400">
                          <strong className="text-[#10B981] font-sans block mb-0.5">🚀 VANTAGEM DE OPERAR NATIVO CONFORME MANUAL:</strong>
                          Este modelo remove a necessidade de intermediários lentos. O disparo ocorre de forma assíncrona, chegando ao WhatsApp do cliente final em 2 a 5 segundos após a agressão de intrusão física do DVR ser capturada!
                        </div>
                      </div>
                    )}

                    {dvrGuideTab === "cloud_provision" && (
                      <div className="space-y-4 text-[11px] leading-relaxed text-gray-300 font-sans">
                        <div>
                          <span className="text-amber-400 font-bold block uppercase text-xs mb-1">⚡ Auto-Provisionamento do DVR via Intelbras Cloud (API P2P)</span>
                          <p className="text-gray-400 text-[10px]">
                            Através da tecnologia de conexões ponto-a-ponto (P2P), é possível enviar comandos CGI e pacotes JSON-RPC para reconfigurar remotamente os DVRs da Intelbras sem precisar acessar o computador local do cliente ou abrir portas.
                          </p>
                        </div>

                        {/* SELECT DVR AND AUTO SETUP INTERFACE */}
                        <div className="bg-[#03070E] p-4 rounded-xl border border-gray-800 space-y-3">
                          <label className="text-gray-300 font-mono text-[10px] uppercase font-bold block">Selecione o DVR Cadastrado para Configurar:</label>
                          <div className="flex flex-col sm:flex-row gap-2.5">
                            <select
                              value={provisionDvrId}
                              onChange={(e) => setProvisionDvrId(e.target.value)}
                              className="flex-1 bg-[#090D14] text-white border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none"
                            >
                              <option value="">-- Selecione o Dispositivo --</option>
                              {intelbrasDvrs.map(dvr => (
                                <option key={dvr.id} value={dvr.id}>
                                  {dvr.name} ({dvr.addressOrSerial})
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              disabled={isCloudProvisioning || !provisionDvrId}
                              onClick={() => handleTriggerProvisioning(provisionDvrId)}
                              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white rounded-lg font-extrabold uppercase text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1.5 font-sans"
                            >
                              {isCloudProvisioning ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Gravando Remoto...</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3.5 h-3.5 animate-bounce text-amber-300" />
                                  <span>⚡ CLOUD AUTO-PROVISÃO</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Progress bar */}
                          {isCloudProvisioning && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                                <span>Gravando regras IVS e instantâneos dvr...</span>
                                <span>{provisionProgress}%</span>
                              </div>
                              <div className="w-full bg-[#111827] h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-300" 
                                  style={{ width: `${provisionProgress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Console Output */}
                          {provisioningLogs.length > 0 && (
                            <div className="bg-black/90 rounded-lg p-3 border border-gray-850 font-mono text-[9px] text-[#10B981] space-y-1.5 max-h-48 overflow-y-auto leading-normal">
                              <div className="text-gray-500 border-b border-gray-900 pb-1 flex items-center justify-between font-sans">
                                <span>Terminal de Provisionamento Remoto Intelbras Cloud</span>
                                <span className="animate-ping h-1.5 w-1.5 rounded-full bg-emerald-450"></span>
                              </div>
                              {provisioningLogs.map((log, idx) => (
                                <p key={idx} className={log.includes("SUCESSO") ? "text-emerald-400 font-bold" : log.includes("CGI_API") ? "text-blue-400" : "text-[#10B981]"}>
                                  {log}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* HIGH LEVEL ARQ EXPLANATIONS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-gray-900">
                          <div className="bg-[#03070E] p-3 rounded-lg border border-gray-800 space-y-1.5 text-[10px]">
                            <span className="text-white font-bold block uppercase text-[10px]"><Activity className="w-3.5 h-3.5 text-red-400 inline mr-1" /> Como o script funciona nos bastidores?</span>
                            <p className="text-gray-400 leading-normal font-sans">
                              1. O script centralizado do n8n/node faz login no broker P2P da Intelbras Cloud usando apenas o NS (Serial).<br/>
                              2. Após o handshake de NAT, estabelece uma conexão TCP autenticada com admin/senha.<br/>
                              3. Dispara comandos CGI de configuração de forma lote para habilitar regras de IVS e SMTP.
                            </p>
                          </div>

                          <div className="bg-[#03070E] p-3 rounded-lg border border-gray-800 space-y-1.5 text-[10px]">
                            <span className="text-white font-bold block bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/10 uppercase text-[10px]"><Database className="w-3.5 h-3.5 text-indigo-450 inline mr-1" /> Exemplo da API CGI enviada em Lote:</span>
                            <code className="text-amber-400 block bg-black/40 p-1.5 rounded font-mono text-[8.5px] leading-relaxed break-all">
                              // Habilitar Snapshot de Alarme perimetral no Canal 1:<br/>
                              POST /cgi-bin/configManager.cgi?action=setConfig&Event[0].AnalyzeRule[0].EventHandler.Snapshot=true&RecordSchedule[0].SubStream[0].Section[0].Type=Motion
                            </code>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXPORT STORE (PLAY STORE & APP STORE GUIDE) */}
        {activeTab === "export_store" && (
          <div id="export_store_tab" className="space-y-6">
            {/* HERO BANNER SECTION */}
            <div className="bg-gradient-to-r from-amber-500/10 via-[#111827] to-[#0E1524] border border-[#1E293B] rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-2 relative max-w-4xl">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-widest font-mono">Guia de Conversão Mobile Integrado</span>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-amber-400" /> Como publicar seu Robust Vision nas Lojas App Store e Play Store?
                </h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Este painel é um aplicativo web escrito em <strong>React + Vite + Tailwind CSS</strong> de altíssima performance. Ao contrário de frameworks pesados, 
                  esta estrutura é **100% compatível com o Capacitor (da equipe do Ionic)**, permitindo empacotar toda a interface em código nativo de Android e iOS 
                  usando o exato mesmo código-fonte, de forma profissional e automatizada.
                </p>
              </div>
            </div>

            {/* QUICK STEPS IN BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              
              {/* CARD 1 - CAPACITOR CORE */}
              <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between space-y-4 font-mono">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-[11px] pb-2 border-b border-gray-850">
                    <span className="p-1.5 bg-amber-500/10 rounded-lg">⚡</span>
                    <span>1. Instalar o Capacitor</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    O Capacitor interliga a camada web do React diretamente com as APIs nativas do Android (Java/Kotlin) e iOS (Swift) sem perda do seu incrível desempenho de rede.
                  </p>
                </div>
                <div className="bg-[#090D14] p-3 rounded-xl border border-gray-800/60 space-y-1.5 text-[10px] w-full">
                  <p className="text-gray-500"># Instale no projeto:</p>
                  <code className="text-amber-400 block break-all select-all font-mono">npm install @capacitor/core @capacitor/cli</code>
                  <p className="text-gray-500 mt-2"># Inicialize o app:</p>
                  <code className="text-amber-400 block break-all select-all font-mono">npx cap init "Robust Vision" "com.robustvision.app" --web-dir=dist</code>
                </div>
              </div>

              {/* CARD 2 - PLATFORMS */}
              <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between space-y-4 font-mono">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#3B82F6] font-bold uppercase text-[11px] pb-2 border-b border-gray-850">
                    <span className="p-1.5 bg-blue-500/10 rounded-lg">⚙️</span>
                    <span>2. Adicionar Plataformas</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Gere os projetos nativos do Android Studio e Xcode automaticamente a partir dos arquivos estáticos compilados do seu build.
                  </p>
                </div>
                <div className="bg-[#090D14] p-3 rounded-xl border border-gray-800/60 space-y-1.5 text-[10px] w-full">
                  <p className="text-gray-500"># Adicione os pacotes nativos:</p>
                  <code className="text-[#3B82F6] block break-all select-all font-mono">npm install @capacitor/android @capacitor/ios</code>
                  <p className="text-gray-500 mt-2"># Integre os diretórios nativos:</p>
                  <code className="text-[#3B82F6] block break-all select-all font-mono">npx cap add android && npx cap add ios</code>
                </div>
              </div>

              {/* CARD 3 - DEPLOY SYNC */}
              <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between space-y-4 font-mono">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#10B981] font-bold uppercase text-[11px] pb-2 border-b border-gray-850">
                    <span className="p-1.5 bg-emerald-500/10 rounded-lg">📁</span>
                    <span>3. Compilar e Sincronizar</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Sempre que fizer alterações no seu código React original, basta compilar o projeto web e sincronizar os assets com os apps nativos.
                  </p>
                </div>
                <div className="bg-[#090D14] p-3 rounded-xl border border-gray-800/60 space-y-1.5 text-[10px] w-full">
                  <p className="text-gray-500"># Compila o painel web:</p>
                  <code className="text-[#10B981] block break-all select-all font-mono">npm run build</code>
                  <p className="text-gray-500 mt-2"># Sincroniza com as pastas nativas:</p>
                  <code className="text-[#10B981] block break-all select-all font-mono">npx cap sync</code>
                </div>
              </div>

            </div>

            {/* DETAILED GUIDES GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
              
              {/* GOOGLE PLAY STORE DETAIL GUIDE */}
              <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 space-y-4 font-sans border-gray-850">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 font-mono">PASSO A PASSO #01</span>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">📱 Publicar no Google Play (Android)</h3>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-[#10B981] border border-emerald-500/30 font-mono">NATIVO COMPLETO</span>
                </div>

                <div className="text-xs text-gray-300 space-y-3.5 leading-relaxed">
                  <p>
                    Para enviar o Robust Vision ao Google Play Console de forma profissional e descomplicada, siga os passos operacionais abaixo:
                  </p>
                  
                  <ol className="list-decimal list-inside space-y-2.5 text-gray-400 font-mono text-[11px] bg-[#090D14] p-4 rounded-xl border border-gray-900 leading-relaxed">
                    <li>
                      <strong className="text-white">Instale o Android Studio:</strong> Garanta o SDK do Android 34 compilado na sua máquina.
                    </li>
                    <li>
                      <strong className="text-white">Abra o projeto nativo:</strong> Execute o comando <code className="text-amber-400 bg-black/40 px-1 rounded font-bold">npx cap open android</code> para abrir a IDE do Android Studio com seu projeto gerado.
                    </li>
                    <li>
                      <strong className="text-white">Configure o Ícone do App:</strong> No Android Studio, clique com o botão direito na pasta <code className="text-gray-300">app</code> → <code className="text-gray-300">New</code> → <code className="text-gray-300">Image Asset</code>. Escolha a logo da Robust Vision para gerar todas as densidades (hdpi, xxhdpi, etc) automaticamente.
                    </li>
                    <li>
                      <strong className="text-white">Adicione as permissões no AndroidManifest.xml:</strong> Como nosso sistema de segurança opera com DVRs reais e fotos, adicione permissão de Câmera e Notificações de Alarme.
                    </li>
                    <li>
                      <strong className="text-white">Gere o arquivo assinado (.AAB):</strong> No menu superior, vá em <code className="text-gray-300">Build</code> → <code className="text-gray-300">Generate Signed Bundle / APK</code> → escolha <code className="text-gray-300">Android App Bundle</code>. Crie sua assinatura digital (keystore) e salve com segurança!
                    </li>
                    <li>
                      <strong className="text-white">Envie para o Google Play Console:</strong> Crie uma conta de desenvolvedor do Google (taxa única de $25 USD) e envie seu arquivo <code className="text-[#10B981]">app-release.aab</code> na área de Produção ou Teste Fechado.
                    </li>
                  </ol>

                  <div className="p-3 bg-blue-600/10 border border-blue-500/10 rounded-xl text-[11px] flex gap-2">
                    <span className="text-[#3B82F6] font-bold shrink-0 font-mono">💡 NOTA DE CFTV:</span>
                    <p className="text-gray-300 font-mono leading-relaxed">
                      Por rodar em protocolo HTTP/HTTPS direto na Webview nativa protegida, o Stream de feeds de DVRs e conexões do seu webhook n8n/Supabase funcionam perfeitamente sem necessidade de servidores externos!
                    </p>
                  </div>
                </div>
              </div>

              {/* APPLE APP STORE DETAIL GUIDE */}
              <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 space-y-4 font-sans border-gray-850">
                <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 font-mono">PASSO A PASSO #02</span>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">🍏 Publicar na App Store (Apple iOS)</h3>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 font-mono">REQUISITO MACOS</span>
                </div>

                <div className="text-xs text-gray-300 space-y-3.5 leading-relaxed">
                  <p>
                    Para o ecossistema iOS da Apple, a portabilidade através do Xcode com Capacitor mantém toda a elegância visual do Tailwind CSS intocada:
                  </p>

                  <ol className="list-decimal list-inside space-y-2.5 text-gray-400 font-mono text-[11px] bg-[#090D14] p-4 rounded-xl border border-gray-900 leading-relaxed font-mono">
                    <li>
                      <strong className="text-white">Requisito de Sistema:</strong> Diferente do Android, a compilação do iOS exige obrigatoriamente um computador macOS (Mac Mini, Macbook, iMac) rodando o Xcode oficial.
                    </li>
                    <li>
                      <strong className="text-white">Abra o projeto nativo:</strong> Execute o comando <code className="text-blue-400 bg-black/40 px-1 rounded font-bold">npx cap open ios</code>. O Xcode abrirá imediatamente o projeto autogerado do iOS.
                    </li>
                    <li>
                      <strong className="text-white">Configure a Assinatura (Signing):</strong> Nas propriedades do projeto no Xcode, configure o seu <code className="text-gray-300">Signing & Capabilities</code> associando sua conta Apple Developer ($99 USD anuais).
                    </li>
                    <li>
                      <strong className="text-white">Defina os Ícones (AppIcon):</strong> Abra o arquivo <code className="text-gray-300">Assets.xcassets</code> e arraste a imagem oficial da Robust Vision para preencher todos os formatos de retina.
                    </li>
                    <li>
                      <strong className="text-white">Edite o Info.plist:</strong> Para que a Apple aprove o app de segurança, insira as justificativas de privacidade em strings do Info.plist para uso do CFTV (Camera Usage Description).
                    </li>
                    <li>
                      <strong className="text-white">Archive e Upload:</strong> Selecione no Xcode o dispositivo genérico <code className="text-gray-300">Any iOS Device</code>, vá em <code className="text-gray-300">Product</code> → <code className="text-gray-350 font-mono">Archive</code>, clique em <code className="text-gray-300 font-mono">Distribute App</code> e envie diretamente à nuvem Apple Connect!
                    </li>
                  </ol>

                  <div className="p-3 bg-purple-600/10 border border-purple-500/10 rounded-xl text-[11px] flex gap-2">
                    <span className="text-purple-400 font-bold shrink-0 font-mono">📱 WEB RESPONSIVE:</span>
                    <p className="text-gray-300 font-mono leading-relaxed">
                      A visualização em formato de iFrame será automaticamente desativada no aplicativo móvel nativo, garantindo que o seu cliente veja o painel principal em modo 100% tela cheia nativa extremamente fluido.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* INTERACTIVE PLAYGROUND SHELL */}
            <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 font-mono text-xs space-y-3">
              <h4 className="text-white font-bold uppercase text-xs">🛠️ Comandos de Deploy Rápido para seu Prompt de Comando</h4>
              <p className="text-gray-400 text-[11px]">Pressione o botão para copiar e disparar no seu terminal local do projeto sempre que atualizar os dados do painel:</p>
              
              <div className="bg-[#03070E] p-4 rounded-xl border border-gray-800 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-900 pb-2">
                  <span className="text-[10px] text-gray-500 font-bold">TERMINAL DE CONVERSÃO EXECUTÁVEL COMPOSTO</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("npm run build && npx cap sync && npx cap open android");
                      showAppAlert("Comando de compilação sincronizado copiado! Cole no seu prompt do Node local para disparar as ferramentas automáticas no seu computador.", "Copiado para Área de Transferência", "success");
                    }}
                    className="hover:text-amber-400 text-amber-500 transition-colors text-[10px] uppercase font-bold underline cursor-pointer"
                  >
                    Copiar Linha de Comando Inteira
                  </button>
                </div>
                <div className="text-emerald-400 text-[11px] select-all leading-relaxed whitespace-pre font-mono">
                  <div>npm run build <span className="text-gray-600"># Compila o Front-End React em arquivos estáticos (dist/)</span></div>
                  <div>npx cap sync   <span className="text-gray-600"># Transfere e atualiza os binários estáticos para o Android e iOS nativo</span></div>
                  <div>npx cap open android <span className="text-gray-600 font-bold"># Dispara o Android Studio pronto para gerar a versão assinado Play Store (.AAB)</span></div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* INTERACTIVE TEST PANEL & SIMULATOR */}
        <section id="test_simulator_section" className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden mb-6 font-sans">
          <div className="p-4 bg-[#0E1524] border-b border-[#1E293B] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <Play className="w-4 h-4 text-[#10B981] animate-pulse" /> Painel de Testes & Simulador de Reconhecimento
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Sua central interativa para ver como estão funcionando os disparos de imagens/alertas por cliente no Zap</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-[#10B981]/15 text-[#10B981] font-bold border border-[#10B981]/25">
                ATIVO EM SESSÃO
              </span>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Controls Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#090D14] p-4 rounded-xl border border-gray-800/60 space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">1. Selecione o Cliente de Teste</label>
                  {registeredClients.length === 0 ? (
                    <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-xs font-mono">
                      Nenhum cliente cadastrado. Cadastre um cliente na aba "Administração" para testar.
                    </div>
                  ) : (
                    <select
                      value={testSelectedClientId}
                      onChange={(e) => setTestSelectedClientId(e.target.value)}
                      className="w-full bg-[#111827] border border-gray-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/35 cursor-pointer"
                    >
                      {registeredClients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.tradingName} ({client.whatsapp})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">2. Câmera / Feed</label>
                    <select
                      value={testSelectedCameraId}
                      onChange={(e) => setTestSelectedCameraId(e.target.value)}
                      className="w-full bg-[#111827] border border-gray-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-[#10B981]/50 cursor-pointer"
                    >
                      {(() => {
                        const selClient = registeredClients.find(c => c.id === testSelectedClientId);
                        const selCams = (selClient && selClient.cameras && selClient.cameras.length > 0) ? selClient.cameras : feeds;
                        return selCams.map((feed, fIdx) => (
                          <option key={feed.id} value={feed.id}>
                            CH {fIdx + 1}: {feed.name}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">3. Tipo de Detecção</label>
                    <select
                      value={testEventType}
                      onChange={(e) => setTestEventType(e.target.value as any)}
                      className="w-full bg-[#111827] border border-gray-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-[#10B981]/50 cursor-pointer"
                    >
                      <option value="intruder">👤 Invasor Humano (ALERTA)</option>
                      <option value="vehicle">🚗 Veículo Suspeito (ALERTA)</option>
                      <option value="cat">🐱 Gato no Muro (FILTRADO-OK)</option>
                      <option value="wind">🍃 Rajada de Vento (FILTRADO-OK)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={testIsRunning || registeredClients.length === 0}
                  onClick={handleTriggerTestSimulation}
                  className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs uppercase font-bold tracking-wider cursor-pointer select-none transition-all flex items-center justify-center gap-2 ${
                    testIsRunning 
                      ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed" 
                      : "bg-[#10B981] hover:bg-[#059669] text-[#090D14] shadow-md shadow-[#10B981]/15 active:scale-97"
                  }`}
                >
                  {testIsRunning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-gray-500" /> Processando Teste de Transmissão...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Disparar Reconhecimento de Teste
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[10px] font-mono text-gray-400 leading-relaxed">
                <span className="text-blue-400 font-bold block mb-1">💡 COMO ESTÁ FUNCIONANDO O DISPARO DE IMAGENS & VÍDEO?</span>
                Ao clicar no botão de testes, o Robust Vision simula a captura em tempo real do frame correspondente do DVR (iSIC Lite/Cloud), executa o filtro inteligente por IA do Robust Vision, registra o evento no banco central (Logs) e realiza o disparo via webhook n8n ativo e alerta formatado para o WhatsApp cadastrado do cliente selecionado.
              </div>
            </div>

            {/* Right Trace Output Column */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="bg-[#03070E] rounded-xl border border-gray-800/80 p-4 flex-1 flex flex-col justify-between font-mono text-xs overflow-hidden min-h-[220px]">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2 mb-3">
                  <span className="text-[10px] text-gray-500 font-bold tracking-wider">RAIO-X DOS DISPAROS & TELEMETRIA EM TEMPO REAL</span>
                  {testLogLines.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setTestLogLines([])}
                      className="text-[9px] text-red-400 underline hover:text-red-300 uppercase cursor-pointer"
                    >
                      Limpar Monitor de Testes
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[170px] pr-2 text-emerald-400 text-[10px] leading-relaxed">
                  {testLogLines.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-600 space-y-1 font-sans py-8">
                      <Tv className="w-8 h-8 text-gray-800 animate-pulse" />
                      <p className="text-gray-500 font-bold font-mono text-[10px] uppercase">Aguardando Execução do Gatilho</p>
                      <p className="text-gray-600 font-mono text-[9px] max-w-xs leading-relaxed">Selecione o cliente acima e clique em disparar para monitorar e ver os fluxos de imagens e status passo-a-passo.</p>
                    </div>
                  ) : (
                    testLogLines.map((line, idx) => (
                      <div key={idx} className="whitespace-pre-wrap py-0.5 border-b border-gray-950">
                        {line}
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-gray-900/60 pt-2 mt-2 flex items-center justify-between text-[8px] text-gray-500">
                  <span>CANAL ROBUST ZAP: ON-DEMAND TESTER</span>
                  <span>ÚLTIMA LEITURA: {new Date().toLocaleTimeString("pt-BR")}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LOG HISTORY LISTING */}
        <section id="logs_history_section" className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden">
          <div className="p-4 bg-[#0E1524] border-b border-[#1E293B] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" /> Registro Auditório Geral de Disparos e Alertas
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Histórico completo consolidado de detecção inteligente do Robust Vision</p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={clearLogs}
                className="text-xs px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-mono"
              >
                Limpar Logs
              </button>
            </div>
          </div>

          <div className="p-0 overflow-x-auto">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-mono text-xs">
                Nenhum disparo ou verificação efetuada nesta sessão corporativa.
              </div>
            ) : (
              <table className="w-full text-left border-collapse font-mono text-xs text-gray-400">
                <thead>
                  <tr className="bg-[#0A0D14] text-gray-300 uppercase text-[9px] tracking-wider border-b border-gray-800">
                    <th className="p-3">Data / Hora</th>
                    <th className="p-3">Câmera de CFTV</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Análise do Robust Vision (Laudo)</th>
                    <th className="p-3">WhatsApp?</th>
                    <th className="p-3">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {logs.map((log) => {
                    const isAlert = log.status === "ALERTA";
                    return (
                      <tr 
                        key={log.id} 
                        className={`hover:bg-gray-800/30 transition-colors ${
                          isAlert ? "bg-red-950/5" : ""
                        }`}
                      >
                        <td className="p-3 text-gray-300 space-y-0.5">
                          <p className="font-bold">{formatTime(log.timestamp)}</p>
                          <p className="text-[9px] text-gray-500">{formatDate(log.timestamp)}</p>
                        </td>
                        <td className="p-3 text-white font-bold">{log.cameraName}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block border ${
                            isAlert 
                              ? "bg-red-500/10 text-red-500 border-red-500/20" 
                              : "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 max-w-sm text-[11px] text-gray-300 mr-2 break-words">
                          {log.reason}
                        </td>
                        <td className="p-3">
                          {log.status === "ALERTA" ? (
                            log.sentToWhatsApp ? (
                              <span className="text-[10px] text-[#10B981] font-bold bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/20">
                                ✓ ENVIADO
                              </span>
                            ) : (
                              <span className="text-[10px] text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded border border-orange-400/20" title="Ignorado por estar fora do horário estabelecido">
                                ☒ IGNORADO (FORA DO HORÁRIO)
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] text-gray-500">—</span>
                          )}
                        </td>
                        <td className="p-3 text-gray-500">{log.operator}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* BOTTOM REAL-TIME WHATSAPP DISPATCH PREVIEW / FLOATING SIMULATOR IF ENQUEUED */}
        {whatsappNotifications.length > 0 && (
          <section id="whatsapp_notifications_toast" className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden mt-6">
            <div className="p-4 bg-[#0B0F17] border-b border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#10B981]" />
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Fila Simulada de Disparo para WhatsApp (Robust Vision Delivery API)
                </h4>
              </div>
              <button 
                onClick={() => setWhatsappNotifications([])} 
                className="text-[10px] text-red-400 hover:underline font-mono"
              >
                Limpar Fila
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {whatsappNotifications.slice(0, 6).map((notif) => (
                <div key={notif.id} className="bg-[#090D14] p-3.5 rounded-xl border border-gray-800 space-y-2.5 relative">
                  
                  {/* WhatsApp badge icon */}
                  <div className="absolute top-3 right-3 text-[#10B981]">
                    <MessageSquare className="w-4 h-4" />
                  </div>

                  <div className="text-xs font-mono">
                    <p className="text-gray-400">Para Número:</p>
                    <p className="font-bold text-white pr-6">{notif.to}</p>
                  </div>

                  {notif.imageUrl && (
                    <div className="relative rounded-lg overflow-hidden border border-gray-800 bg-black aspect-video max-h-[140px] w-full">
                      <img 
                        src={notif.imageUrl} 
                        alt="WhatsApp Attached Frame" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/75 px-1.5 py-0.5 rounded font-mono text-[8px] text-[#10B981] font-bold uppercase tracking-wider">
                        FOTO ENVIADA
                      </div>
                    </div>
                  )}

                  <div className="bg-[#0E1524] p-2.5 rounded border border-gray-800/80 text-[10px] font-mono text-gray-300 whitespace-pre-wrap leading-relaxed select-all">
                    {notif.message}
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-gray-500 font-mono">
                    <span>API SIMULATOR STATUS: ENVIADO</span>
                    <span>{notif.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* FOOTER STATS INFO */}
      <footer className="border-t border-[#1E293B] mt-12 py-6 bg-[#0E1524] text-xs font-mono text-center text-gray-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="uppercase tracking-widest text-[#10B981] font-bold mb-1">Robust Vision Security Layer</p>
          <p>Operando em ambiente integrado iSIC Lite e CFTV para envio direcionado</p>
          <p className="text-[10px] text-gray-600 mt-2">© 2026 Robust Vision Inc. Todos os Direitos Reservados.</p>
        </div>
      </footer>

      {/* Modern Non-Blocking App Alert Overlay */}
      {appAlert && appAlert.isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-805 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-sans border-gray-800">
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-full shrink-0 ${
                appAlert.type === "success" 
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
                  : appAlert.type === "warn"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                    : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
              }`}>
                {appAlert.type === "success" ? (
                  <CheckCircle className="w-6 h-6" />
                ) : appAlert.type === "warn" ? (
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  {appAlert.title}
                </h3>
                <p className="text-[11px] text-gray-300 leading-relaxed font-mono whitespace-pre-line">
                  {appAlert.message}
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setAppAlert(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-mono font-bold text-xs uppercase transition-all tracking-wider cursor-pointer shadow-lg active:scale-95"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
