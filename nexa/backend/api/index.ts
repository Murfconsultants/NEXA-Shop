import { createApp } from "../src/app.js";

// Vercel's Node runtime treats any exported (req, res) handler as the
// function — an Express app is directly callable as one. Combined with the
// rewrite in vercel.json (every path -> this function), Express still does
// its own internal routing against the original request path.
export default createApp();
