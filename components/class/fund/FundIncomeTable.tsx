"use client";

import { FundIncome } from "@/types/fund";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import { Pencil, ChevronRight, Trash2 } from "lucide-react";
import FundIncomeDetailModal from "./FundIncomeDetailModal";
import { useState } from "react";
import { ClassInfo } from "@/types/Class";
import EditFundIncomeModal from "./EditFundIncomeModal";

interface Props {
  data: FundIncome[];
  page: number;
  onPageChange: (p: number) => void;
  onEdit?: (id: string) => void;
  onDetail?: (id: string) => void;
  onDelete?: (id: string) => void;
  classInfo?: ClassInfo;
}

export default function FundIncomeTable({
  data,
  page,
  onPageChange,
  onEdit,
  onDetail,
  classInfo,
}: Props) {
  const hasData = data.length > 0;

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedIncomeId, setSelectedIncomeId] = useState<string>();
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState<string>();

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        {/* ===== HEADER ===== */}
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="p-4 text-left">Nội dung</th>
            <th className="text-center">Cần thu</th>
            <th className="text-center">Đã thu</th>
            <th className="text-center">Bắt đầu</th>
            <th className="text-center">Kết thúc</th>
            <th className="text-center">Trạng thái</th>
            <th className="text-center">Thao tác</th>
          </tr>
        </thead>

        {/* ===== BODY ===== */}
        <tbody>
          {hasData ? (
            data.map((i) => (
              <tr
                key={i.id}
                className="border-t text-center hover:bg-gray-50 transition"
              >
                <td className="p-4 text-left">{i.title}</td>
                <td>{i.expectedAmount.toLocaleString()}đ</td>
                <td>{i.collectedAmount.toLocaleString()}đ</td>
                <td>{i.startDate}</td>
                <td>{i.endDate}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium
                      ${
                        i.status === "Hoàn thành"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {i.status}
                  </span>
                </td>
                <td>
                    <div className="flex justify-center gap-2">
                        {/* ===== EDIT ===== */}
                        <Button
                          icon={Pencil}
                          onClick={() => {
                            setEditId(i.id);
                            setOpenEdit(true);
                          }}
                        >
                          <span className="sr-only">Sửa</span>
                        </Button>

                        {/* ===== DETAIL ===== */}
                        <Button
                          icon={ChevronRight}
                          onClick={() => {
                            setSelectedIncomeId(i.id);
                            setSelectedTitle(i.title); // ⭐ lưu title
                            setOpenDetail(true);
                          }}
                        >
                          <span className="sr-only">Xem chi tiết</span>
                        </Button>
                    </div>
                    </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={7}
                className="
                  h-32
                  text-center
                  align-middle
                  text-gray-400
                  bg-gray-50
                "
              >
                Chưa có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <FundIncomeDetailModal
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        fundIncomeId={selectedIncomeId}
        title={selectedTitle}
        classInfo={classInfo}
      />

      <EditFundIncomeModal
        open={openEdit}
        fundIncomeId={editId}
        onClose={() => setOpenEdit(false)}
        onSuccess={() => onPageChange(page)} // reload list
      />

      {/* ===== PAGINATION ===== */}
      <Pagination page={page} totalPages={1} onChange={onPageChange} />
    </div>
  );
}
