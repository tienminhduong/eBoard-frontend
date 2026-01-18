export function getWeekDays(baseDate: Date) {
  const result = [];

  const date = new Date(baseDate);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Thứ 2
  date.setDate(date.getDate() + diff);

  for (let i = 0; i < 5; i++) {
    const d = new Date(date);
    d.setDate(date.getDate() + i);

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();

    result.push({
      day: `Thứ ${i + 2}`,
      date: `${dd}/${mm}`,       // dd/mm cho hiển thị
      full: `${yyyy}-${mm}-${dd}` // ISO cho logic
    });
  }

  return result;
}
