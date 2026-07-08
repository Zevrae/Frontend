import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import Database from "better-sqlite3";
import crypto from "crypto";
import { Resend } from "resend";
import mongoose from "mongoose";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));
} else {
  console.warn("No MONGO_URI provided. MongoDB features will not work.");
}

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  price: { type: Number, required: true },
  compare_price: Number,
  sizes: [String],
  images: [String],
  status: { type: String, default: "active" },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");
const storeOwnerEmail = process.env.STORE_OWNER_EMAIL || "admin@zevrae.com";

const db = new Database("orders.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT UNIQUE,
    customer_name TEXT,
    customer_email TEXT,
    customer_address TEXT,
    amount INTEGER,
    products TEXT,
    payment_method TEXT,
    status TEXT,
    order_status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

try {
  db.exec(`ALTER TABLE orders ADD COLUMN order_status TEXT DEFAULT 'pending'`);
} catch (e) {
  // Column exists
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON parser for all non-webhook routes
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/orders", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM orders ORDER BY created_at DESC");
      const orders = stmt.all();
      res.json({ orders });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.put("/api/orders/:orderId/status", (req, res) => {
    try {
      const { orderId } = req.params;
      const { order_status } = req.body;
      const stmt = db.prepare(`UPDATE orders SET order_status = ? WHERE order_id = ?`);
      stmt.run(order_status, orderId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // --- Product Routes (MongoDB) ---
  app.get("/api/products", async (req, res) => {
    try {
      const { category } = req.query;
      const query = category ? { category } : {};
      const products = await Product.find(query).sort({ created_at: -1 });
      
      const formatted = products.map(p => {
        const obj = p.toObject();
        obj.id = obj._id.toString();
        return obj;
      });
      
      res.json(formatted);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const newProduct = new Product(req.body);
      const saved = await newProduct.save();
      const obj = saved.toObject();
      obj.id = obj._id.toString();
      res.json(obj);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) return res.status(404).json({ error: "Not found" });
      const obj = updated.toObject();
      obj.id = obj._id.toString();
      res.json(obj);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await Product.findByIdAndDelete(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  const razorpay = new Razorpay({
    key_id: process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
  });

  app.post("/api/create-razorpay-order", async (req, res) => {
    try {
      const { amount, customer, products } = req.body;
      
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // paíse
        currency: "INR",
        receipt: "rcpt_" + Date.now()
      });

      const stmt = db.prepare(`INSERT INTO orders (order_id, customer_name, customer_email, customer_address, amount, products, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, 'RAZORPAY', 'pending')`);
      stmt.run(order.id, customer.firstName + ' ' + customer.lastName, customer.email, customer.address + ', ' + customer.city + ', ' + customer.postalCode, amount, JSON.stringify(products));

      res.status(200).json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      });
    } catch (error: any) {
      console.error("Error creating razorpay order:", error);
      res.status(500).json({ error: error.message || "Failed to create order" });
    }
  });

  app.post("/api/verify-payment", (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const stmt = db.prepare(`UPDATE orders SET status = 'paid' WHERE order_id = ?`);
      stmt.run(razorpay_order_id);

      // Fetch order details for email
      const getOrderStmt = db.prepare(`SELECT * FROM orders WHERE order_id = ?`);
      const orderData = getOrderStmt.get(razorpay_order_id) as any;

      if (orderData && process.env.RESEND_API_KEY) {
        // Send Customer Confirmation Email
        resend.emails.send({
          from: "ZE VRAE <orders@zevrae.com>",
          to: [orderData.customer_email],
          subject: "Your ZE VRAE Order Confirmation",
          html: `<h1>Thank you for your order!</h1><p>Your order <strong>${orderData.order_id}</strong> is confirmed.</p><p>Amount: ₹${orderData.amount}</p>`
        }).catch(err => console.error("Email error:", err));

        // Send Admin Notification Email
        resend.emails.send({
          from: "ZE VRAE System <system@zevrae.com>",
          to: [storeOwnerEmail],
          subject: "New Order Alert - ZE VRAE",
          html: `<h1>New Order Received!</h1><p>Order ID: ${orderData.order_id}</p><p>Customer: ${orderData.customer_name} (${orderData.customer_email})</p><p>Amount: ₹${orderData.amount}</p>`
        }).catch(err => console.error("Admin Email error:", err));
      }

      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Invalid signature" });
    }
  });

  app.post("/api/create-cod-order", (req, res) => {
    try {
      const { amount, customer, products } = req.body;
      const orderId = "COD_" + Date.now();
      const stmt = db.prepare(`INSERT INTO orders (order_id, customer_name, customer_email, customer_address, amount, products, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, 'COD', 'pending')`);
      stmt.run(orderId, customer.firstName + ' ' + customer.lastName, customer.email, customer.address + ', ' + customer.city + ', ' + customer.postalCode, amount, JSON.stringify(products));

      if (process.env.RESEND_API_KEY) {
        // Send Customer Confirmation Email
        resend.emails.send({
          from: "ZE VRAE <orders@zevrae.com>",
          to: [customer.email],
          subject: "Your ZE VRAE Order Confirmation (COD)",
          html: `<h1>Thank you for your order!</h1><p>Your COD order <strong>${orderId}</strong> is confirmed.</p><p>Amount to pay on delivery: ₹${amount}</p>`
        }).catch(err => console.error("Email error:", err));

        // Send Admin Notification Email
        resend.emails.send({
          from: "ZE VRAE System <system@zevrae.com>",
          to: [storeOwnerEmail],
          subject: "New COD Order Alert - ZE VRAE",
          html: `<h1>New COD Order Received!</h1><p>Order ID: ${orderId}</p><p>Customer: ${customer.firstName} ${customer.lastName} (${customer.email})</p><p>Amount: ₹${amount}</p>`
        }).catch(err => console.error("Admin Email error:", err));
      }

      res.json({ success: true, orderId });
    } catch(err) {
      res.status(500).json({ error: "Failed to place COD order." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
