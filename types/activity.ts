/* ===== PARTICIPANT ===== */
export interface ActivityParticipant {
  id: string;
  studentName: string;
  parentPhoneNumber: string;
  teacherComments: string;
  notes: string;
}

/* ===== ACTIVITY (TEACHER VIEW) ===== */
export interface ExtracurricularActivity {
  id: string;
  name: string;
  location: string;
  maxParticipants: number;
  inChargeTeacher: string;
  startTime: string;        // ISO string
  endTime: string;
  cost: number;
  assignDeadline: string;
  description: string;
  participants: ActivityParticipant[];
}

/* ===== PARENT VIEW ===== */
export interface ParentViewActivity {
  id: string;
  name: string;
  location: string;
  inChargeTeacher: string;
  startTime: string;
  endTime: string;
  cost: number;
  assignDeadline: string;
  description: string;
  assignStatus: string;
}

/* ===== SIGN IN ===== */
export interface ActivitySignIn {
  id: string;
  studentName: string;
  activityName: string;
  signInTime: string;
  status: string;
}

/* ===== CREATE / UPDATE ACTIVITY ===== */
export interface CreateActivityPayload {
  classId: string;
  name: string;
  location: string;
  maxParticipants: number;
  inChargeTeacher: string;
  startTime: string;
  endTime: string;
  cost: number;
  assignDeadline: string;
  description: string;
}

export interface UpdateActivityPayload {
  name: string;
  location: string;
  maxParticipants: number;
  inChargeTeacher: string;
  startTime: string;
  endTime: string;
  cost: number;
  assignDeadline: string;
  description: string;
}

/* ===== PARTICIPANT ===== */
export interface AddActivityParticipantPayload {
  studentId: string;
  activityId: string;
  parentPhoneNumber: string;
  teacherComments: string;
  notes: string;
}

export interface UpdateActivityParticipantPayload {
  parentPhoneNumber: string;
  teacherComments: string;
  notes: string;
}

/* ===== SIGN IN ===== */
export interface AddActivitySignInPayload {
  studentId: string;
  activityId: string;
}
