import api from "@/lib/api";

export const violationService = {
    // Lấy danh sách vi phạm theo lớp (có phân trang)
    getViolationsByClass: (
        classId: string,
        pageNumber: number = 1,
        pageSize: number = 20
    ) =>
        api.get(
        `/classes/${classId}/violations?pageNumber=${pageNumber}&pageSize=${pageSize}`
        ),

    // Tạo vi phạm mới
    create: (data: any) => api.post("/violations", data),

    // Cập nhật vi phạm
    update: (violationId: string, data: any) =>
        api.put(`/violations/${violationId}`, data),

    // STAT theo khoảng ngày
    getViolationStats: (classId: string, from: string, to: string) =>
    api.get(`/classes/${classId}/violations/stats?from=${from}&to=${to}`),

    // Lấy học sinh trong lớp
    getStudents: (classId: string) =>
        api.get(`/students/${classId}/lists`),
};
