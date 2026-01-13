export default function Header() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div>
        <h2 className="font-semibold text-gray-700">
          Chào mừng trở lại!
        </h2>
        <p className="text-sm text-gray-400">
          Quản lý lớp học của bạn một cách hiệu quả
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span>🔔</span>
        <div className="text-right">
          <p className="text-sm font-medium">Nguyễn Thị Vân</p>
          <p className="text-xs text-gray-400">Giáo viên</p>
        </div>
      </div>
    </header>
  );
}
