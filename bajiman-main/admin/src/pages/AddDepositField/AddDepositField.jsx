import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  FaListAlt,
  FaPlus,
  FaSave,
  FaSyncAlt,
  FaImage,
  FaTrash,
} from "react-icons/fa";
import { api } from "../../api/axios";

const emptyBi = { bn: "", en: "" };

const defaultInput = () => ({
  key: "",
  label: { ...emptyBi },
  placeholder: { ...emptyBi },
  type: "text",
  required: true,
  minLength: 0,
  maxLength: 0,
});

const sectionCard =
  "rounded-2xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/20 to-black shadow-lg shadow-blue-900/20";

const inputBase =
  "w-full h-11 rounded-xl border border-blue-300/20 bg-black/40 px-4 text-white placeholder-blue-100/40 outline-none transition-all focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/20";

const textAreaBase =
  "w-full min-h-[110px] rounded-xl border border-blue-300/20 bg-black/40 px-4 py-3 text-white placeholder-blue-100/40 outline-none transition-all focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/20";

const labelCls = "mb-2 block text-sm font-medium text-blue-100";

const btnBase =
  "cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60";

const btnPrimary = `${btnBase} bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white hover:from-[#7bb7f1] hover:to-[#3b88db] shadow-lg shadow-blue-700/30`;

const btnGhost = `${btnBase} border border-blue-300/20 bg-black/30 text-blue-100 hover:bg-blue-900/20`;

const btnDanger = `${btnBase} border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20`;

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
};

const BiInput = ({
  title,
  value,
  onChangeBn,
  onChangeEn,
  bnPlaceholder,
  enPlaceholder,
}) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div>
      <label className={labelCls}>{title} (BN)</label>
      <input
        className={inputBase}
        value={value?.bn || ""}
        onChange={(e) => onChangeBn(e.target.value)}
        placeholder={bnPlaceholder}
      />
    </div>

    <div>
      <label className={labelCls}>{title} (EN)</label>
      <input
        className={inputBase}
        value={value?.en || ""}
        onChange={(e) => onChangeEn(e.target.value)}
        placeholder={enPlaceholder}
      />
    </div>
  </div>
);

