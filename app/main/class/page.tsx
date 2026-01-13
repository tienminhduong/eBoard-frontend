import ClassList from "@/components/class/classList";

export default function ClassPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Lớp của tôi</h1>
      <p className="text-gray-500 mb-6">
        Quản lý và theo dõi các lớp học của bạn
      </p>

      <h2 className="font-medium mb-4">Lớp hiện tại đang dạy</h2>
      <ClassList />
    </div>
  );
}
