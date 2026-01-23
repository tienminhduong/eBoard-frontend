import api from "@/lib/api";
import type { UpdateParentInfoRequest, ParentInfo } from "@/types/parent";

export const parentService = {
  async updateParentInfo(id: string, payload: UpdateParentInfoRequest): Promise<void> {
    await api.put(`/parents/info/${id}`, payload);
  },
  async getParentById(id: string): Promise<ParentInfo> {
    const res = await api.get<ParentInfo>(`/parents/info/${id}`);
    return res.data;
  },

  // POST /api/parents/create-accounts
  async createAccounts(parentIds: string[]): Promise<void> {
    const ids = (parentIds || []).map((x) => x.trim()).filter(Boolean);
    if (ids.length === 0) return;

    await api.post("/parents/create-accounts", ids);
  },
};
