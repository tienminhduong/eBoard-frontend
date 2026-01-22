"use client";

import Input from "@/components/ui/inputType/Input";
import { Search } from "lucide-react";

interface Props {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Tìm kiếm hoạt động theo tên, địa điểm...",
}: Props) {
  return (
    <div className="relative w-96">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
