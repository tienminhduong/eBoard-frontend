import ClassTopNav from "@/components/class/ClassTopNav";

export default function ClassLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { classId: string };
}) {
  return (
    <div className="space-y-6">
      {/* TOP NAV */}
      <ClassTopNav classId={params.classId} />

      {/* PAGE CONTENT */}
      <div className="bg-transparent">
        {children}
      </div>
    </div>
  );
}
