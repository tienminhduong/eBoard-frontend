import api from "@/api/api";
import { CreateTimetablePayload, TimetableItem, UpdateTimetablePayload } from "@/types/timetable";
import { TimetableSettings } from "@/types/timetableSettings";

export const timetableService = {
  // GET
  async getByClassId(classId: string): Promise<TimetableItem[]> {
    const res = await api.get(`/schedule/${classId}`);

    return res.data.classPeriods.map((p: any): TimetableItem => ({
      id: p.id,
      day: p.dayOfWeek,            // BE: Thứ 2 = 1
      period: p.periodNumber,
      subject: p.subject.name,
      teacher: p.teacherName,
      content: p.notes,
      isMorning: p.isMorningPeriod // xét buổi
    }));
  },
  
  // POST
  async create(payload: CreateTimetablePayload) {
    try {
      const res = await api.post("/schedule/periods", {
        subject: {
          name: payload.subject,
        },
        periodNumber: payload.period,
        dayOfWeek: payload.day,
        teacherName: payload.teacher,
        notes: payload.note,
        classId: payload.classId,
        isMorningPeriod: payload.isMorning,
      });

      return res.data;
    } catch (err: any) {
      console.error("Create timetable error:", err.response?.data);
      throw err;
    }
  },

  // PATCH
  async update(
    classPeriodId: string,
    payload: UpdateTimetablePayload
  ) {
    const res = await api.patch(
      `/schedule/periods`,
      {
        teacherName: payload.teacher,
        subject: {
          name: payload.subject,
        },
        notes: payload.note,
        periodNumber: payload.period,
        dayOfWeek: payload.day,
        isMorningPeriod: payload.isMorning,
      },
      {
        params: {
          classPeriodId,
        },
      }
    );

    return res.data;
  },

  // DELETE
  async deleteTimetable(classPeriodId: string) {
    return api.delete(`/schedule/periods/${classPeriodId}`);
  },

  // GET SETTINGS
  async getSettings(classId: string) {
    const res = await api.get(`/schedule/${classId}/settings`);
    return res.data;
  },

  // UPDATE SETTINGS
  async updateSettings(
    classId: string,
    payload: TimetableSettings
  ) {
    return api.patch(
      `/schedule/${classId}/settings`,
      {
        morningPeriodCount: payload.morningPeriodCount,
        afternoonPeriodCount: payload.afternoonPeriodCount,
        details: payload.details.map((d) => ({
          periodNumber: d.periodNumber,
          isMorningPeriod: d.isMorningPeriod,
          startTime: d.startTime,
          endTime: d.endTime,
        })),
      }
    );
  },
};
