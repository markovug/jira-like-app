import axios from "axios";
import { api, type User } from "./api";

export async function getMe(): Promise<User | null> {
  try {
    const res = await api.get<User>("/me");
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) return null;
    throw err;
  }
}
