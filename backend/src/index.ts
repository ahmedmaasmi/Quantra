import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import transactionsRouter from "./routes/transactions";
import alertsRouter from "./routes/alerts";
import forecastRouter from "./routes/forecast";
import chatRouter from "./routes/chat";
import fraudRouter from "./routes/fraud";
import casesRouter from "./routes/cases";
import dashboardRouter from "./routes/dashboard";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (_: express.Request, res: express.Response) => res.json({ 
  message: "Quantra API running 🚀",
  version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      transactions: "/api/transactions",
      alerts: "/api/alerts",
      forecast: "/api/forecast",
      chat: "/api/chat",
      fraud: "/api/fraud",
      cases: "/api/cases",
      dashboard: "/api/dashboard"
    }
}));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api/forecast", forecastRouter);
app.use("/api/chat", chatRouter);
app.use("/api/fraud", fraudRouter);
app.use("/api/cases", casesRouter);
app.use("/api/dashboard", dashboardRouter);
console.log("✅ Dashboard route registered at /api/dashboard");
console.log("Dashboard router type:", typeof dashboardRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: "Something went wrong!",
    message: err.message 
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});
