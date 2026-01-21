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

  /* ===== NOTIFY ABSENT (TEMP) ===== */
  async notifyAbsentParents(dto: {
    classId: string;
    date: string;
    studentIds: string[];
  }): Promise<void> {
    await api.post("/attendance/notify-absent", dto);
  }
};
