// index.js
import express from "express";
import supabase from "./supabaseClient.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hotel Management API is running 🚀");
});

// Example: fetch all dishes
app.get("/dishes", async (req, res) => {
  const { data, error } = await supabase.from("dishes").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Example: add a new dish
app.post("/dishes", async (req, res) => {
  const { name, description, price } = req.body;
  const { data, error } = await supabase
    .from("dishes")
    .insert([{ name, description, price }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// Example: create an order
app.post("/orders", async (req, res) => {
  const { customer_id, table_id, cashier_id, items } = req.body;

  // 1. Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([{ customer_id, table_id, cashier_id }])
    .select()
    .single();

  if (orderError) return res.status(400).json({ error: orderError.message });

  // 2. Insert order items
  const orderItems = items.map((item) => ({
    order_id: order.order_id,
    dish_id: item.dish_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) return res.status(400).json({ error: itemsError.message });

  res.status(201).json({ order, items: orderItems });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
