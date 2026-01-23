export type StudentRow = {
  [x: string]: any;
  id: string;
  fullName: string;
  dob: string;

  address: string;
  province: string;
  district: string;
  ward: string;

  gender: string;
  relationshipWithParent: string;

  parentId: string;
  parentName: string;
  phone: string;
  email: string;
  password: string;
};


export type ImportedStudent = StudentRow;

export type CreateStudentRequest = {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // yyyy-mm-dd
  address: string;

  province: string; // store province name (or code if you want)
  ward: string;     // store ward name (or code if you want)

  gender: string;
  parentPhoneNumber: string;
  relationshipWithParent: string;
  parentFullName: string;
  classId: string;
};

export type Option = { value: string; label: string };


export type StudentInfoDto = {
  id: string;

  firstName?: string;
  lastName?: string;
  fullName?: string;

  dateOfBirth?: string; // yyyy-mm-dd
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  gender?: string;

  parentPhoneNumber?: string;
  relationshipWithParent?: string;
  parentFullName?: string;
  parentHealthCondition?: string;

  // BE có trả thêm field nào (email/username/password...) thì vẫn không lỗi
  [key: string]: any;
};