import { Outlet } from "react-router";
import { Navbar } from "../components/Navbar";
import { Chatbot } from "../components/Chatbot";

export function Root() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#FFFFFF", minHeight: "100vh" }}>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Chatbot />
    </div>
  );
}