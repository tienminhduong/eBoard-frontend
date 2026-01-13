import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r p-4">
      <div className="text-2xl font-bold text-teal-600 mb-6">
        eBoard
      </div>

      <nav className="space-y-2">
        <SidebarItem href="/main/student" label="Học sinh" />
        <SidebarItem href="/main/class" label="Lớp học" />
        <SidebarItem href="/main/setting" label="Cài đặt" />
      </nav>

      <div className="mt-10 p-4 border rounded-lg bg-orange-50 text-sm">
        💡 Mẹo nhỏ <br />
        Bạn có thể tạo nhiều lớp học và quản lý học sinh dễ dàng!
      </div>
    </aside>
  );
}

function SidebarItem({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 rounded-lg hover:bg-teal-50 text-gray-700"
    >
      {label}
    </Link>
  );
}
