import { Student } from "../types/student";

export const getStudents = async (): Promise<Student[]> => {
  return [
    { id: 1, name: "Nguyễn Văn A", age: 8 },
    { id: 2, name: "Trần Thị B", age: 9 },
  ];
};
