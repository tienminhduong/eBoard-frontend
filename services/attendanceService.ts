import api from "@/lib/api";
import {
  AttendanceInfoByClass,
  CreateAttendanceDto,
  PatchAttendanceDto,
} from "@/types/attendance";

export const attendanceService = {
  async getByClassAndDate(
    classId: string,
    date: string
  ): Promise<AttendanceInfoByClass> {
    const res = await api.get(
      `/attendance/class/${classId}/date/${date}`
    );

    return {
      ...res.data,
      date,
    };
  },

  async createForDate(
    dto: CreateAttendanceDto
  ): Promise<AttendanceInfoByClass> {
    const res = await api.post(`/attendance`, dto);

    return {
      ...res.data,
      date: dto.date,
    };
  },

  async patchAttendance(
    attendanceId: string,
    dto: PatchAttendanceDto
  ): Promise<void> {
    if (!attendanceId || attendanceId.startsWith("00000000")) {
      console.warn("❌ Invalid attendanceId, skip PATCH");
      return;
    }

    await api.patch(`/attendance/${attendanceId}`, dto);
  },

  /* ===== NOTIFY ABSENCE WITHOUT EXCUSE ===== */
  async notifyAbsenceWithoutExcuse(
    classId: string,
    date: string
  ): Promise<void> {
    await api.post(
      `/attendance/class/${classId}/notify-absence-without-excuse/${date}`
    );
  },

  /* ===== ABSENT REQUEST ===== */
async getPendingAbsentRequests(classId: string, page = 1, size = 50) {
  const res = await api.get(
    `/attendance/absent-requests/class/${classId}/pending?pageNumber=${page}&pageSize=${size}`
  );
  return res.data;
},

async approveAbsentRequest(requestId: string) {
  await api.post(`/attendance/absent-request/${requestId}/approve`);
},

async rejectAbsentRequest(requestId: string) {
  await api.post(`/attendance/absent-request/${requestId}/reject`);
},

async getApprovedAbsentRequests(classId: string, page = 1, size = 50) {
  const res = await api.get(
    `/attendance/absent-requests/class/${classId}/approved?pageNumber=${page}&pageSize=${size}`
  );
  return res.data;
},

async getRejectedAbsentRequests(classId: string, page = 1, size = 50) {
  const res = await api.get(
    `/attendance/absent-requests/class/${classId}/rejected?pageNumber=${page}&pageSize=${size}`
  );
  return res.data;
},


};
