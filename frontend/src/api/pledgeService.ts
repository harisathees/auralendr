import api from "./apiClient";

export const listPledges = (params?: any) =>
  api.get("/pledges", { params });

export const getPledge = (id: string) =>
  api.get(`/pledges/${id}`);

export const createPledge = (data: FormData) =>
  api.post("/pledges", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updatePledge = (id: string, data: FormData) =>
  api.post(`/pledges/${id}?_method=PUT`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deletePledge = (id: string) =>
  api.delete(`/pledges/${id}`);
