/**
 * Demo conversations for the AI Co-founder app
 * These conversations will be loaded when the app first starts
 */

// Generate a unique ID for each conversation and message
import { newId } from "./helpers";

// Chat about Cart Recovery
export const cartRecoveryConversation = {
  id: newId(),
  title: "Cart Recovery Strategy",
  messages: [
    {
      role: "user",
      text: "Can you help me reduce my cart abandonment rate? It's currently at 68%.",
      ts: Date.now() - 86400000, // 1 day ago
    },
    {
      role: "assistant",
      text: "I'd be happy to help you reduce your cart abandonment rate. 68% is close to the industry average of 70%, but we can definitely improve that. Here are some strategies I recommend:\n\n1. **Implement Exit-Intent Popups** - Offer a discount when customers try to leave your site\n2. **Simplify Checkout Process** - Reduce the number of steps in your checkout flow\n3. **Add Multiple Payment Options** - Including digital wallets like Apple Pay and PayPal\n4. **Show Shipping Costs Early** - Unexpected shipping costs are a major abandonment trigger\n5. **Send Automated Recovery Emails** - I can help set these up with personalized discounts\n\nWhich of these would you like to implement first?",
      ts: Date.now() - 86395000, // 5 seconds later
    },
    {
      role: "user",
      text: "I like the automated recovery emails idea. How can we set that up?",
      ts: Date.now() - 86300000, // A bit later
    },
    {
      role: "assistant",
      text: "Great choice! Automated recovery emails can recover 10-15% of abandoned carts. Here's how we can set it up:\n\n1. I'll create an n8n workflow that triggers when a cart is abandoned\n2. The workflow will wait 1 hour, then send a friendly reminder email\n3. If no action is taken, it will send a second email after 24 hours with a 5% discount\n4. If still no action, a final email with a 10% discount will be sent after 72 hours\n\nThe emails will include:\n- The abandoned products with images\n- A clear call-to-action button\n- Personalized content based on browsing history\n\nWould you like me to set up this workflow in n8n for you?",
      ts: Date.now() - 86295000, // 5 seconds later
    },
    {
      role: "user",
      text: "Yes, please set it up! How will it connect to my store?",
      ts: Date.now() - 86200000, // A bit later
    },
    {
      role: "assistant",
      text: "Perfect! I've created a basic workflow template in n8n. To connect it to your store, we'll need to set up an integration. Here are the options:\n\n1. **Shopify Integration** - If you use Shopify, we can use their Abandoned Cart API\n2. **API Connection** - For other platforms, we can use their API or webhooks\n3. **Database Connection** - Direct connection to your database (if accessible)\n\nThe workflow will run automatically once connected. It will:\n- Monitor for abandoned carts (idle for >30 mins)\n- Capture customer email and cart details\n- Send personalized recovery emails on schedule\n- Track conversion rates from each email\n\nWhich integration method works best for your store?",
      ts: Date.now() - 86195000, // 5 seconds later
    },
  ],
};