const AddDepositField = () => {
  const qc = useQueryClient();

  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [instructions, setInstructions] = useState({ bn: "", en: "" });
  const [inputs, setInputs] = useState([defaultInput()]);
  const [saving, setSaving] = useState(false);

  const {
    data: methodsRes = {},
    isLoading: methodsLoading,
    refetch: refetchMethods,
  } = useQuery({
    queryKey: ["deposit-methods"],
    queryFn: async () => {
      const res = await api.get("/api/deposit-methods");
      return res.data;
    },
  });

  const methods = useMemo(() => methodsRes?.data || [], [methodsRes]);

  const selectedMethod = useMemo(
    () => methods.find((m) => m._id === selectedMethodId) || null,
    [methods, selectedMethodId],
  );

  const {
    data: fieldRes,
    refetch: refetchField,
    isFetching,
  } = useQuery({
    queryKey: ["deposit-field-config", selectedMethodId],
    queryFn: async () => {
      const res = await api.get(
        `/api/deposit-fields/method/${selectedMethodId}`,
      );
      return res.data;
    },
    enabled: !!selectedMethodId,
  });

  useEffect(() => {
    const data = fieldRes?.data;

    if (!selectedMethodId) {
      setInstructions({ bn: "", en: "" });
      setInputs([defaultInput()]);
      return;
    }

    if (!data) {
      setInstructions({ bn: "", en: "" });
      setInputs([defaultInput()]);
      return;
    }

    setInstructions(data.instructions || { bn: "", en: "" });
    setInputs(data.inputs?.length ? data.inputs : [defaultInput()]);
  }, [fieldRes, selectedMethodId]);

  const patchInput = (idx, key, value) => {
    setInputs((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)),
    );
  };

  const patchInputBi = (idx, fieldKey, lang, value) => {
    setInputs((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              [fieldKey]: {
                ...(item[fieldKey] || emptyBi),
                [lang]: value,
              },
            }
          : item,
      ),
    );
  };

  const validateBeforeSave = () => {
    if (!selectedMethodId) return "আগে deposit method select করো";

    if (!instructions.bn?.trim() && !instructions.en?.trim()) {
      return "Instruction BN অথবা EN অন্তত একটা দিতে হবে";
    }

    if (!inputs.length) return "কমপক্ষে ১টা input field লাগবে";

    const keys = new Set();

    for (const input of inputs) {
      const key = String(input.key || "").trim();

      if (!key) return "সব input field এর key লাগবে";

      if (keys.has(key)) return `Duplicate key পাওয়া গেছে: ${key}`;

      keys.add(key);

      if (!input.label?.bn?.trim() || !input.label?.en?.trim()) {
        return `Field "${key}" এর label BN / EN দুটোই লাগবে`;
      }

      if (!["text", "number", "tel"].includes(input.type)) {
        return `Field "${key}" এর type invalid`;
      }

      const minLength = Number(input.minLength || 0);
      const maxLength = Number(input.maxLength || 0);

      if (minLength < 0 || maxLength < 0) {
        return `Field "${key}" এর min/max length 0 এর কম হতে পারবে না`;
      }

      if (maxLength > 0 && minLength > maxLength) {
        return `Field "${key}" এর minLength maxLength এর চেয়ে বেশি হতে পারবে না`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    const errorMessage = validateBeforeSave();

    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        depositMethod: selectedMethodId,
        instructions,
        inputs: inputs.map((item) => ({
          key: String(item.key || "").trim(),
          label: item.label || { bn: "", en: "" },
          placeholder: item.placeholder || { bn: "", en: "" },
          type: item.type || "text",
          required: item.required !== false,
          minLength: Number(item.minLength || 0),
          maxLength: Number(item.maxLength || 0),
        })),
      };

      const res = await api.post("/api/deposit-fields", payload);

      toast.success(res?.data?.message || "Deposit field config saved");

      await qc.invalidateQueries({
        queryKey: ["deposit-field-config", selectedMethodId],
      });

      await refetchField();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    await refetchMethods();

    if (selectedMethodId) {
      await refetchField();
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-500/40">
                <FaListAlt className="text-3xl text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">
                  Add Deposit Field
                </h1>
                <p className="text-sm text-blue-100/80">
                  Deposit method অনুযায়ী user form fields এবং instruction manage
                  করো
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                className={btnGhost}
              >
                <span className="flex items-center gap-2">
                  <FaSyncAlt />
                  Refresh
                </span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !selectedMethodId}
                className={btnPrimary}
              >
                <span className="flex items-center gap-2">
                  <FaSave />
                  {saving ? "Saving..." : "Save Field Config"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">
              Select Deposit Method
            </h2>
            <p className="mt-1 text-sm text-blue-100/70">
              আগে method select করো, তারপর field configure করো
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className={labelCls}>Deposit Method</label>
              <select
                value={selectedMethodId}
                onChange={(e) => setSelectedMethodId(e.target.value)}
                className={inputBase}
              >
                <option value="">Select Deposit Method</option>
                {methods.map((method) => (
                  <option key={method._id} value={method._id}>
                    {method.methodName?.bn ||
                      method.methodName?.en ||
                      method.methodId}{" "}
                    — {method.methodId}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-blue-300/20 bg-black/30 p-4">
              <p className="text-sm font-semibold text-blue-100">
                Selected Method
              </p>

              {selectedMethod ? (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-blue-300/20 bg-black/50">
                    {selectedMethod.logoUrl ? (
                      <img
                        src={getImageUrl(selectedMethod.logoUrl)}
                        alt={selectedMethod.methodId}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <FaImage className="text-2xl text-blue-200/60" />
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-white">
                      {selectedMethod.methodName?.bn ||
                        selectedMethod.methodName?.en ||
                        selectedMethod.methodId}
                    </p>
                    <p className="text-xs text-blue-100/70">
                      {selectedMethod.methodType} / {selectedMethod.methodId}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-blue-100/60">
                  কোনো method select করা হয়নি
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Instructions</h2>
            <p className="mt-1 text-sm text-blue-100/70">
              User deposit page এ এই instruction show করবে
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={labelCls}>Instruction (BN)</label>
              <textarea
                className={textAreaBase}
                value={instructions.bn || ""}
                onChange={(e) =>
                  setInstructions((prev) => ({
                    ...prev,
                    bn: e.target.value,
                  }))
                }
                placeholder="যেমন: সেন্ড মানি করে Transaction ID দিন"
              />
            </div>

            <div>
              <label className={labelCls}>Instruction (EN)</label>
              <textarea
                className={textAreaBase}
                value={instructions.en || ""}
                onChange={(e) =>
                  setInstructions((prev) => ({
                    ...prev,
                    en: e.target.value,
                  }))
                }
                placeholder="e.g. Send money and enter Transaction ID"
              />
            </div>
          </div>
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Input Fields</h2>
              <p className="mt-1 text-sm text-blue-100/70">
                User থেকে কোন কোন তথ্য নিবে সেটা এখানে set করো
              </p>
            </div>

            <button
              type="button"
              onClick={() => setInputs((prev) => [...prev, defaultInput()])}
              className={btnGhost}
            >
              <span className="flex items-center gap-2">
                <FaPlus />
                Add Field
              </span>
            </button>
          </div>

          {!selectedMethodId ? (
            <div className="rounded-2xl border border-dashed border-blue-300/20 bg-black/20 p-10 text-center text-blue-100/70">
              আগে deposit method select করো
            </div>
          ) : isFetching || methodsLoading ? (
            <div className="rounded-2xl border border-blue-300/20 bg-black/20 p-10 text-center text-blue-100/70">
              Loading field config...
            </div>
          ) : (
            <div className="space-y-5">
              {inputs.map((input, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-blue-300/20 bg-gradient-to-br from-black/80 to-[#2f79c9]/10 p-4"
                >
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-bold text-blue-100">
                      Field #{idx + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        setInputs((prev) => prev.filter((_, i) => i !== idx))
                      }
                      disabled={inputs.length === 1}
                      className={btnDanger}
                    >
                      <span className="flex items-center gap-2">
                        <FaTrash />
                        Remove
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <div>
                      <label className={labelCls}>Field Key</label>
                      <input
                        className={inputBase}
                        value={input.key || ""}
                        onChange={(e) =>
                          patchInput(
                            idx,
                            "key",
                            e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "_")
                              .replace(/[^a-z0-9_]/g, ""),
                          )
                        }
                        placeholder="transaction_id"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Type</label>
                      <select
                        className={inputBase}
                        value={input.type || "text"}
                        onChange={(e) =>
                          patchInput(idx, "type", e.target.value)
                        }
                      >
                        <option value="text">text</option>
                        <option value="number">number</option>
                        <option value="tel">tel</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={input.required !== false}
                          onChange={(e) =>
                            patchInput(idx, "required", e.target.checked)
                          }
                          className="h-5 w-5 cursor-pointer accent-[#63a8ee]"
                        />
                        <span className="font-medium text-blue-100">
                          Required
                        </span>
                      </label>
                    </div>

                    <div className="lg:col-span-3">
                      <BiInput
                        title="Label"
                        value={input.label}
                        bnPlaceholder="যেমন: ট্রানজেকশন আইডি"
                        enPlaceholder="e.g. Transaction ID"
                        onChangeBn={(value) =>
                          patchInputBi(idx, "label", "bn", value)
                        }
                        onChangeEn={(value) =>
                          patchInputBi(idx, "label", "en", value)
                        }
                      />
                    </div>

                    <div className="lg:col-span-3">
                      <BiInput
                        title="Placeholder"
                        value={input.placeholder}
                        bnPlaceholder="যেমন: ট্রানজেকশন আইডি লিখুন"
                        enPlaceholder="e.g. Enter transaction ID"
                        onChangeBn={(value) =>
                          patchInputBi(idx, "placeholder", "bn", value)
                        }
                        onChangeEn={(value) =>
                          patchInputBi(idx, "placeholder", "en", value)
                        }
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Min Length</label>
                      <input
                        type="number"
                        min="0"
                        className={inputBase}
                        value={Number(input.minLength || 0)}
                        onChange={(e) =>
                          patchInput(
                            idx,
                            "minLength",
                            Number(e.target.value || 0),
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Max Length</label>
                      <input
                        type="number"
                        min="0"
                        className={inputBase}
                        value={Number(input.maxLength || 0)}
                        onChange={(e) =>
                          patchInput(
                            idx,
                            "maxLength",
                            Number(e.target.value || 0),
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !selectedMethodId}
              className={btnPrimary}
            >
              <span className="flex items-center gap-2">
                <FaSave />
                {saving ? "Saving..." : "Save Field Config"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDepositField;
