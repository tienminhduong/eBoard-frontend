import api from "@/lib/api";
import {
  ExtracurricularActivity,
  ParentViewActivity,
  ActivitySignIn,
  CreateActivityPayload,
  UpdateActivityPayload,
  AddActivityParticipantPayload,
  UpdateActivityParticipantPayload,
  AddActivitySignInPayload,
} from "@/types/activity";

export const activityService = {
  /* ===== ACTIVITY ===== */
  getActivityById(id: string) {
    return api.get<ExtracurricularActivity>(`/activities/${id}`)
      .then(res => res.data);
  },

  getActivitiesByClass(classId: string) {
    return api.get<ExtracurricularActivity[]>(`/activities/class/${classId}`)
      .then(res => res.data);
  },

  getActivitiesForParent(classId: string, studentId: string) {
    return api.get<ParentViewActivity[]>(
      `/activities/class/${classId}/parent-view/${studentId}`
    ).then(res => res.data);
  },

  createActivity(payload: CreateActivityPayload) {
    return api.post("/activities", payload);
  },

  updateActivity(id: string, payload: UpdateActivityPayload) {
    return api.put(`/activities/${id}`, payload);
  },

  deleteActivity(id: string) {
    return api.delete(`/activities/${id}`);
  },

  /* ===== PARTICIPANT ===== */
  addParticipant(payload: AddActivityParticipantPayload) {
    return api.post("/activities/participants", payload);
  },

  updateParticipant(id: string, payload: UpdateActivityParticipantPayload) {
    return api.put(`/activities/participants/${id}`, payload);
  },

  removeParticipant(id: string) {
    return api.delete(`/activities/participants/${id}`);
  },

  /* ===== SIGN IN ===== */
  addSignIn(payload: AddActivitySignInPayload) {
    return api.post("/activities/signins", payload);
  },

  removeSignIn(id: string) {
    return api.delete(`/activities/signins/${id}`);
  },

  acceptSignIn(id: string) {
    return api.post(`/activities/signins/${id}/accept`);
  },

  rejectSignIn(id: string) {
    return api.post(`/activities/signins/${id}/reject`);
  },

  checkPaidSignIn(id: string) {
    return api.post(`/activities/signins/${id}/checkpaid`);
  },

  getSignInsPending(classId: string) {
    return api.get<ActivitySignIn[]>(
      `/activities/${classId}/signins/pending`
    ).then(res => res.data);
  },

  getSignInsAccepted(classId: string) {
    return api.get<ActivitySignIn[]>(
      `/activities/${classId}/signins/accepted`
    ).then(res => res.data);
  },

  getSignInsRejected(classId: string) {
    return api.get<ActivitySignIn[]>(
      `/activities/${classId}/signins/rejected`
    ).then(res => res.data);
  },

  getSignInsPaid(classId: string) {
    return api.get<ActivitySignIn[]>(
      `/activities/${classId}/signins/paid`
    ).then(res => res.data);
  },

  getAllSignIns(classId: string) {
    return api.get<ActivitySignIn[]>(
      `/activities/${classId}/signins`
    ).then(res => res.data);
  },

  async addParticipantsBatch(
    payload: {
      studentId: string;
      activityId: string;
      parentPhoneNumber?: string;
      teacherComments?: string;
      notes?: string;
    }[]
  ) {
    return api.post("/activities/participants/batch", payload); // ✅ gửi ARRAY gốc
  }


};
