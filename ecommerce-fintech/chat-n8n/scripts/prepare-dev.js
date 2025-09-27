// Script to clear localStorage before starting dev server
console.log("Preparing development environment...");

// Run in browser environment only
if (typeof localStorage !== "undefined") {
  console.log("Clearing localStorage for fresh demo data...");
  localStorage.clear();
  console.log("localStorage cleared successfully!");
}

console.log("Development environment ready!");
