import { createHash } from "crypto";

/**
 * Signs a Cloudinary upload so the browser can upload directly to Cloudinary
 * (bypassing our own server for the actual file bytes) without exposing the
 * API secret client-side. Standard Cloudinary signed-upload flow:
 * https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
 */
export function signCloudinaryUpload(params: Record<string, string | number>): {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
} {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!apiSecret || !apiKey || !cloudName) {
    throw new Error("CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET must be set");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = { ...params, timestamp };

  // Cloudinary requires params sorted alphabetically by key, joined as
  // key=value&key=value, with the API secret appended (not URL-encoded).
  const paramString = Object.keys(toSign)
    .sort()
    .map((key) => `${key}=${toSign[key]}`)
    .join("&");

  const signature = createHash("sha1").update(paramString + apiSecret).digest("hex");

  return { signature, timestamp, apiKey, cloudName };
}
