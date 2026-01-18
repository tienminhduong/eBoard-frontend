interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      {/* Prev */}
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1 border rounded disabled:opacity-40"
      >
        Trước
      </button>

      {/* Page numbers */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1 border rounded
            ${
              p === page
                ? "bg-[#518581] text-white border-[#518581]"
                : "hover:bg-gray-100"
            }`}
        >
          {p}
        </button>
      ))}

      {/* Next */}
      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1 border rounded disabled:opacity-40"
      >
        Sau
      </button>
    </div>
  );
}
