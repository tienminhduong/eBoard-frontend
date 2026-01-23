"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { FormField } from "../ui/FormField";
import Input from "../ui/inputType/Input";
import Select from "../ui/inputType/Select";

import { addressService } from "@/services/addressService";
import type { ProvinceDto, WardDto } from "@/types/address";
import type { CreateStudentRequest, Option } from "@/types/Student";

interface Props {
  open: boolean;
  onClose: () => void;
  classId?: string;
  onSubmit?: (payload: CreateStudentRequest) => Promise<void> | void;
}

const GENDER_OPTIONS: Option[] = [
  { value: "Nam", label: "Nam" },
  { value: "Nữ", label: "Nữ" },
  { value: "Khác", label: "Khác" },
];

const RELATIONSHIP_OPTIONS: Option[] = [
  { value: "Ba", label: "Ba" },
  { value: "Mẹ", label: "Mẹ" },
  { value: "Người giám hộ", label: "Người giám hộ" },
  { value: "Khác", label: "Khác" },
];

import { getFromStorage } from "@/utils/storage";

const SELECTED_CLASS_ID_KEY = "selectedClassId";


export default function AddStudentModal({ open, onClose, onSubmit, classId }: Props) {
  const [mounted, setMounted] = useState(false);
  const [resolvedClassId, setResolvedClassId] = useState("");

  // Student
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  // Address (API-based)
  const [provinces, setProvinces] = useState<ProvinceDto[]>([]);
  const [wards, setWards] = useState<WardDto[]>([]);
  const [provinceCode, setProvinceCode] = useState(""); // dropdown value
  const [wardCode, setWardCode] = useState(""); // dropdown value
  const [street, setStreet] = useState("");

  const [addrLoading, setAddrLoading] = useState(false);
  const [addrError, setAddrError] = useState("");

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

  // ưu tiên props classId nếu có
  if (classId?.trim()) {
    setResolvedClassId(classId.trim());
    return;
  }

  // fallback: lấy theo key/prefix selectedClassId_<teacherId>
  const storedClassId = getFromStorage(SELECTED_CLASS_ID_KEY);
  setResolvedClassId(storedClassId);
}, [open, classId]);


  // load provinces when modal opens
  useEffect(() => {
    let mounted = true;
    if (!open) return;

    (async () => {
      try {
        setAddrLoading(true);
        setAddrError("");
        const res = await addressService.getProvinces();
        if (mounted) setProvinces(res || []);
      } catch (e: any) {
        if (mounted) setAddrError(e?.message ?? "Không tải được danh sách tỉnh/thành phố.");
      } finally {
        if (mounted) setAddrLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open]);

  // load wards when province changes
  useEffect(() => {
    let mounted = true;
    if (!open) return;

    (async () => {
      try {
        if (!provinceCode) {
          setWards([]);
          setWardCode("");
          return;
        }

        setAddrLoading(true);
        setAddrError("");
        const res = await addressService.getWardsByProvinceCode(provinceCode);

        if (!mounted) return;
        setWards(res || []);

        // reset ward if not exists
        const ok = (res || []).some((w) => String(w.code) === String(wardCode));
        if (!ok) setWardCode("");
      } catch (e: any) {
        if (mounted) setAddrError(e?.message ?? "Không tải được danh sách phường/xã.");
      } finally {
        if (mounted) setAddrLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, provinceCode]);

  const provinceOptions: Option[] = useMemo(
    () => provinces.map((p) => ({ value: String(p.code), label: p.name })),
    [provinces]
  );

  const wardOptions: Option[] = useMemo(
    () => wards.map((w) => ({ value: String(w.code), label: w.name })),
    [wards]
  );

  const provinceName = useMemo(() => {
    const p = provinces.find((x) => String(x.code) === String(provinceCode));
    return p?.name ?? "";
  }, [provinces, provinceCode]);

  const wardName = useMemo(() => {
    const w = wards.find((x) => String(x.code) === String(wardCode));
    return w?.name ?? "";
  }, [wards, wardCode]);

  if (!mounted) return null;

  function resetForm() {
    setFirstName("");
    setLastName("");
    setDob("");
    setGender("");

    setProvinceCode("");
    setWardCode("");
    setStreet("");

    setParentFullName("");
    setParentPhoneNumber("");
    setRelationshipWithParent("");
    setParentHealthCondition("");

    setAddrError("");
  }

  function buildFullAddress() {
    // ✅ district removed
    return [street.trim(), wardName, provinceName].filter(Boolean).join(", ");
  }

  async function handleSubmit() {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !dob ||
      !gender ||
      !provinceCode ||
      !wardCode ||
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

      // ✅ store names (clean for display/search). If you want store code instead, tell tao.
      province: provinceName,
      ward: wardName,
      address: buildFullAddress(),

      parentFullName: parentFullName.trim(),
      parentPhoneNumber: parentPhoneNumber.trim(),
      relationshipWithParent,
      classId: resolvedClassId,
    };

    await onSubmit?.(payload);
    resetForm();
  }

  return (
    <Modal open={open} onClose={onClose} title="Thêm học sinh mới">
      <div className="space-y-6 text-sm">
        {/* Student */}
        <div className="space-y-4">
          <div className="text-base font-semibold text-gray-900">Thông tin học sinh</div>
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
          <div className="text-base font-semibold text-gray-900">Địa chỉ</div>

          {addrError ? (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {addrError}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tỉnh/TP" required>
              <Select
                options={provinceOptions}
                value={provinceCode}
                onChange={(v: string) => {
                  setProvinceCode(v);
                  setWardCode("");
                }}
                placeholder={addrLoading ? "Đang tải..." : "Chọn tỉnh/TP"}
              />
            </FormField>

            <FormField label="Phường/Xã" required>
              <Select
                options={wardOptions}
                value={wardCode}
                onChange={setWardCode}
                placeholder={
                  !provinceCode ? "Chọn tỉnh trước" : addrLoading ? "Đang tải..." : "Chọn phường/xã"
                }
              />
            </FormField>
          </div>

          <FormField label="Số nhà, tên đường" required>
            <Input value={street} onChange={(e: any) => setStreet(e.target.value)} />
          </FormField>
        </div>

        {/* Parent */}
        <div className="space-y-4">
          <div className="text-base font-semibold text-gray-900">Thông tin phụ huynh</div>

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

          </div>

          {!resolvedClassId ? (
            <div className="text-xs text-red-600">Chưa có classId – hãy chọn lớp trước khi thêm học sinh</div>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
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
