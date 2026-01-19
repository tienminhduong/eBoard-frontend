export type StudentRow = {
  id: string;
  fullName: string;
  dob: string;

  address: string;
  province: string;
  district: string;
  ward: string;

  gender: string;
  relationshipWithParent: string;

  parentName: string;
  phone: string;
  email: string;
  password: string;
};


export type ImportedStudent = StudentRow;
