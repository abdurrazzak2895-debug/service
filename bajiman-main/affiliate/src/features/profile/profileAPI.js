import api from "../../api/axios";

export const getMyProfile = async () => {
  const { data } = await api.get("/api/profile/me");

  return data?.data?.user;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put("/api/profile/update-profile", payload);

  return data;
};
