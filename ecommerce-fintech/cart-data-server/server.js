/**
 * Cart Data Server
 * A simple server to provide customer cart data for analysis
 * Runs on port 3001
 */

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Customer cart data
const customers = [
  {
    id: "cust01",
    name: "Alice",
    cart: [
      {
        id: "prod1",
        name: "Laptop",
        price: 1200,
        quantity: 1,
        category: "electronics",
      },
      {
        id: "prod2",
        name: "Mouse",
        price: 25,
        quantity: 2,
        category: "electronics",
      },
    ],
  },
  {
    id: "cust02",
    name: "Bob",
    cart: [
      {
        id: "prod3",
        name: "T-Shirt",
        price: 15,
        quantity: 3,
        category: "fashion",
      },
      {
        id: "prod4",
        name: "Jeans",
        price: 45,
        quantity: 1,
        category: "fashion",
      },
    ],
  },
  {
    id: "cust03",
    name: "Charlie",
    cart: [
      {
        id: "prod5",
        name: "Coffee Maker",
        price: 85,
        quantity: 1,
        category: "home",
      },
      {
        id: "prod6",
        name: "Coffee Beans",
        price: 12,
        quantity: 5,
        category: "grocery",
      },
    ],
  },
  {
    id: "cust04",
    name: "Diana",
    cart: [
      {
        id: "prod7",
        name: "Headphones",
        price: 150,
        quantity: 1,
        category: "electronics",
      },
      {
        id: "prod8",
        name: "Power Bank",
        price: 40,
        quantity: 1,
        category: "electronics",
      },
    ],
  },
  {
    id: "cust05",
    name: "Ethan",
    cart: [
      {
        id: "prod9",
        name: "Sneakers",
        price: 70,
        quantity: 2,
        category: "fashion",
      },
      {
        id: "prod10",
        name: "Socks",
        price: 5,
        quantity: 6,
        category: "fashion",
      },
    ],
  },
  {
    id: "cust06",
    name: "Fiona",
    cart: [
      {
        id: "prod11",
        name: "Microwave",
        price: 200,
        quantity: 1,
        category: "home",
      },
      {
        id: "prod12",
        name: "Dinner Plates",
        price: 30,
        quantity: 1,
        category: "home",
      },
    ],
  },
  {
    id: "cust07",
    name: "George",
    cart: [
      {
        id: "prod13",
        name: "Smartphone",
        price: 900,
        quantity: 1,
        category: "electronics",
      },
      {
        id: "prod14",
        name: "Phone Case",
        price: 20,
        quantity: 2,
        category: "electronics",
      },
    ],
  },
  {
    id: "cust08",
    name: "Hannah",
    cart: [
      {
        id: "prod15",
        name: "Notebook",
        price: 3,
        quantity: 10,
        category: "stationery",
      },
      {
        id: "prod16",
        name: "Pen",
        price: 1.5,
        quantity: 20,
        category: "stationery",
      },
    ],
  },
  {
    id: "cust09",
    name: "Ian",
    cart: [
      {
        id: "prod17",
        name: "Backpack",
        price: 60,
        quantity: 1,
        category: "fashion",
      },
      {
        id: "prod18",
        name: "Water Bottle",
        price: 12,
        quantity: 2,
        category: "accessories",
      },
    ],
  },
  {
    id: "cust10",
    name: "Julia",
    cart: [
      {
        id: "prod19",
        name: "Blender",
        price: 100,
        quantity: 1,
        category: "home",
      },
      {
        id: "prod20",
        name: "Smoothie Cup",
        price: 8,
        quantity: 3,
        category: "home",
      },
    ],
  },
  {
    id: "cust11",
    name: "Kevin",
    cart: [
      {
        id: "prod21",
        name: "Gaming Console",
        price: 450,
        quantity: 1,
        category: "electronics",
      },
      {
        id: "prod22",
        name: "Extra Controller",
        price: 60,
        quantity: 1,
        category: "electronics",
      },
    ],
  },
  {
    id: "cust12",
    name: "Laura",
    cart: [
      {
        id: "prod23",
        name: "Dress",
        price: 80,
        quantity: 1,
        category: "fashion",
      },
      {
        id: "prod24",
        name: "Scarf",
        price: 25,
        quantity: 1,
        category: "fashion",
      },
    ],
  },
  {
    id: "cust13",
    name: "Mark",
    cart: [
      {
        id: "prod25",
        name: "Drill Machine",
        price: 120,
        quantity: 1,
        category: "tools",
      },
      {
        id: "prod26",
        name: "Safety Glasses",
        price: 15,
        quantity: 1,
        category: "tools",
      },
    ],
  },
  {
    id: "cust14",
    name: "Nina",
    cart: [
      {
        id: "prod27",
        name: "Skincare Cream",
        price: 35,
        quantity: 2,
        category: "beauty",
      },
      {
        id: "prod28",
        name: "Lipstick",
        price: 20,
        quantity: 1,
        category: "beauty",
      },
    ],
  },
  {
    id: "cust15",
    name: "Oscar",
    cart: [
      {
        id: "prod29",
        name: "Office Chair",
        price: 180,
        quantity: 1,
        category: "furniture",
      },
      {
        id: "prod30",
        name: "Desk Lamp",
        price: 40,
        quantity: 1,
        category: "furniture",
      },
    ],
  },
  {
    id: "cust16",
    name: "Paula",
    cart: [
      {
        id: "prod31",
        name: "Cookware Set",
        price: 150,
        quantity: 1,
        category: "home",
      },
      {
        id: "prod32",
        name: "Cutting Board",
        price: 20,
        quantity: 1,
        category: "home",
      },
    ],
  },
  {
    id: "cust17",
    name: "Quentin",
    cart: [
      {
        id: "prod33",
        name: "Running Shoes",
        price: 90,
        quantity: 1,
        category: "fashion",
      },
      {
        id: "prod34",
        name: "Sports Watch",
        price: 130,
        quantity: 1,
        category: "fashion",
      },
    ],
  },
  {
    id: "cust18",
    name: "Rachel",
    cart: [
      {
        id: "prod35",
        name: "Air Fryer",
        price: 160,
        quantity: 1,
        category: "home",
      },
      {
        id: "prod36",
        name: "Cooking Oil Spray",
        price: 10,
        quantity: 2,
        category: "grocery",
      },
    ],
  },
  {
    id: "cust19",
    name: "Sam",
    cart: [
      {
        id: "prod37",
        name: "Yoga Mat",
        price: 45,
        quantity: 1,
        category: "fitness",
      },
      {
        id: "prod38",
        name: "Dumbbells",
        price: 70,
        quantity: 2,
        category: "fitness",
      },
    ],
  },
  {
    id: "cust20",
    name: "Tina",
    cart: [
      {
        id: "prod39",
        name: "Baby Stroller",
        price: 250,
        quantity: 1,
        category: "baby",
      },
      {
        id: "prod40",
        name: "Baby Bottle",
        price: 15,
        quantity: 4,
        category: "baby",
      },
    ],
  },
];

// Routes
// Get all customers with their carts
app.get("/api/customers", (req, res) => {
  res.json(customers);
});

// Get a specific customer by ID
app.get("/api/customers/:id", (req, res) => {
  const customer = customers.find((c) => c.id === req.params.id);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  res.json(customer);
});

// Get just the cart of a specific customer
app.get("/api/customers/:id/cart", (req, res) => {
  const customer = customers.find((c) => c.id === req.params.id);

  if (!customer) {
    return res.status(404).json({ error: "Customer not found" });
  }

  res.json(customer.cart);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Cart Data Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/customers`);
});
