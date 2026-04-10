import QRCode from "qrcode";
import type { QrOptions } from "./types";
import { SIZE_MAP, LOGO_RATIO } from "./types";

function getQrCodeOptions(options: QrOptions): QRCode.QRCodeRenderersOptions {
  return {
    width: SIZE_MAP[options.size],
    errorCorrectionLevel: options.errorCorrectionLevel,
    color: {
      dark: options.foregroundColor,
      light: options.backgroundColor,
    },
    margin: 2,
  };
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function drawLogoOnCanvas(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  canvasSize: number,
  bgColor: string
) {
  const logoSize = Math.floor(canvasSize * LOGO_RATIO);
  const x = Math.floor((canvasSize - logoSize) / 2);
  const y = Math.floor((canvasSize - logoSize) / 2);
  const padding = 4;

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2, 4);
  ctx.fill();

  ctx.drawImage(logo, x, y, logoSize, logoSize);
}

export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  content: string,
  options: QrOptions
): Promise<void> {
  if (!content) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const size = SIZE_MAP[options.size];
      canvas.width = size;
      canvas.height = size;
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, size, size);
    }
    return;
  }

  await QRCode.toCanvas(canvas, content, getQrCodeOptions(options));

  if (options.logoDataUrl) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const logo = await loadImage(options.logoDataUrl);
      drawLogoOnCanvas(ctx, logo, canvas.width, options.backgroundColor);
    }
  }
}

export async function exportQrAsPng(
  content: string,
  options: QrOptions
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  await renderQrToCanvas(canvas, content, options);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create PNG blob"));
    }, "image/png");
  });
}

export async function exportQrAsSvg(
  content: string,
  options: QrOptions
): Promise<string> {
  const svgString = await QRCode.toString(content, {
    ...getQrCodeOptions(options),
    type: "svg",
  });

  if (!options.logoDataUrl) {
    return svgString;
  }

  const sizeMatch = svgString.match(/viewBox="0 0 (\d+) (\d+)"/);
  if (!sizeMatch) return svgString;

  const viewBoxSize = parseInt(sizeMatch[1], 10);
  const logoSize = Math.floor(viewBoxSize * LOGO_RATIO);
  const x = Math.floor((viewBoxSize - logoSize) / 2);
  const y = Math.floor((viewBoxSize - logoSize) / 2);
  const padding = 1;

  const logoSvg = [
    `<rect x="${x - padding}" y="${y - padding}" width="${logoSize + padding * 2}" height="${logoSize + padding * 2}" rx="1" fill="${options.backgroundColor}"/>`,
    `<image href="${options.logoDataUrl}" x="${x}" y="${y}" width="${logoSize}" height="${logoSize}"/>`,
  ].join("");

  return svgString.replace("</svg>", `${logoSvg}</svg>`);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadSvgString(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  downloadBlob(blob, filename);
}
