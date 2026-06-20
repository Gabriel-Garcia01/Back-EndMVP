const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const getUser = async (email) => {
  const res = await fetch(`${BASE_URL}/users?email=${encodeURIComponent(email)}`);

  if (!res.ok) {
    throw new Error("Erro ao buscar o usuário");
  }

  const data = await res.json();
  return data[0];
};

export const login = async (email, password) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Erro ao fazer login");
  }

  return res.json();
};

export const register = async (name, email, password) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Erro ao cadastrar usuário");
  }

  return res.json();
};

export const getParks = async () => {
  const res = await fetch(`${BASE_URL}/parks`);

  if (!res.ok) {
    throw new Error("Erro ao buscar os parques");
  }

  const data = await res.json();
  return data;
};

export const getParkBySlug = async (parkSlug) => {
  const res = await fetch(`${BASE_URL}/parks?slug=${parkSlug}`);

  if (!res.ok) {
    throw new Error("Erro ao buscar o parque");
  }

  const data = await res.json();
  return data[0];
};

export const getTrailBySlug = async (trailSlug) => {
  const res = await fetch(`${BASE_URL}/trails?slug=${trailSlug}`);

  if (!res.ok) {
    throw new Error("Erro ao buscar trilha");
  }

  const data = await res.json();
  return data[0];
};

export const getTrailByParkId = async (parkId) => {
  const res = await fetch(`${BASE_URL}/trails?parkId=${parkId}`);

  if (!res.ok) {
    throw new Error("Erro ao buscar a trilha");
  }

  return res.json();
};
export const getSearchLocations = async () => {
  const res = await fetch(`${BASE_URL}/locais-divididos`);
  if (!res.ok) {
    throw new Error("Erro ao carregar locais de busca");
  }

  return res.json();
};
export const getWaterfallBySlug = async (waterfallSlug) => {
  const res = await fetch(`${BASE_URL}/waterfalls?slug=${waterfallSlug}`);

  if (!res.ok) {
    throw new Error("Erro ao buscar a cachoeira");
  }

  const data = await res.json();
  return data[0];
};

export const getWaterfallsByParkId = async (parkId) => {
  const res = await fetch(`${BASE_URL}/waterfalls?parkId=${parkId}`);

  if (!res.ok) {
    throw new Error("Erro ao buscar as cachoeiras");
  }

  return res.json();
};