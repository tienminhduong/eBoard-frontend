import Link from "next/link";

export default function ClassCard() {
  return (
    <div className="w-80 bg-white rounded-xl shadow">
      <div className="bg-teal-700 text-white p-4 rounded-t-xl">
        <h3 className="text-lg font-semibold">Lớp 1A</h3>
        <p className="text-sm">Khối lớp 1</p>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm">📍 Phòng học: A101</p>
        <p className="text-sm">📅 Năm học: 2025–2026</p>

        <div>
          <p className="text-sm">👥 Sĩ số: 28/30</p>
          <div className="h-2 bg-gray-200 rounded mt-1">
            <div className="h-2 bg-teal-600 rounded w-[93%]" />
          </div>
        </div>
      </div>

      <div className="p-4 flex gap-2">
        <Link
          href="/main/class/1A"
          className="flex-1 text-center bg-teal-700 text-white py-2 rounded-lg"
        >
          Quản lý HS
        </Link>

        <button className="flex-1 border border-teal-700 text-teal-700 py-2 rounded-lg">
          Chi tiết
        </button>
      </div>
    </div>
  );
}
