import { Resend } from "resend";
import type { Order } from "./types.js";

let client: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new Resend(apiKey);
  return client;
}

/**
 * Fire-and-forget by design — a flaky email provider should never block or
 * fail order fulfillment. Errors are logged, not thrown. If you need
 * guaranteed delivery, queue this instead (e.g. a jobs table + retry worker)
 * rather than calling it inline from the request handler.
 */
export async function sendOrderConfirmation(order: Order): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping order confirmation email");
    return;
  }
  if (!order.email) {
    console.warn(`[email] order ${order.id} has no email on file — skipping`);
    return;
  }

  const from = process.env.EMAIL_FROM ?? "orders@example.com";
  const explorerUrl = order.txHash ? `https://testnet.arcscan.app/tx/${order.txHash}` : null;

  try {
    await resend.emails.send({
      from,
      to: order.email,
      subject: `Order confirmed — ${order.displayAmount} USDC`,
      html: `
        <p>Your order is confirmed.</p>
        <ul>
          <li>Order ID: ${order.id}</li>
          <li>Amount: ${order.displayAmount} USDC</li>
          ${explorerUrl ? `<li>Transaction: <a href="${explorerUrl}">${explorerUrl}</a></li>` : ""}
        </ul>
      `,
    });
  } catch (err) {
    console.error(`[email] failed to send confirmation for order ${order.id}:`, err);
  }
}
