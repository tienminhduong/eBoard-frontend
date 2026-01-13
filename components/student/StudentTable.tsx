import { Student } from "@/types/Student";

const students: Student[] = [
  { id: 1, name: "Nguyễn Văn A", age: 8 },
  { id: 2, name: "Trần Thị B", age: 9 },
];

export default function StudentTable() {
  return (
    <table border={1} cellPadding={8}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên</th>
          <th>Tuổi</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s) => (
          <tr key={s.id}>
            <td>{s.id}</td>
            <td>{s.name}</td>
            <td>{s.age}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
