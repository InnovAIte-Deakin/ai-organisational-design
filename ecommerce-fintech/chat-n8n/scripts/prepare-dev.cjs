const fs = require("fs");
const path = require("path");

// Function to clear localStorage data from the browser
function clearLocalStorageFile() {
  console.log("Preparing development environment...");

  // Clear LocalStorage by creating a script that will be loaded in the HTML
  const scriptContent = `
// Clear localStorage for fresh demo data
try {
  console.log('Clearing localStorage for fresh demo data...');
  localStorage.clear();
  console.log('localStorage cleared successfully!');
} catch (e) {
  console.error('Failed to clear localStorage:', e);
}
`;

  // Create directory if it doesn't exist
  const dirPath = path.join(__dirname, "../public");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Write script to clear localStorage
  fs.writeFileSync(path.join(dirPath, "clear-storage.js"), scriptContent);

  console.log("Created localStorage clearing script");

  // Modify index.html to include our script
  try {
    const indexPath = path.join(__dirname, "../index.html");
    let html = fs.readFileSync(indexPath, "utf-8");

    // Check if our script is already added
    if (!html.includes("clear-storage.js")) {
      // Insert our script before the closing head tag
      html = html.replace(
        "</head>",
        '  <script src="/clear-storage.js"></script>\n  </head>'
      );

      // Write the modified HTML back
      fs.writeFileSync(indexPath, html);
      console.log("Updated index.html to include localStorage clearing script");
    }
  } catch (error) {
    console.error("Error updating index.html:", error);
  }

  console.log("Development environment ready!");
}

// Run the function
clearLocalStorageFile();
