"use client";

import { useEffect, useState } from "react";
import FundStats from "@/components/class/fund/FundStats";
import FundTabs from "@/components/class/fund/FundTabs";
import FundIncomeTable from "@/components/class/fund/FundIncomeTable";
import FundExpenseTable from "@/components/class/fund/FundExpenseTable";
import { fundService } from "@/services/fundService";
import { ClassFund, FundIncome, FundExpense } from "@/types/fund";
import { FileDown, Plus, Printer } from "lucide-react";
import Button from "@/components/ui/Button";
import AddFundIncomeModal from "@/components/class/fund/AddFundIncomeModal";
import { ClassInfo } from "@/types/Class";
import { classService } from "@/services/classService";
import AddFundExpenseModal from "@/components/class/fund/AddFundExpenseModal";
import {
  exportFundIncomeExcel,
  exportFundExpenseExcel,
  exportFundReportExcel,
} from "@/utils/exportFundExcel";
import FundReport from "@/components/class/fund/FundReport";
import FundReportPrintModal from "@/components/class/fund/FundReportPrintModal";
import { useRouter } from "next/navigation";
import { teacherSession } from "@/services/teacherSession";


export default function FundPage() {
  const router = useRouter();
  const [classId, setClassId] = useState<string | null>(null);

  const [classInfo, setClassInfo] = useState<ClassInfo>();
  const [fund, setFund] = useState<ClassFund>();
  const [tab, setTab] = useState<"income" | "expense" | "report">("income");
  const [page, setPage] = useState(1);

  const [incomes, setIncomes] = useState<FundIncome[]>([]);
  const [expenses, setExpenses] = useState<FundExpense[]>([]);

  const [openCreate, setOpenCreate] = useState(false);
  const [openCreateExpense, setOpenCreateExpense] = useState(false);
  const [openPrint, setOpenPrint] = useState(false);

  useEffect(() => {
    const teacherId = teacherSession.getTeacherId();

    if (!teacherId) {
      router.replace("/"); // hoặc /login
      return;
    }

    const savedClassId = localStorage.getItem(`selectedClassId_${teacherId}`);

    if (!savedClassId) {
      router.replace("/main/my-classes"); // chưa chọn lớp
      return;
    }

    setClassId(savedClassId);
  }, [router]);

  const handleCreateIncome = () => {
    setOpenCreate(true);
  };

  const handleCreateExpense = () => {
    setOpenCreateExpense(true);
  };

  const handlePrintReport = () => {
    setOpenPrint(true);
  };

  const handleExportExcel = () => {
  if (!classInfo) return;

  if (tab === "income") {
    exportFundIncomeExcel(incomes, {
      className: classInfo.name,
    });
  } 
  else if (tab === "expense") {
    exportFundExpenseExcel(expenses, {
      className: classInfo.name,
    });
  }
  else if (tab === "report") {
    exportFundReportExcel(incomes, expenses, {
      className: classInfo.name,
    });
  }
};

  useEffect(() => {
    if (!classId) return;
    classService.getClassInfoById(classId).then(setClassInfo);
  }, [classId]);

  useEffect(() => {
    if (!classId) return;
    fundService.getClassFund(classId).then(setFund);
  }, [classId]);

  useEffect(() => {
    if (!classId) return;
    if (tab === "income") {
      fundService
        .getIncomes(classId, page)
        .then(setIncomes)
        .catch(err => {
          if (err.response?.status === 404) {
            setIncomes([]);
            return;
          }
          throw err;
        });
    } else {
      fundService
        .getExpenses(classId, page)
        .then(setExpenses)
        .catch(err => {
          if (err.response?.status === 404) {
            setExpenses([]); // ⭐ QUAN TRỌNG
            return;
          }
          throw err;
        });
    }
  }, [classId, tab, page]);

  if (!classId) {
    return (
      <div className="p-6 text-gray-500">
        Đang tải lớp đã chọn...
      </div>
    );
  }

  if (!fund) return null;

  return (
    <div className="space-y-6">
      {/* ===== TITLE ===== */}
      <div>
        <h2 className="text-xl font-semibold">Quỹ lớp</h2>
        <p className="text-sm text-gray-400">
          Quản lý thu chi, theo dõi số dư và lịch sử giao dịch của quỹ lớp
        </p>
      </div>

      <FundStats data={fund} />

      <div className="flex justify-between items-center">
        <FundTabs tab={tab} onChange={setTab} />

        <div className="flex gap-2">
          {/* ===== CREATE INCOME ===== */}
          {tab === "income" && (
            <Button
              icon={Plus}
              variant="primary"
              className="rounded-xl"
              onClick={handleCreateIncome}
            >
              Tạo khoản thu
            </Button>
          )}

          <AddFundExpenseModal
            open={openCreateExpense}
            onClose={() => setOpenCreateExpense(false)}
            classId={classId}
            onSuccess={() => {
              fundService.getClassFund(classId).then(setFund);
              fundService.getExpenses(classId, page).then(setExpenses);
            }}
          />
          {tab === "expense" && (
            <Button
              icon={Plus}
              onClick={handleCreateExpense}
              variant="primary"
              className="rounded-xl"
            >
              Thêm khoản chi
            </Button>)}

          <AddFundIncomeModal
            open={openCreate}
            onClose={() => setOpenCreate(false)}
            classId={classId}
            onSuccess={() => {
              fundService.getClassFund(classId).then(setFund);
              fundService.getIncomes(classId, page).then(setIncomes);
            }}
          />

          {tab === "report" && (
            <Button
              icon={Printer}
              onClick={handlePrintReport}
              variant="primary"
              className="rounded-xl"
            >
              In báo cáo
            </Button>)}     

          <FundReportPrintModal
            open={openPrint}
            onClose={() => setOpenPrint(false)}
            incomes={incomes}
            expenses={expenses}
            classInfo={classInfo}
          />     

          {/* ===== EXPORT EXCEL ===== */}
          <Button
            icon={FileDown}
            variant="outline"
            onClick={handleExportExcel}
          >
            Xuất Excel
          </Button>
        </div>
      </div>

      {tab === "income" && (
        <FundIncomeTable
          data={incomes}
          page={page}
          onPageChange={setPage}
          classInfo={classInfo}
        />
      )}
      {tab === "expense" && (
        <FundExpenseTable
          data={expenses}
          page={page}
          onPageChange={setPage}
          classInfo={classInfo}
        />
      )}
      {tab === "report" && classInfo && (
        <FundReport
          incomes={incomes}
          expenses={expenses}
          page={page}
          onPageChange={setPage}
          classInfo={classInfo}
        />
      )}

    </div>
  );
}
