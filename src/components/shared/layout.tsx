import { Outlet } from "react-router";
import { Toaster } from "sonner";
import Footer from "./footer";
import Navbar from "./navigation";

function Layout() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Navbar />
      <Toaster />
      <Outlet />
      <Footer />
    </main>
  );
}

export default Layout;
