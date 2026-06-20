import React, { useEffect, useState } from "react";
import Logo from "/TVLogonew.png";
import styles from "./Topbar.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useActiveNavItem } from "../../hooks/useActiveNavItem";
import Topbaruserarea from "../Topbaruserarea/Topbaruserarea";
import { getSearchLocations } from "../../services/api";

const Topbar = ({ parks = [] }) => {
  const navigate = useNavigate();
  const activeItemId = useActiveNavItem(parks);
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState({ trilhas: [], cachoeiras: [] });
  const [searchError, setSearchError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    async function loadLocations() {
      try {
        const data = await getSearchLocations();
        setLocations(data);
      } catch (err) {
        console.error("Erro ao carregar locais de busca:", err);
      }
    }
    loadLocations();
  }, []);

  // Fechar a busca quando clicar fora ou pressionar ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[class*="searchNavItem"]')) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setShowSuggestions(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen]);

  const normalizeSearch = (text) =>
    String(text || "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setSearchError("");

    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const normalizedQuery = normalizeSearch(query);
    const allLocations = [
      ...locations.trilhas.map((item) => ({ ...item, type: "trilhas" })),
      ...locations.cachoeiras.map((item) => ({ ...item, type: "cachoeiras" })),
    ];

    const filtered = allLocations.filter((item) => {
      const name = normalizeSearch(item.nome);
      const slug = normalizeSearch(item.slug);
      return name.includes(normalizedQuery) || slug.includes(normalizedQuery);
    }).slice(0, 8); // Limita a 8 sugestões

    setSuggestions(filtered);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (item) => {
    const park = parks.find((parkItem) => parkItem.id === item.parkId);
    if (!park) {
      setSearchError("Parque não encontrado para o item selecionado.");
      return;
    }

    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    navigate(`/parques/${park.slug}/${item.type}/${item.slug}`);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setShowSuggestions(false);
    setSearchError("");
    const query = normalizeSearch(searchQuery);
    if (!query) return;

    const allLocations = [
      ...locations.trilhas.map((item) => ({ ...item, type: "trilhas" })),
      ...locations.cachoeiras.map((item) => ({ ...item, type: "cachoeiras" })),
    ];

    const match = allLocations.find((item) => {
      const name = normalizeSearch(item.nome);
      const slug = normalizeSearch(item.slug);
      return name.includes(query) || slug.includes(query);
    });

    if (!match) {
      setSearchError("Nenhuma trilha ou cachoeira encontrada.");
      return;
    }

    const park = parks.find((parkItem) => parkItem.id === match.parkId);
    if (!park) {
      setSearchError("Parque não encontrado para o item selecionado.");
      return;
    }

    setSearchQuery("");
    navigate(`/parques/${park.slug}/${match.type}/${match.slug}`);
  };

  return (
    <div className={styles.topbar}>
      <Link to="/">
        <img className={styles.topbarlogo} src={Logo} alt="Logo" />
      </Link>
      <nav>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link
              to="/"
              className={`${styles.navLink} ${
                activeItemId === "home" ? styles.active : ""
              }`}
            >
              Início
            </Link>
          </li>
          {parks.map((park) => (
            <li key={park.id} className={styles.navItem}>
              <Link
                to={`/parques/${park.slug}`}
                className={`${styles.navLink} ${
                  activeItemId === park.id ? styles.active : ""
                }`}
              >
                {park.shortName}
              </Link>
            </li>
          ))}
          <li className={`${styles.searchNavItem} ${isSearchOpen ? styles.searchOpen : ""}`}>
            <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
              <button
                type="button"
                className={styles.searchIconButton}
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (!isSearchOpen) {
                    setTimeout(() => {
                      const input = document.querySelector('input[type="search"]');
                      input?.focus();
                    }, 0);
                  }
                }}
                aria-label="Abrir busca"
              >
                <svg
                  className={styles.searchIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>

              {isSearchOpen && (
                <div className={styles.searchContainer}>
                  <input
                    className={styles.searchInput}
                    type="search"
                    placeholder="Buscar trilhas ou cachoeiras"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSuggestions(true)}
                    aria-label="Buscar trilhas ou cachoeiras"
                    autoFocus
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className={styles.suggestionsList}>
                      {suggestions.map((item, index) => (
                        <li key={index} className={styles.suggestionItem}>
                          <button
                            type="button"
                            onClick={() => handleSelectSuggestion(item)}
                            className={styles.suggestionButton}
                          >
                            <span className={styles.suggestionIcon}>
                              {item.type === "trilhas" ? "🥾" : "💧"}
                            </span>
                            <span className={styles.suggestionName}>{item.parque} - {item.nome}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </form>
          </li>
        </ul>
      </nav>
      <Topbaruserarea />
      {searchError && <span className={styles.searchError}>{searchError}</span>}
    </div>
  );
};

export default Topbar;
