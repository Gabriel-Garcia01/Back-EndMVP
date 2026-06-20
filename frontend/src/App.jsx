import "./App.css";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Topbar from "./components/Topbar/Topbar.jsx";
import Footer from "./components/Footer/Footer.jsx";
import { getParks } from "./services/api";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop.jsx";

function App() {
  const [parks, setParks] = useState([]);

  useEffect(() => {
    async function loadParks() {
      try {
        const data = await getParks();
        setParks(data);
      } catch (error) {
        console.error("Erro ao carregar os parques:", error);
      }
    }

    loadParks();
  }, []);

  return (
    <div className="App">
      <ScrollToTop />
      <Topbar parks={parks} />
      <main className="AppContent">
        <Outlet context={{ parks }} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
