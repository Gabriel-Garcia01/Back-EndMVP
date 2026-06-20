import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTrailBySlug } from "../services/api";

/**
 * Custom hook to detect active navigation item based on current route
 * Returns "home" for homepage, parkId for park/trail pages
 * Handles: Home, Park pages, Trail pages (highlights associated park)
 * Can be extended for waterfalls and other nested pages
 */
export const useActiveNavItem = (parks = []) => {
  const location = useLocation();
  const [activeItemId, setActiveItemId] = useState(null);

  useEffect(() => {
    const pathname = location.pathname;

    // Homepage
    if (pathname === "/") {
      setActiveItemId("home");
      return;
    }

    // Park page: /parques/:slug
    if (pathname.startsWith("/parques/")) {
      const slug = pathname.split("/parques/")[1];
      const park = parks.find((p) => p.slug === slug);
      if (park) {
        setActiveItemId(park.id);
      }
      return;
    }

    // Trail page: /trilhas/:slug - fetch trail to get parkId
    if (pathname.startsWith("/trilhas/")) {
      const slug = pathname.split("/trilhas/")[1];
      let isMounted = true;

      const fetchTrailPark = async () => {
        try {
          const trail = await getTrailBySlug(slug);
          if (isMounted && trail?.parkId) {
            setActiveItemId(trail.parkId);
          }
        } catch (error) {
          console.error("Erro ao buscar trilha para navspy:", error);
        }
      };

      fetchTrailPark();

      // Cleanup function to prevent state update on unmount
      return () => {
        isMounted = false;
      };
    }

    // Waterfall page: /quedas/:slug - fetch waterfall to get parkId
    // This will work when waterfalls are added to the API
    if (pathname.startsWith("/quedas/")) {
      const slug = pathname.split("/quedas/")[1];
      let isMounted = true;

      const fetchWaterfallPark = async () => {
        try {
          // Future: implement getWaterfallBySlug similar to getTrailBySlug
          // const waterfall = await getWaterfallBySlug(slug);
          // if (isMounted && waterfall?.parkId) {
          //   setActiveItemId(waterfall.parkId);
          // }
        } catch (error) {
          console.error("Erro ao buscar queda para navspy:", error);
        }
      };

      fetchWaterfallPark();

      return () => {
        isMounted = false;
      };
    }
  }, [location.pathname, parks]);

  return activeItemId;
};