// Chat about Marketing Strategy
export const marketingStrategyConversation = {
  id: newId(),
  title: "Email Marketing Campaign",
  messages: [
    {
      role: "user",
      text: "I need to create an email marketing campaign for my new summer collection. Can you help?",
      ts: Date.now() - 172800000, // 2 days ago
    },
    {
      role: "assistant",
      text: 'I\'d be happy to help you create an email marketing campaign for your summer collection! To get started, here\'s a strategic approach:\n\n1. **Campaign Structure**:\n   - Teaser email (7 days before launch)\n   - Launch announcement\n   - Follow-up with featured products\n   - Final reminder with limited-time offer\n\n2. **Email Content Ideas**:\n   - Summer styling tips featuring your products\n   - Customer testimonials/reviews\n   - Behind-the-scenes of collection development\n   - Exclusive discount for subscribers\n\n3. **Subject Line Suggestions**:\n   - "Summer Essentials Have Arrived! 🌞"\n   - "Introducing Our Hottest Collection Yet"\n   - "Your Summer Wardrobe, Perfected"\n\nWould you like me to help create a specific part of this campaign, or would you prefer a complete campaign setup?',
      ts: Date.now() - 172795000, // 5 seconds later
    },
    {
      role: "user",
      text: "I'd like a complete campaign setup. Can you create templates for all four emails?",
      ts: Date.now() - 172700000, // A bit later
    },
    {
      role: "assistant",
      text: 'I\'d be happy to create templates for all four emails in your campaign! I\'ll create a complete workflow in n8n that will handle the email sequence automatically.\n\n**Email 1: Teaser (7 days before)**\nSubject: "Something Exciting is Coming Your Way... 🌞"\nPreview: "Get ready for summer with our new collection!"\n\n**Email 2: Launch Announcement**\nSubject: "It\'s Here! Introducing Our Summer Collection 🌴"\nPreview: "Shop the hottest styles of the season"\n\n**Email 3: Featured Products (3 days after launch)**\nSubject: "Our Summer Bestsellers Are Going Fast! ⏰"\nPreview: "See what everyone\'s loving from our new collection"\n\n**Email 4: Final Reminder (7 days after launch)**\nSubject: "Last Chance: 15% Off Summer Collection Ends Tonight! 🔥"\nPreview: "Don\'t miss your chance to save"\n\nEach email will include:\n- Professional design with your branding\n- Mobile-responsive layout\n- Product images with descriptions\n- Clear call-to-action buttons\n\nI\'ve added this to your n8n workflow. Would you like to preview these templates or make any adjustments?',
      ts: Date.now() - 172695000, // 5 seconds later
    },
    {
      role: "user",
      text: "The templates sound perfect. How can I track the performance of this campaign?",
      ts: Date.now() - 172600000, // A bit later
    },
    {
      role: "assistant",
      text: "I'm glad you like the templates! To track the performance of your campaign, I'll set up comprehensive analytics in your n8n workflow:\n\n**Key Metrics We'll Track:**\n\n1. **Email Performance Metrics**\n   - Open rates (industry avg: 15-25%)\n   - Click-through rates (industry avg: 2-5%)\n   - Conversion rates from email to purchase\n   - Revenue attributed to each email\n\n2. **Engagement Dashboard**\n   - Real-time performance tracking\n   - A/B test results for subject lines\n   - Heatmaps showing which products get the most clicks\n   - Subscriber growth and engagement over time\n\n3. **Automated Reports**\n   - Daily performance snapshots\n   - Weekly comprehensive report\n   - Campaign summary after completion\n\nAll these metrics will be available in your dashboard, and I can send automated reports to your email after each campaign stage. Would you like me to set up any specific custom metrics for your business?",
      ts: Date.now() - 172595000, // 5 seconds later
    },
  ],
};

// Chat about Website Builder
export const websiteBuilderConversation = {
  id: newId(),
  title: "Building Online Store",
  messages: [
    {
      role: "user",
      text: "I need to create a simple e-commerce website for my handmade jewelry business. Can you help me?",
      ts: Date.now() - 259200000, // 3 days ago
    },
    {
      role: "assistant",
      text: "I'd be happy to help you create an e-commerce website for your handmade jewelry business! Our website builder makes this process simple and straightforward. Here are three template options I recommend for jewelry businesses:\n\n1. **Artisan Collection** - Minimalist design that showcases your jewelry with large product images and clean navigation\n\n2. **Boutique Shop** - Elegant layout with featured collections, customer testimonials, and integrated Instagram feed\n\n3. **Craft Market** - Warm, artistic design with story-focused elements and prominent about section\n\nAll templates include:\n- Mobile-responsive design\n- Product catalog with categories\n- Secure checkout process\n- Customer account creation\n- SEO optimization\n\nWhich template style appeals to you most?",
      ts: Date.now() - 259195000, // 5 seconds later
    },
    {
      role: "user",
      text: "I like the Boutique Shop template. What customization options are available?",
      ts: Date.now() - 259100000, // A bit later
    },
    {
      role: "assistant",
      text: "Great choice! The Boutique Shop template is perfect for showcasing handmade jewelry. Here are the customization options available:\n\n**Design Customization:**\n- Color scheme (choose from preset palettes or create your own)\n- Typography (10+ font combinations available)\n- Hero section style (carousel, static image, or video background)\n- Layout adjustments (sidebar, full width, or grid layouts)\n\n**Content Sections:**\n- Featured collections (highlight your best sellers or new arrivals)\n- About the artist (tell your story and showcase your craftsmanship)\n- Process showcase (show how your jewelry is made)\n- Instagram feed integration\n- Customer testimonials carousel\n- Newsletter signup with discount offer\n\n**E-commerce Features:**\n- Product variant options (sizes, materials, customizations)\n- Product zoom and gallery options\n- Related products display\n- Cross-sell recommendations\n- Shipping calculator\n- Discount code functionality\n\nWould you like me to create a demo site with the Boutique Shop template so you can see how your store might look?",
      ts: Date.now() - 259095000, // 5 seconds later
    },
    {
      role: "user",
      text: "Yes, please create a demo site! Also, will I be able to add custom product descriptions?",
      ts: Date.now() - 259000000, // A bit later
    },
    {
      role: "assistant",
      text: "I've created a demo site using the Boutique Shop template! You can access it by clicking the \"Preview Demo\" button in the Website Builder section.\n\nAnd yes, you'll have full control over your product descriptions. Here's what you can do:\n\n**Product Description Features:**\n\n1. **Rich Text Editor** - Format text with headings, bullet points, bold, italic, etc.\n\n2. **Product Story Section** - Share the inspiration behind each piece or your creation process\n\n3. **Material Details** - Specify materials used (metals, gemstones, etc.) with tooltips for additional information\n\n4. **Size Guide** - Add custom size charts or measurement guidelines\n\n5. **Care Instructions** - Include maintenance tips for your jewelry\n\n6. **SEO Optimization** - Built-in tools to help optimize your descriptions for search engines\n\n7. **Bulk Editing** - Save time by editing multiple product descriptions at once\n\nYou can also use our AI description generator to create professional product descriptions based on key details you provide about each piece. Would you like me to show you how this feature works?",
      ts: Date.now() - 258995000, // 5 seconds later
    },
  ],
};

