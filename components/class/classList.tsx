"use client";

import { useEffect, useState } from "react";
import { getMyClasses } from "@/services/classService";
import { Class } from "@/types/Class";
import ClassCard from "./classCard";

export default function ClassList() {
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    getMyClasses().then(setClasses);
  }, []);

  return (
    <div className="flex gap-6">
      {classes.map((cls) => (
        <ClassCard key={cls.id} />
      ))}
    </div>
  );
}
