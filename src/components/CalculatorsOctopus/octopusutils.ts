/**
 * Shared utilities for Proposal Generation
 */

export const loadImage = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 1600;
      const scale = Math.min(1, MAX_WIDTH / img.width);

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

        // return ONLY base64
        resolve(dataUrl.split(",")[1]);
      } else {
        resolve("");
      }
    };

    img.onerror = () => resolve("");
  });
};

export const createPlaceholderImage = (r: number, g: number, b: number): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Model Image', canvas.width / 2, canvas.height / 2);
    return canvas.toDataURL('image/jpeg');
  }
  return '';
};

export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
};

export const formatToDDMMYYYY = (dateString: string): string => {
  if (!dateString) return '';
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
};