// Chat about N8N Workflow
export const n8nWorkflowConversation = {
  id: newId(),
  title: "Automating Social Media",
  messages: [
    {
      role: "user",
      text: "I want to automate posting to Instagram and Facebook for my store. Is that possible?",
      ts: Date.now() - 345600000, // 4 days ago
    },
    {
      role: "assistant",
      text: "Yes, you can definitely automate posting to Instagram and Facebook for your store! I can help you set this up using n8n workflows. Here's how we can implement this:\n\n1. **Content Creation Workflow**\n   - Generate product highlights on a schedule\n   - Create engaging captions with AI assistance\n   - Format images properly for each platform\n   - Add your branded hashtags automatically\n\n2. **Posting Schedule**\n   - Set optimal posting times based on audience activity\n   - Create a consistent posting calendar (e.g., 3x per week)\n   - Schedule special posts for holidays or promotions\n   - Avoid overlapping content between platforms\n\n3. **Integration Method**\n   - Connect to Facebook Business Suite (handles both Facebook and Instagram)\n   - Set up authentication once, then posts run automatically\n   - Preview posts before they go live (optional approval step)\n\nWould you like me to create this workflow for you in n8n?",
      ts: Date.now() - 345595000, // 5 seconds later
    },
    {
      role: "user",
      text: "Yes, please create the workflow. Can it also include performance tracking?",
      ts: Date.now() - 345500000, // A bit later
    },
    {
      role: "assistant",
      text: "I've created a social media automation workflow with performance tracking in n8n! The workflow is now available in your n8n dashboard.\n\n**The workflow includes:**\n\n1. **Content Scheduling System**\n   - Posts to Facebook and Instagram on your defined schedule\n   - Content calendar view for planning ahead\n   - Drag-and-drop interface for rescheduling posts\n\n2. **Performance Analytics**\n   - Engagement tracking (likes, comments, shares)\n   - Reach and impression statistics\n   - Follower growth correlation with specific posts\n   - Best performing content types and posting times\n\n3. **Automated Reports**\n   - Weekly performance summary\n   - Monthly trend analysis\n   - Content recommendation based on top performers\n   - Competitor benchmarking (optional)\n\n4. **Advanced Features**\n   - A/B testing for post variations\n   - Automatic hashtag performance analysis\n   - Engagement response suggestions\n   - Content recycling for top-performing posts\n\nThe workflow is set to run automatically, but you can review scheduled posts before they go live. Would you like me to walk you through how to use the workflow or make any customizations?",
      ts: Date.now() - 345495000, // 5 seconds later
    },
    {
      role: "user",
      text: "This looks great! Can you show me how to customize the posting schedule?",
      ts: Date.now() - 345400000, // A bit later
    },
    {
      role: "assistant",
      text: 'I\'d be happy to show you how to customize the posting schedule in your new workflow! Here\'s a step-by-step guide:\n\n**Customizing Your Social Media Posting Schedule:**\n\n1. **Access the Schedule Manager**\n   - Go to the n8n workflow tab\n   - Click on the "Social Media Automation" workflow\n   - Find the "Schedule Configuration" node\n\n2. **Set Your Posting Times**\n   - The default schedule is:\n     - Instagram: Mon/Wed/Fri at 11:30 AM and 7:00 PM\n     - Facebook: Tue/Thu/Sat at 1:00 PM and 8:00 PM\n   - Click on any time slot to modify it\n   - You can add new time slots with the "+" button\n\n3. **Platform-Specific Settings**\n   - Each platform has optimized settings for:\n     - Image dimensions and formats\n     - Caption length and hashtag placement\n     - Content type priorities (stories, posts, reels)\n\n4. **Content Calendar View**\n   - Toggle to "Calendar View" to see your schedule visually\n   - Drag and drop posts to reschedule them\n   - Color coding shows different content types\n\n5. **Save Your Configuration**\n   - Click "Apply Changes" to update your schedule\n   - The workflow will automatically adjust to your new settings\n\nWould you like me to help you determine the optimal posting times based on your specific audience demographics?',
      ts: Date.now() - 345395000, // 5 seconds later
    },
  ],
};

