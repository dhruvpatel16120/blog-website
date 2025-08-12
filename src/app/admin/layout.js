export default function AdminRootLayout({ children }) {
  // This layout is just a wrapper - no authentication required
  // Individual admin pages will handle their own authentication
  return children;
}
