export type ViolationLevelNumber = 0 | 1 | 2; // 0: Nhẹ, 1: Trung bình, 2: Nặng

export type InvolvedStudent = {
  studentId: string;
  studentName: string;
};

export type Violation = {
  id: string;
  involvedStudents: InvolvedStudent[];
  classId: string;
  inChargeTeacherName: string;
  violateDate: string;
  violationType: string;
  violationLevel: ViolationLevelNumber;
  violationInfo: string;
  penalty: string;
};

export type ViolationStats = {
  totalViolations: number;
  unreadViolations: number;
  servereViolations: number;
  thisWeekViolations: number;
};