// Chat about New Year Promo with Electronics
export const newYearPromoConversation = {
  id: newId(),
  title: "New Year Electronics Promo",
  messages: [
    {
      role: "user",
      text: "What can you actually help me with as a model?",
      ts: Date.now() - 43200000, // 12 hours ago
    },
    {
      role: "assistant",
      text: "I can help through several MCP tools. For example Cart Analysis helps find who abandoned or still has items in their carts. Inventory Management checks stock levels and low stock items. SEO and Content generates optimized copy for products and blogs. Email Campaign builds and sends personalized messages. If you tell me your goal I can route the request to the right tool and show results in the chat.",
      ts: Date.now() - 43195000,
    },
    {
      role: "user",
      text: "I want to run a 10% off promotion for New Year. Can you help me?",
      ts: Date.now() - 43100000,
    },
    {
      role: "assistant",
      text: "Yes I can help set a New Year promotion with a ten percent discount. We can prepare a short campaign and schedule it for email or SMS. Do you want to target a specific segment such as shoppers with electronics in their carts?",
      ts: Date.now() - 43095000,
    },
    {
      role: "user",
      text: "Can you check how many users currently have electronics items in their shopping cart?",
      ts: Date.now() - 43000000,
    },
    {
      role: "assistant",
      text: "I used the MCP Cart Analysis tool to scan active carts. Right now there are 3 customers with electronics items in their carts. Would you like me to list the customer IDs or proceed to drafting the message?",
      ts: Date.now() - 42995000,
    },
    {
      role: "user",
      text: "Ok then write an email offering 15% off electronics for the New Year to send to those 3 customers.",
      ts: Date.now() - 42900000,
    },
    {
      role: "assistant",
      text: "Here is a draft email:\n\nSubject: Celebrate the New Year with 15% off Electronics\n\nHello,\n\nHappy New Year. To kick off the season we are giving you fifteen percent off all electronics in your cart. Complete your purchase today and enjoy the savings.\n\nUse code NEWYEAR15 at checkout.\n\nBest wishes,\nYour Store Team\n\nShall I activate the Email Campaign tool to send this to the three customers now or would you like any edits first?",
      ts: Date.now() - 42895000,
    },
  ],
};

// All demo conversations
export const demoConversations = [
  cartRecoveryConversation,
  marketingStrategyConversation,
  websiteBuilderConversation,
  n8nWorkflowConversation,
  newYearPromoConversation, // added
];

// Function to initialize demo data in localStorage if it doesn't exist
export const initializeDemoData = () => {
  // Force initialize demo data for the demo
  console.log("Initializing demo conversations...");

  // Format sessions data
  const sessions = demoConversations.map((conv) => ({
    id: conv.id,
    title: conv.title,
  }));

  // Format messages data
  const messagesBySession = {};
  demoConversations.forEach((conv) => {
    messagesBySession[conv.id] = conv.messages;
  });

  // Set the current session ID to the first conversation
  const currentId = sessions[0]?.id || "";

  // Save to localStorage
  localStorage.setItem("sessions", JSON.stringify(sessions));
  localStorage.setItem("messagesBySession", JSON.stringify(messagesBySession));
  localStorage.setItem("currentId", JSON.stringify(currentId));
  localStorage.setItem("currentView", JSON.stringify("chat"));

  console.log("Demo data initialized successfully!");
  return true;
};
