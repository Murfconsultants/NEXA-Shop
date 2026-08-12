import { createStore } from "./store";

/** Run with: npx tsx src/seed.ts */
async function main() {
  const store = createStore();
  const products = [
    { name: "Arc Testnet Hoodie", description: "Soft fleece, embroidered logo.", priceUsdc: "45000000", inventory: 20 },
    { name: "Stablecoin Sticker Pack", description: "Set of 5 vinyl stickers.", priceUsdc: "5000000", inventory: 200 },
    { name: "Deterministic Finality Mug", description: "11oz ceramic mug.", priceUsdc: "15000000", inventory: 50 },
  ];
  for (const p of products) {
    const created = await store.createProduct(p);
    console.log(`created ${created.name} — ${created.id}`);
  }
}

main();
