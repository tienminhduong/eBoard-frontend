import StudentTable from "@/components/student/StudentTable";

export default function StudentPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">
            Quản lý học sinh - Lớp 1A
          </h1>
          <p className="text-gray-500 text-sm">
            Khối lớp 1 · Tổng số học sinh: 2
          </p>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-orange-400 text-white rounded-lg shadow">
            Import Excel
          </button>
          <button className="px-4 py-2 border border-teal-600 text-teal-600 rounded-lg">
            Xuất danh sách
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        placeholder="Tìm kiếm học sinh theo tên, phụ huynh, SĐT..."
        className="w-full px-4 py-2 rounded-lg border"
      />

      {/* Table */}
      <StudentTable />
    </div>
  );
}
