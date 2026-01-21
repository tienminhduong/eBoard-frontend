import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TimetableItem } from "@/types/timetable";
import { subjectColor } from "@/utils/subjectColor";

interface Props {
  item: TimetableItem;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TimetableCard({
  item,
  onEdit,
  onDelete,
}: Props) {
  const color = subjectColor[item.subject];
  const [openMenu, setOpenMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 👉 click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        cardRef.current &&
        !cardRef.current.contains(e.target as Node)
      ) {
        setOpenMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onEdit}
      className="relative h-full w-full p-3 space-y-1 rounded-2xl cursor-pointer transition hover:shadow-sm border-2"
      style={{
        backgroundColor: color.bg,
        borderColor: `${color.text}15`,
      }}
    >
      <div className="flex justify-between items-start">
        <span
          className="font-bold text-base"
          style={{ color: color.text }}
        >
          {item.subject}
        </span>

        {/* More button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // không trigger card click cell
            setOpenMenu(!openMenu);
          }}
        >
          <MoreVertical size={16} className="cursor-pointer text-gray-500 hover:text-gray-700" />
        </button>
      </div>

      <p className="text-sm text-gray-700">
        <span className="font-medium">GV:</span>{" "}
        {item.teacher?.trim() ? (
          <span className="font-medium text-gray-700">
            {item.teacher}
          </span>
        ) : (
          <span className="font-normal text-gray-400 italic">
            Chưa có thông tin
          </span>
        )}
      </p>

      {item.content && (
        <p className="text-xs italic text-gray-600">
          {item.content}
        </p>
      )}

      {/* Dropdown menu */}
      {openMenu && (
        <div
          className="absolute right-2 top-8 z-50 w-36 rounded-lg bg-white shadow-lg border"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setOpenMenu(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
          >
            <Pencil size={14} />
            Chỉnh sửa
          </button>

          <button
            onClick={() => {
              setOpenMenu(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} />
            Xóa
          </button>
        </div>
      )}
    </div>
  );
}
