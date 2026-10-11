// Browser-only helpers: shrink photos before upload so they fit request limits.

function loadImage(file: Blob): Promise<{ img: HTMLImageElement; done: () => void }> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ img, done: () => URL.revokeObjectURL(url) });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read that image"));
    };
    img.src = url;
  });
}

function draw(img: HTMLImageElement, maxSide: number, blur = 0) {
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (blur) ctx.filter = `blur(${blur}px)`;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

const b64 = (canvas: HTMLCanvasElement, quality: number) => canvas.toDataURL("image/jpeg", quality).split(",")[1];

export async function shrinkImage(file: Blob, maxSide = 1400, quality = 0.82) {
  const { img, done } = await loadImage(file);
  try {
    return { mime: "image/jpeg", b64: b64(draw(img, maxSide), quality) };
  } finally {
    done();
  }
}

// A full-size page image plus a small blurred preview that is safe to show publicly.
export async function pageWithPreview(file: Blob) {
  const { img, done } = await loadImage(file);
  try {
    return {
      mime: "image/jpeg",
      b64: b64(draw(img, 2200), 0.85),
      previewB64: b64(draw(img, 320, 3.5), 0.7),
    };
  } finally {
    done();
  }
}

export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
