import api from "@/lib/api";
import {
  ClassFund,
  FundIncome,
  FundExpense,
  FundIncomeStudent,
  FundIncomeDetailDto,
  UpdateFundIncomePayload,
} from "@/types/fund";

/* ===== DTO TYPES ===== */
export interface CreateFundIncomePayload {
  title: string;
  amountPerStudent: number;
  endDate: string; // yyyy-MM-dd
  description: string;
}

export interface CreateFundExpensePayload {
  title: string;
  amount: number;
  spenderName: string;
  expenseDate: string;
  invoiceImgUrl?: string;
  notes?: string;
}

export const fundService = {
  /* ===== FUND ===== */
  getClassFund(classId: string) {
    return api.get<ClassFund>(`/funds/${classId}`).then(res => res.data);
  },

  /* ===== INCOME ===== */
  getIncomes(classId: string, page = 1, pageSize = 20) {
    return api
      .get<FundIncome[]>(`/funds/${classId}/income`, {
        params: { pageNumber: page, pageSize },
      })
      .then(res => res.data);
  },

  createIncome(classId: string, payload: CreateFundIncomePayload) {
    return api.post(`/funds/${classId}/income`, payload);
  },

  getIncomeDetailsByIncomeId(incomeId: string) {
    return api
      .get(`/funds/income/${incomeId}/details`)
      .then(res => res.data);
  },

  getIncomeDetailsByStudent(incomeId: string, studentId: string) {
    return api
      .get<FundIncomeDetailDto[]>(
        `/funds/income/${incomeId}/details/${studentId}`
      )
      .then(res =>
        res.data.map(i => ({
          id: i.id,                       // ✅ ID thật từ BE
          content: i.contributedInfo,
          amount: i.contributedAmount,
          contributedAt: i.contributedAt,
          notes: i.notes,
        }))
      );
  },

  updateIncomeDetail(detailId: string, payload: {
    contributedAmount: number;
    contributedAt: string;
    notes?: string;
  }) {
    return api.put(`/funds/income-details/${detailId}`, payload);
  },

  getIncomeByStudent(studentId: string) {
    return api
      .get(`/funds/income/${studentId}`)
      .then(res => res.data);
  },

  getIncomeById(fundIncomeId: string) {
  return api
    .get<FundIncome>(`/funds/incomes/${fundIncomeId}`)
    .then(res => res.data);
},

updateIncome(fundIncomeId: string, payload: UpdateFundIncomePayload) {
  return api.put(`/funds/incomes/${fundIncomeId}`, payload);
},

getIncomeDetailById(detailId: string) {
  return api
    .get<FundIncomeDetailDto>(`/funds/income/${detailId}/details`)
    .then(res => ({
      id: res.data.id,
      content: res.data.contributedInfo,
      amount: res.data.contributedAmount,
      contributedAt: res.data.contributedAt,
      notes: res.data.notes,
    }));
},

getIncomeDetailsByClassAndStudent(classId: string, studentId: string) {
  return api
    .get<FundIncomeDetailDto[]>(
      `/funds/classes/${classId}/students/${studentId}/income-details`
    )
    .then(res =>
      res.data.map(i => ({
        id: i.id,
        content: i.contributedInfo,
        amount: i.contributedAmount,
        contributedAt: i.contributedAt,
        notes: i.notes,
      }))
    );
},

  /* ===== EXPENSE ===== */
  getExpenses(classId: string, page = 1, pageSize = 20) {
    return api
      .get<FundExpense[]>(`/funds/${classId}/expenses`, {
        params: { pageNumber: page, pageSize },
      })
      .then(res => res.data);
  },

  createExpense(classId: string, payload: CreateFundExpensePayload) {
    return api.post(`/funds/${classId}/expenses`, payload);
  },

  /* ===== SUMMARY ===== */
  getIncomeSummary(fundIncomeId: string) {
    return api
      .get(`/funds/${fundIncomeId}/summary`)
      .then(res => res.data);
  },

  /* ===== CONTRIBUTION ===== */
  contributeIncome(fundIncomeId: string, payload: any) {
    return api.post(`/funds/contributions/${fundIncomeId}`, payload);
  },

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return api
      .post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(res => res.data); // => { url: string }
  },

  getExpenseById(expenseId: string) {
    return api
      .get<FundExpense>(`/funds/expenses/${expenseId}`)
      .then(res => res.data);
  },

  updateExpense(expenseId: string, payload: {
    title: string;
    amount: number;
    spenderName: string;
    expenseDate: string;
    notes?: string;
  }) {
    return api.put(`/funds/expenses/${expenseId}`, payload);
  },


};
