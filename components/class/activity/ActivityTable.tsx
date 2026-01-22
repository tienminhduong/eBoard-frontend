"use client";

import { ExtracurricularActivity } from "@/types/activity";
import Button from "@/components/ui/Button";
import { MapPin, Trash2, Eye } from "lucide-react";

interface Props {
  data: ExtracurricularActivity[];
  onDelete: (id: string) => void;
  onViewDetail: (id: string) => void;
}

export default function ActivityTable({
  data,
  onDelete,
  onViewDetail,
}: Props) {
  const hasData = data.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="p-4 text-left">Tên hoạt động</th>
            <th>Địa điểm</th>
            <th>Số lượng</th>
            <th>Người phụ trách</th>
            <th>Thời gian</th>
            <th>Hạn đăng ký</th>
            <th>Chi phí</th>
            <th className="text-center w-[160px]">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {hasData ? (
            data.map(a => (
              <tr
                key={a.id}
                className="border-t hover:bg-gray-50 transition text-center"
              >
                <td className="p-4 text-left font-medium">
                  {a.name}
                </td>

                <td className="flex items-center gap-1 justify-center">
                  <MapPin size={14} />
                  {a.location}
                </td>

                <td className="text-[#518581]">
                  {a.participants.length}/{a.maxParticipants}
                </td>

                <td>{a.inChargeTeacher}</td>

                <td>
                  BD: {new Date(a.startTime).toLocaleString()}
                  <br />
                  KT: {new Date(a.endTime).toLocaleString()}
                </td>

                <td>
                  {new Date(a.assignDeadline).toLocaleString()}
                </td>

                <td>{a.cost.toLocaleString()}đ</td>

                {/* CỘT THAO TÁC */}
                <td className="space-x-2 justify-center flex">
                  <Button
                    icon={Eye}
                    variant="outline"
                    onClick={() => onViewDetail(a.id)}
                  >
                    <span className="sr-only">Xem chi tiết</span>
                  </Button>

                  <Button
                    icon={Trash2}
                    variant="outline"
                    onClick={() => onDelete(a.id)}
                  >
                    <span className="sr-only">Xóa</span>
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={8}
                className="h-32 text-center text-gray-400 bg-gray-50"
              >
                Chưa có hoạt động
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
