"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { FormField } from "../ui/FormField";
import Input from "../ui/inputType/Input";
import Select from "../ui/inputType/Select";

interface Props {
  open: boolean;
  onClose: () => void;
  classId?: string;
  onSubmit?: (payload: CreateStudentRequest) => Promise<void> | void;
}

export type CreateStudentRequest = {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // yyyy-mm-dd
  address: string;
  province: string;
  district: string;
  ward: string;
  gender: string;
  parentPhoneNumber: string;
  relationshipWithParent: string;
  parentFullName: string;
  parentHealthCondition: string;
  classId: string;
};

const PROVINCE_OPTIONS = [
  { value: "HCMinh", label: "TP. Hồ Chí Minh" },
  { value: "Hà Nội", label: "Hà Nội" },
  { value: "Đà Nẵng", label: "Đà Nẵng" },
];

const DISTRICT_OPTIONS = [
  { value: "Q1", label: "Quận 1" },
  { value: "Q3", label: "Quận 3" },
  { value: "TP. Thủ Đức", label: "TP. Thủ Đức" },
];

const WARD_OPTIONS = [
  { value: "Phường 1", label: "Phường 1" },
  { value: "Phường 2", label: "Phường 2" },
  { value: "Phường 3", label: "Phường 3" },
];

const GENDER_OPTIONS = [
  { value: "Nam", label: "Nam" },
  { value: "Nữ", label: "Nữ" },
  { value: "Khác", label: "Khác" },
];

const RELATIONSHIP_OPTIONS = [
  { value: "Ba", label: "Ba" },
  { value: "Mẹ", label: "Mẹ" },
  { value: "Người giám hộ", label: "Người giám hộ" },
  { value: "Khác", label: "Khác" },
];

const SELECTED_CLASS_ID_KEY = "selectedClassId";

export default function AddStudentModal({
  open,
  onClose,
  onSubmit,
  classId,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [resolvedClassId, setResolvedClassId] = useState("");

  // Student
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  // Address
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [street, setStreet] = useState("");

  // Parent
  const [parentFullName, setParentFullName] = useState("");
  const [parentPhoneNumber, setParentPhoneNumber] = useState("");
  const [relationshipWithParent, setRelationshipWithParent] = useState("");
  const [parentHealthCondition, setParentHealthCondition] = useState("");

  // mount flag (fix hydration)
  useEffect(() => {
    setMounted(true);
  }, []);

  // resolve classId SAFELY (client only)
  useEffect(() => {
    if (!open) return;

    if (classId?.trim()) {
      setResolvedClassId(classId.trim());
      return;
    }

    const stored = localStorage.getItem(SELECTED_CLASS_ID_KEY) || "";
    setResolvedClassId(stored);
  }, [open, classId]);

  if (!mounted) return null;

  function resetForm() {
    setFirstName("");
    setLastName("");
    setDob("");
    setGender("");

    setProvince("");
    setDistrict("");
    setWard("");
    setStreet("");

    setParentFullName("");
    setParentPhoneNumber("");
    setRelationshipWithParent("");
    setParentHealthCondition("");
  }

  function buildFullAddress() {
    return [street.trim(), ward, district, province].filter(Boolean).join(", ");
  }

  async function handleSubmit() {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !dob ||
      !gender ||
      !province ||
      !district ||
      !ward ||
      !street.trim() ||
      !parentFullName.trim() ||
      !parentPhoneNumber.trim() ||
      !relationshipWithParent ||
      !resolvedClassId
    ) {
      return;
    }

    const payload: CreateStudentRequest = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dob,
      gender,
      province,
      district,
      ward,
      address: buildFullAddress(),
      parentFullName: parentFullName.trim(),
      parentPhoneNumber: parentPhoneNumber.trim(),
      relationshipWithParent,
      parentHealthCondition: parentHealthCondition.trim() || "N/A",
      classId: resolvedClassId,
    };

    await onSubmit?.(payload);
    resetForm();
  }

  return (
    <Modal open={open} onClose={onClose} title="Thêm học sinh mới">
      <div className="space-y-5">
        {/* Student */}
        <div className="space-y-4">
          <div className="text-sm font-semibold">Thông tin học sinh</div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Họ" required>
              <Input value={lastName} onChange={(e: any) => setLastName(e.target.value)} />
            </FormField>
            <FormField label="Tên" required>
              <Input value={firstName} onChange={(e: any) => setFirstName(e.target.value)} />
            </FormField>
            <FormField label="Ngày sinh" required>
              <Input type="date" value={dob} onChange={(e: any) => setDob(e.target.value)} />
            </FormField>
            <FormField label="Giới tính" required>
              <Select options={GENDER_OPTIONS} value={gender} onChange={setGender} />
            </FormField>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <div className="text-sm font-semibold">Địa chỉ</div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Tỉnh/TP" required>
              <Select options={PROVINCE_OPTIONS} value={province} onChange={setProvince} />
            </FormField>
            <FormField label="Quận/Huyện" required>
              <Select options={DISTRICT_OPTIONS} value={district} onChange={setDistrict} />
            </FormField>
            <FormField label="Phường/Xã" required>
              <Select options={WARD_OPTIONS} value={ward} onChange={setWard} />
            </FormField>
          </div>
          <FormField label="Số nhà, tên đường" required>
            <Input value={street} onChange={(e: any) => setStreet(e.target.value)} />
          </FormField>
        </div>

        {/* Parent */}
        <div className="space-y-4">
          <div className="text-sm font-semibold">Thông tin phụ huynh</div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Họ tên phụ huynh" required>
              <Input value={parentFullName} onChange={(e: any) => setParentFullName(e.target.value)} />
            </FormField>
            <FormField label="SĐT" required>
              <Input
                value={parentPhoneNumber}
                onChange={(e: any) =>
                  setParentPhoneNumber(String(e.target.value).replace(/\D/g, "").slice(0, 11))
                }
              />
            </FormField>
            <FormField label="Quan hệ" required>
              <Select
                options={RELATIONSHIP_OPTIONS}
                value={relationshipWithParent}
                onChange={setRelationshipWithParent}
              />
            </FormField>
            <FormField label="Tình trạng sức khỏe">
              <Input
                value={parentHealthCondition}
                onChange={(e: any) => setParentHealthCondition(e.target.value)}
              />
            </FormField>
          </div>

          {!resolvedClassId && (
            <div className="text-xs text-red-600">
              Chưa có classId – hãy chọn lớp trước khi thêm học sinh
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Lưu thông tin
          </Button>
        </div>
      </div>
    </Modal>
  );
}
