"use client";

import { useState } from "react";
import Input from "@/components/ui/inputType/Input";
import Button from "@/components/ui/Button";

export interface Option<T extends string | number | boolean  = string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string | number | boolean = string> {
  label?: string;
  required?: boolean;
  options: Option<T>[];
  value?: T;
  onChange?: (value: T) => void;

  placeholder?: string;

  allowCreate?: boolean;
  onCreate?: (label: string) => void;
}

export default function Select<T extends string | number | boolean = string>({
  label,
  required,
  options,
  value,
  onChange,
  placeholder = "Chọn",
  allowCreate = false,
  onCreate,
}: SelectProps<T>) {
  const [creating, setCreating] = useState(false);
  const [newValue, setNewValue] = useState("");

  const hasValue = value !== undefined && value !== null && String(value).trim() !== "";
  const hasValueInOptions = options.some(
    (opt) => String(opt.value) === String(value)
  );

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {!creating ? (
        <select
          value={value !== undefined ? String(value) : ""}
          onChange={(e) => {
            if (e.target.value === "__create__") {
              setCreating(true);
              return;
            }
            const selected = options.find(
              (opt) => String(opt.value) === e.target.value
            );

            if (selected) {
              onChange?.(selected.value);
            }
          }}
          className="w-full rounded-xl border px-3 py-2 text-sm bg-white
                     focus:outline-none focus:ring-2 focus:ring-[#518581]/40"
        >
          {/* placeholder */}
          <option value="" disabled hidden>
            {`-- ${placeholder} --`}
          </option>

          {allowCreate && (
            <option value="__create__" className="font-semibold">+ Thêm mới</option>
          )}

          {hasValue && !hasValueInOptions && (
            <option value={String(value)}>
              {String(value)}
            </option>
          )}

          {options.map((opt) => (
            <option
              key={String(opt.value)}
              value={String(opt.value)}
            >
              {opt.label}
            </option>
          ))}

        </select>
      ) : (
        <div className="flex gap-2 items-center flex-nowrap">
          <Input
            autoFocus
            placeholder="Nhập giá trị mới"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="flex-1 min-w-0"  
          />

          <Button
            variant="primary"
            className="shrink-0 px-3 py-2"
            onClick={() => {
              if (!newValue.trim()) return;
              onCreate?.(newValue.trim());
              setCreating(false);
              setNewValue("");
            }}
          >
            Xác nhận
          </Button>

          <Button
            variant="ghost"
            className="shrink-0 px-3 py-2"
            onClick={() => {
              setCreating(false);
              setNewValue("");
            }}
          >
            Hủy
          </Button>
        </div>
      )}
    </div>
  );
}
