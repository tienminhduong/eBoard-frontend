"use client";

import { FundExpense } from "@/types/fund";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import { Pencil, ChevronRight } from "lucide-react";
import { ClassInfo } from "@/types/Class";
import { useState } from "react";
import EditFundExpenseModal from "./EditFundExpenseModal";

interface Props {
  data: FundExpense[];
  page: number;
  onPageChange: (p: number) => void;
  onEdit?: (id: string) => void;
  onDetail?: (id: string) => void;
  classInfo?: ClassInfo;
}

export default function FundExpenseTable({
  data,
  page,
  onPageChange,
  onEdit,
  onDetail,
}: Props) {
  const hasData = data.length > 0;
  const [openEdit, setOpenEdit] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState<string>();

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        {/* ===== HEADER ===== */}
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="p-4 text-left">Nội dung</th>
            <th className="text-center">Số tiền</th>
            <th className="text-center">Người chi</th>
            <th className="text-center">Ngày</th>
            <th className="text-center">Thao tác</th>
          </tr>
        </thead>

        {/* ===== BODY ===== */}
        <tbody>
          {hasData ? (
            data.map((e) => (
              <tr
                key={e.id}
                className="border-t text-center hover:bg-gray-50 transition"
              >
                <td className="p-4 text-left">{e.title}</td>
                <td>{e.amount.toLocaleString()}đ</td>
                <td>{e.spenderName}</td>
                <td>{e.expenseDate}</td>

                {/* ===== ACTION ===== */}
                <td>
                  <div className="flex justify-center gap-2">
                    {/* EDIT */}
                    <Button
                      icon={Pencil}
                      onClick={() => {
                        setEditExpenseId(e.id);
                        setOpenEdit(true);
                      }}
                    >
                      <span className="sr-only">Sửa</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr key="no-data">
              <td
                colSpan={5}
                className="h-32 text-center text-gray-400 bg-gray-50"
              >
                Chưa có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <EditFundExpenseModal
        open={openEdit}
        expenseId={editExpenseId}
        onClose={() => setOpenEdit(false)}
        onSuccess={() => onPageChange(page)} // reload list
      />


      {/* ===== PAGINATION ===== */}
      <Pagination page={page} totalPages={1} onChange={onPageChange} />
    </div>
  );
}
