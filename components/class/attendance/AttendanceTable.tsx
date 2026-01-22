"use client";

import { AttendanceRecord, AttendanceStatus } from "@/types/attendance";

interface Props {
  data: AttendanceRecord[];
  onChange: (next: AttendanceRecord[]) => void;
  date: string;
  pickupPeople: string[];
}

const STATUS_OPTIONS: AttendanceStatus[] = [
  "Có mặt",
  "Vắng không phép",
  "Vắng có phép",
];

export default function AttendanceTable({
  data,
  onChange,
  date,
  pickupPeople,
}: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const isPastDate = date < today;

  const update = (id: string, patch: Partial<AttendanceRecord>) => {
    onChange(data.map(a => (a.id === id ? { ...a, ...patch } : a)));
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3">STT</th>
            <th className="p-3 text-left">Học sinh</th>
            <th className="p-3">Tình trạng</th>
            <th className="p-3">Lý do vắng</th>
            <th className="p-3">Người đưa đón</th>
            <th className="p-3">Ghi chú</th>
          </tr>
        </thead>

        <tbody>
          {data.map((s, i) => {
            const isPresent = s.status === "Có mặt";
            const isExcused = s.status === "Vắng có phép";
            const isOtherPickup =
              s.pickupPerson &&
              !pickupPeople.includes(s.pickupPerson);

            return (
              <tr key={s.id} className="border-t">
                <td className="p-3 text-center">{i + 1}</td>
                <td className="p-3 font-medium">{s.studentName}</td>

                <td className="p-3">
                  <select
                    value={s.status}
                    disabled={isPastDate}
                    onChange={e =>
                      update(s.id, {
                        status: e.target.value as AttendanceStatus,
                        absenceReason: "",
                        pickupPerson: "",
                      })
                    }
                    className="border rounded px-2 py-1 w-full"
                  >
                    {STATUS_OPTIONS.map(o => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </td>

                <td className="p-3">
                  <input
                    value={s.absenceReason || ""}
                    disabled={!isExcused || isPastDate}
                    onChange={e =>
                      update(s.id, { absenceReason: e.target.value })
                    }
                    className="border rounded px-2 py-1 w-full"
                  />
                </td>

                <td className="p-3">
                  {isPresent && !isPastDate ? (
                    <>
                      <select
                        value={isOtherPickup ? "OTHER" : s.pickupPerson || ""}
                        onChange={e => {
                          const val = e.target.value;

                          update(s.id, {
                            pickupPerson: val === "OTHER" ? "" : val,
                          });
                        }}
                        className="border rounded px-2 py-1 w-full"
                      >
                        <option value="">-- Chọn --</option>

                        {pickupPeople.map(p => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}

                        <option value="OTHER">Khác</option>
                      </select>

                      {/* TEXTBOX HIỆN KHI CHỌN KHÁC */}
                      {isOtherPickup && (
                        <input
                          className="border mt-1 px-2 py-1 w-full"
                          placeholder="Nhập tên người đưa đón"
                          value={s.pickupPerson || ""}
                          onChange={e =>
                            update(s.id, {
                              pickupPerson: e.target.value,
                            })
                          }
                        />
                      )}
                    </>
                  ) : (
                    <input disabled className="border w-full" />
                  )}
                </td>


                <td className="p-3">
                  <input
                    value={s.notes || ""}
                    disabled={isPastDate}
                    onChange={e =>
                      update(s.id, { notes: e.target.value })
                    }
                    className="border rounded px-2 py-1 w-full"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
