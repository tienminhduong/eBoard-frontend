import Image from "next/image";

export default function Header() {
  return (
    <header className="h-20 bg-white border-b flex items-center justify-between px-6">
      
      {/* Left: Logo + Welcome text */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Image
          src="/logo.jpg"
          alt="eBoard Logo"
          width={150}
          height={150}
        />

        {/* Divider */}
        <div className="mx-4 h-8 w-px bg-gray-200" />

        {/* Welcome text */}
        <div>
          <h2 className="font-semibold text-gray-700 text-lg">
            Chào mừng trở lại!
          </h2>
          <p className="text-base text-gray-400">
            Quản lý lớp học của bạn một cách hiệu quả
          </p>
        </div>
      </div>

      {/* Right: Notification + User */}
      <div className="flex items-center gap-4">
        <button className="text-xl">🔔</button>

        <div className="text-left">
          <p className="text-base font-medium text-gray-700">
            Nguyễn Thị Vân
          </p>
          <p className="text-sm text-gray-400">
            Giáo viên
          </p>
        </div>
      </div>
    </header>
  );
}
