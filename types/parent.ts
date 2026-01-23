export type UpdateParentInfoRequest = {
  fullName: string;
  email: string;
  phoneNumber: string;
  generatedPassword: string;
  address: string;
  
};
export type ParentInfo = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  generatedPassword: string;
  address: string;
  healthCondition: string;
};