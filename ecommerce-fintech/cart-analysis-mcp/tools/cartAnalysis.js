/**
 * Cart Analysis Tool
 * Analyzes a customer's shopping cart to provide insights.
 * Fetches cart data from a separate server running on port 3001
 */
const axios = require("axios");

// Some sample product database for recommendations and categories
const productDatabase = {
  categories: {
    electronics: {
      name: "Electronics",
      complementary: ["accessories", "warranty"],
      alternatives: ["electronics"],
    },
    groceries: {
      name: "Groceries",
      complementary: ["beverages", "snacks"],
      alternatives: ["groceries"],
    },
    clothing: {
      name: "Clothing",
      complementary: ["accessories", "footwear"],
      alternatives: ["clothing"],
    },
    accessories: {
      name: "Accessories",
      complementary: ["clothing", "electronics"],
      alternatives: ["accessories"],
    },
    beverages: {
      name: "Beverages",
      complementary: ["snacks", "groceries"],
      alternatives: ["beverages"],
    },
    snacks: {
      name: "Snacks",
      complementary: ["beverages", "groceries"],
      alternatives: ["snacks"],
    },
    footwear: {
      name: "Footwear",
      complementary: ["clothing", "accessories"],
      alternatives: ["footwear"],
    },
    warranty: {
      name: "Warranty",
      complementary: ["electronics"],
      alternatives: [],
    },
  },

  // Sample deals and discounts
  deals: [
    {
      type: "bundle",
      category: "electronics",
      threshold: 2,
      discount: 10,
      description: "10% off when buying 2 or more electronics",
    },
    {
      type: "quantity",
      category: "groceries",
      threshold: 5,
      discount: 15,
      description: "15% off when buying 5 or more grocery items",
    },
    {
      type: "bundle",
      categories: ["clothing", "footwear"],
      discount: 20,
      description: "20% off when buying clothing and footwear together",
    },
    {
      type: "seasonal",
      categories: ["beverages", "snacks"],
      discount: 5,
      description: "Summer special: 5% off beverages and snacks",
    },
  ],
};

/**
 * Analyzes a customer's shopping cart
 * @param {Object} params - Parameters for the analysis
 * @param {Array} params.cart - Array of cart items (optional if customerId is provided)
 * @param {string} [params.customerId] - Optional customer ID for fetching data and personalized recommendations
 * @returns {Object} Cart analysis results
 */
async function analyzeCart(params) {
  let { cart, customerId } = params;

  // If customerId is provided, try to fetch the cart data from the server
  if (customerId) {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/customers/${customerId}/cart`
      );
      cart = response.data;
      console.log(`Fetched cart data for customer ${customerId}`);
    } catch (error) {
      console.error(`Error fetching cart data: ${error.message}`);
      if (error.response) {
        console.error("Response error:", error.response.data);
      }

      // If we have a cart parameter, use it as fallback
      if (!cart || !Array.isArray(cart) || cart.length === 0) {
        throw new Error(
          `Could not fetch cart data for customer ${customerId} and no fallback cart provided`
        );
      }
    }
  }

  // Validate input
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    throw new Error("Invalid cart: must be a non-empty array of items");
  }

  // Basic cart metrics
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalCost = cart.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  // Category analysis
  const categoryCounts = {};
  const categoryTotals = {};

  cart.forEach((item) => {
    const category = item.category || "uncategorized";
    categoryCounts[category] =
      (categoryCounts[category] || 0) + (item.quantity || 1);
    categoryTotals[category] =
      (categoryTotals[category] || 0) +
      (item.price || 0) * (item.quantity || 1);
  });

  // Find applicable deals
  const applicableDeals = [];
  const potentialDeals = [];

  // Check bundle deals
  productDatabase.deals.forEach((deal) => {
    if (deal.type === "bundle" && deal.category) {
      // Single category bundle deals
      const categoryCount = categoryCounts[deal.category] || 0;
      if (categoryCount >= deal.threshold) {
        const savings = (categoryTotals[deal.category] * deal.discount) / 100;
        applicableDeals.push({
          description: deal.description,
          savings: savings.toFixed(2),
        });
      } else if (categoryCount > 0) {
        potentialDeals.push({
          description: deal.description,
          missing: `${deal.threshold - categoryCount} more ${
            deal.category
          } items`,
        });
      }
    } else if (deal.type === "bundle" && deal.categories) {
      // Multi-category bundle deals
      const hasAllCategories = deal.categories.every(
        (cat) => (categoryCounts[cat] || 0) > 0
      );
      if (hasAllCategories) {
        const totalAffected = deal.categories.reduce(
          (sum, cat) => sum + (categoryTotals[cat] || 0),
          0
        );
        const savings = (totalAffected * deal.discount) / 100;
        applicableDeals.push({
          description: deal.description,
          savings: savings.toFixed(2),
        });
      } else {
        const missingCategories = deal.categories.filter(
          (cat) => (categoryCounts[cat] || 0) === 0
        );
        potentialDeals.push({
          description: deal.description,
          missing: `Need items from: ${missingCategories.join(", ")}`,
        });
      }
    } else if (deal.type === "quantity" && deal.category) {
      // Quantity-based deals
      const categoryCount = categoryCounts[deal.category] || 0;
      if (categoryCount >= deal.threshold) {
        const savings = (categoryTotals[deal.category] * deal.discount) / 100;
        applicableDeals.push({
          description: deal.description,
          savings: savings.toFixed(2),
        });
      } else if (categoryCount > 0) {
        potentialDeals.push({
          description: deal.description,
          missing: `${deal.threshold - categoryCount} more ${
            deal.category
          } items`,
        });
      }
    } else if (deal.type === "seasonal" && deal.categories) {
      // Seasonal deals
      const hasAnyCategory = deal.categories.some(
        (cat) => (categoryCounts[cat] || 0) > 0
      );
      if (hasAnyCategory) {
        const totalAffected = deal.categories.reduce(
          (sum, cat) => sum + (categoryTotals[cat] || 0),
          0
        );
        const savings = (totalAffected * deal.discount) / 100;
        applicableDeals.push({
          description: deal.description,
          savings: savings.toFixed(2),
        });
      }
    }
  });

  // Generate recommendations
  const recommendations = [];

  // Complementary product recommendations
  Object.keys(categoryCounts).forEach((category) => {
    if (productDatabase.categories[category]) {
      const complementary =
        productDatabase.categories[category].complementary || [];
      complementary.forEach((compCat) => {
        if (!categoryCounts[compCat] && productDatabase.categories[compCat]) {
          recommendations.push({
            type: "complementary",
            category: productDatabase.categories[compCat].name,
            reason: `Goes well with your ${productDatabase.categories[category].name} items`,
          });
        }
      });
    }
  });

  // Calculate total potential savings
  const totalSavings = applicableDeals.reduce(
    (sum, deal) => sum + parseFloat(deal.savings),
    0
  );

  // Return analysis results
  return {
    summary: {
      totalItems,
      totalCost: totalCost.toFixed(2),
      totalSavings: totalSavings.toFixed(2),
      finalCost: (totalCost - totalSavings).toFixed(2),
      customerId: customerId || "none",
    },
    categoryBreakdown: Object.keys(categoryCounts).map((category) => ({
      category,
      items: categoryCounts[category],
      total: categoryTotals[category].toFixed(2),
    })),
    deals: {
      applicable: applicableDeals,
      potential: potentialDeals,
    },
    recommendations,
    cartDetails: cart.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: (item.price * item.quantity).toFixed(2),
    })),
  };
}

module.exports = {
  analyzeCart,
};
