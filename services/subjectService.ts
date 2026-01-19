import api from "@/api/api";

export interface Subject {
  id: string;
  name: string;
}

export const subjectService = {
  getByClass(classId: string) {
    return api.get<Subject[]>(`/classes/${classId}/subjects`);
  },
};
