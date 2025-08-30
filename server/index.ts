import express from "express";
import session from "express-session";
import { createServer } from "http";
import { config } from "dotenv";
import path from 'path'; // Import path module
import { setupVite } from "./vite";
import { registerRoutes } from "./routes";
import { adminRouter } from "./admin-routes";
import { verifySupabaseConnection } from "./verify-supabase";

// Load environment variables from .env file
config({ path: '.env' });

const app = express();

// Session middleware with proper secret from environment
app.use(session({
  secret: process.env.SESSION_SECRET || 'edgemarket-development-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: false, // Set to true in production with HTTPS
    httpOnly: true, // Prevent XSS attacks
  }
}));

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the client's dist and public directories
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(express.static(path.join(__dirname, '../client/public')));

// API routes
registerRoutes(app);
app.use("/api/admin", adminRouter);

// Serve the homepage for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

// Serve React app for dashboard and other app routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.get('/trading', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.get('/deposits', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.get('/withdrawals', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.get('/history', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.get('/copy-trading', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.get('/referrals', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.get('/market-news', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.get('/signals', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});


// Create HTTP server
const server = createServer(app);

// Setup Vite dev server for frontend
setupVite(app, server);

// ALWAYS serve the app on the port specified in the environment variable PORT
// Other ports are firewalled. Default to 5000 if not specified.
// this serves both the API and the client.
const port = parseInt(process.env.PORT || '5000', 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 EdgeMarket server running on port ${port}`);
  console.log(`🌐 Server accessible at: http://0.0.0.0:${port}`);
  console.log(`📊 Admin credentials: z@test.com / 421`);
  console.log(`🔐 Using Supabase URL: ${process.env.VITE_SUPABASE_URL || 'Not configured'}`);
  console.log(`🔗 Database URL: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);

  // Verify Supabase connection
  verifySupabaseConnection().catch(console.error);
});