"use client";

import { InputHTMLAttributes } from "react";

export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      value={props.value ?? ""}
      className={`
        w-full rounded-xl border px-3 py-2 text-sm
        focus:outline-none focus:ring-2 focus:ring-[#518581]/40
        ${props.className || ""}
      `}
    />
  );
}
