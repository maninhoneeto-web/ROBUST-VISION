/**
 * Converts a static image URL (or asset import path) into a Base64 Data URL for the server API.
 */
export async function convertUrlToBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Generates a mock CCTV camera feed snapshot dynamically using HTML Canvas.
 * Useful for Cam 04 or when camera feeds are reset.
 */
export function generateMockCCTVPlaceholder(cameraName: string, showHuman: boolean = false): string {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Draw dark grey background
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, 640, 480);

  // Draw radial lens vignette
  const gradient = ctx.createRadialGradient(320, 240, 50, 320, 240, 340);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 640, 480);

  // Draw security scanlines grid
  ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 640; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 480);
    ctx.stroke();
  }
  for (let j = 0; j < 480; j += 40) {
    ctx.beginPath();
    ctx.moveTo(0, j);
    ctx.lineTo(640, j);
    ctx.stroke();
  }

  // Draw camera hud markings
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 2;
  // Corners
  const pad = 20;
  const len = 30;
  // Top Left
  ctx.beginPath();
  ctx.moveTo(pad, pad + len);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + len, pad);
  ctx.stroke();
  // Top Right
  ctx.beginPath();
  ctx.moveTo(640 - pad - len, pad);
  ctx.lineTo(640 - pad, pad);
  ctx.lineTo(640 - pad, pad + len);
  ctx.stroke();
  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(pad, 480 - pad - len);
  ctx.lineTo(pad, 480 - pad);
  ctx.lineTo(pad + len, 480 - pad);
  ctx.stroke();
  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(640 - pad - len, 480 - pad);
  ctx.lineTo(640 - pad, 480 - pad);
  ctx.lineTo(640 - pad, 480 - pad - len);
  ctx.stroke();

  // Draw Center Focus Reticle
  ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
  ctx.beginPath();
  ctx.arc(320, 240, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(320, 210); ctx.lineTo(320, 230);
  ctx.moveTo(320, 250); ctx.lineTo(320, 270);
  ctx.moveTo(290, 240); ctx.lineTo(310, 240);
  ctx.moveTo(330, 240); ctx.lineTo(350, 240);
  ctx.stroke();

  // Draw scanline/signal interference noise
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 640;
    const y = Math.random() * 480;
    const alpha = Math.random() * 0.15;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  // Draw human intruder vector or clean state
  if (showHuman) {
    // Ground
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(100, 380, 440, 100);

    // Fence / Wall
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(150, 380); ctx.lineTo(150, 220);
    ctx.lineTo(490, 220); ctx.lineTo(490, 380);
    ctx.stroke();

    // Intruder Head
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(320, 180, 22, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (glowing indicator or intruder mask)
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(313, 178, 3, 0, Math.PI * 2);
    ctx.arc(327, 178, 3, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.moveTo(280, 320);
    ctx.lineTo(360, 320);
    ctx.lineTo(345, 202);
    ctx.lineTo(295, 202);
    ctx.closePath();
    ctx.fill();

    // Label suspicious object detected by local pre-check
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 14px monospace";
    ctx.fillText("[!] ALVO DETECTADO - PERIMETRO VIOLADO", 120, 120);
    
    // Target outline box
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(270, 150, 100, 180);
    ctx.setLineDash([]);
  } else {
    // Normal clean room or backyard
    ctx.fillStyle = "rgba(16, 185, 129, 0.4)";
    ctx.font = "bold 14px monospace";
    ctx.fillText("SINAL CFTV ESTÁVEL - NENHUMA OCORRÊNCIA", 180, 240);
  }

  // Superimposed technical information text overlays
  ctx.fillStyle = "#10b981";
  ctx.font = "bold 12px monospace";
  ctx.fillText("REC ●", 30, 40);
  ctx.fillText(`NDS SECURITY SYS - TERM_ID: d2c8e0`, 30, 60);
  ctx.fillText(cameraName.toUpperCase(), 30, 440);
  
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR");
  ctx.fillText(dateStr, 400, 40);
  ctx.fillText("1080p @ 24fps - CH: 04", 400, 440);

  return canvas.toDataURL("image/png");
}

/**
 * Format timestamp nicely
 */
export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "";
  }
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}
