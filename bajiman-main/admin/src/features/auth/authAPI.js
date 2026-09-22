import { api } from "../../api/axios";

export const adminLogin = async ({ email, password }) => {
  const { data } = await api.post("/api/admin/login", {
    email,
    password,
  });

  return data?.data || data;
};

export const getAdminProfile = async () => {
  const { data } = await api.get("/api/admin/profile");

  return data?.data || data;
};