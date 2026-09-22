import React, { useEffect, useMemo, useState } from "react";
import {
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  X,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const emptyBi = { bn: "", en: "" };

const defaultField = () => ({
  key: "",
  label: { ...emptyBi },
  placeholder: { ...emptyBi },
  type: "text",
  required: true,
});

const API_URL = import.meta.env.VITE_API_URL || "";

const cardCls =
  "rounded-[28px] border border-[#1A79D3]/20 bg-white/[0.07] shadow-2xl shadow-black/50 backdrop-blur-xl";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#1A79D3]/60 focus:shadow-[0_0_25px_rgba(26,121,211,0.20)]";

const btnPrimary =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3 text-sm font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.25)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60";

const btnGhost =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-5 py-3 text-sm font-bold text-slate-100 transition hover:bg-[#1A79D3]/20 disabled:cursor-not-allowed disabled:opacity-60";

const btnDanger =
  "cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/15 px-5 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60";

const labelCls = "mb-2 block text-sm font-semibold text-slate-200";

const BiInput = ({ title, bnProps, enProps }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className={labelCls}>{title} BN</label>
        <input className={inputCls} {...bnProps} />
      </div>

      <div>
        <label className={labelCls}>{title} EN</label>
        <input className={inputCls} {...enProps} />
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({
  open,
  onClose,
  onConfirm,
  loading,
  methodName,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`${cardCls} w-full max-w-md p-6`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-black text-white">Confirm Delete</h3>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-6 text-sm leading-6 text-slate-300">
          Are you sure you want to delete{" "}
          <span className="font-bold text-[#6fb5f4]">
            {methodName || "this method"}
          </span>
          ?
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={btnGhost}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={btnDanger}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={17} />
                Delete
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const AddAffWithdrawMethod = () => {
  const qc = useQueryClient();

  const [selectedId, setSelectedId] = useState("");
  const [fields, setFields] = useState([defaultField()]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteData, setDeleteData] = useState({
    id: "",
    name: "",
  });

  const isCreateMode = !selectedId;

  const {
    data: methods = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-aff-withdraw-methods"],
    queryFn: async () => {
      const res = await api.get("/api/admin/aff-withdraw-methods");
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
    staleTime: 10000,
  });

  const selected = useMemo(() => {
    return methods.find((item) => item._id === selectedId) || null;
  }, [methods, selectedId]);

  const { register, reset, watch, handleSubmit } = useForm({
    defaultValues: {
      methodId: "",
      name_bn: "",
      name_en: "",
      isActive: true,
      minimumWithdrawAmount: 0,
      maximumWithdrawAmount: 0,
    },
  });

  useEffect(() => {
    setLogoFile(null);
    setLogoPreview("");

    if (!selected) {
      reset({
        methodId: "",
        name_bn: "",
        name_en: "",
        isActive: true,
        minimumWithdrawAmount: 0,
        maximumWithdrawAmount: 0,
      });

      setFields([defaultField()]);
      return;
    }

    reset({
      methodId: selected.methodId || "",
      name_bn: selected.name?.bn || "",
      name_en: selected.name?.en || "",
      isActive: selected.isActive ?? true,
      minimumWithdrawAmount: selected.minimumWithdrawAmount ?? 0,
      maximumWithdrawAmount: selected.maximumWithdrawAmount ?? 0,
    });

    setFields(
      Array.isArray(selected.fields) && selected.fields.length
        ? selected.fields
        : [defaultField()],
    );

    if (selected.logoUrl) {
      setLogoPreview(`${API_URL}${selected.logoUrl}`);
    }
  }, [selected, reset]);

  const clearForm = () => {
    setSelectedId("");
    setLogoFile(null);
    setLogoPreview("");
    setFields([defaultField()]);

    reset({
      methodId: "",
      name_bn: "",
      name_en: "",
      isActive: true,
      minimumWithdrawAmount: 0,
      maximumWithdrawAmount: 0,
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setLogoFile(null);
      setLogoPreview(selected?.logoUrl ? `${API_URL}${selected.logoUrl}` : "");
      return;
    }

    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addField = () => {
    setFields((prev) => [...prev, defaultField()]);
  };

  const removeField = (index) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const patchField = (index, key, value) => {
    setFields((prev) =>
      prev.map((field, i) =>
        i === index ? { ...field, [key]: value } : field,
      ),
    );
  };

  const patchFieldBi = (index, key, lang, value) => {
    setFields((prev) =>
      prev.map((field, i) =>
        i === index
          ? {
              ...field,
              [key]: {
                ...(field[key] || emptyBi),
                [lang]: value,
              },
            }
          : field,
      ),
    );
  };

  const validateBeforeSave = (values) => {
    const methodId = String(values.methodId || "").trim();

    if (!methodId) return "Method ID is required";

    if (!values.name_bn?.trim() || !values.name_en?.trim()) {
      return "BN and EN method name are required";
    }

    const minAmount = Number(values.minimumWithdrawAmount ?? 0);
    const maxAmount = Number(values.maximumWithdrawAmount ?? 0);

    if (!Number.isFinite(minAmount) || minAmount < 0) {
      return "Minimum withdraw amount must be valid";
    }

    if (!Number.isFinite(maxAmount) || maxAmount < 0) {
      return "Maximum withdraw amount must be valid";
    }

    if (maxAmount > 0 && minAmount > maxAmount) {
      return "Minimum withdraw amount cannot exceed maximum amount";
    }

    for (const field of fields) {
      if (!String(field.key || "").trim()) {
        return "Field key is required";
      }

      if (!field.label?.bn?.trim() || !field.label?.en?.trim()) {
        return "Field label BN and EN are required";
      }
    }

    return null;
  };

  const onSave = async (values) => {
    const error = validateBeforeSave(values);

    if (error) {
      toast.error(error);
      return;
    }

    try {
      setSaving(true);

      const payload = new FormData();

      payload.append("methodId", String(values.methodId).trim().toUpperCase());

      payload.append(
        "name",
        JSON.stringify({
          bn: values.name_bn || "",
          en: values.name_en || "",
        }),
      );

      payload.append("isActive", String(!!values.isActive));
      payload.append(
        "minimumWithdrawAmount",
        String(values.minimumWithdrawAmount ?? 0),
      );
      payload.append(
        "maximumWithdrawAmount",
        String(values.maximumWithdrawAmount ?? 0),
      );

      payload.append("fields", JSON.stringify(fields));

      if (logoFile) {
        payload.append("logo", logoFile);
      }

      if (selected?._id) {
        await api.put(
          `/api/admin/aff-withdraw-methods/${selected._id}`,
          payload,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        toast.success("Affiliate withdraw method updated successfully");
      } else {
        await api.post("/api/admin/aff-withdraw-methods", payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Affiliate withdraw method created successfully");
      }

      await qc.invalidateQueries({
        queryKey: ["admin-aff-withdraw-methods"],
      });

      refetch();

      if (isCreateMode) {
        clearForm();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (method) => {
    setDeleteData({
      id: method?._id || "",
      name: method?.name?.en || method?.methodId || "this method",
    });
  };

  const confirmDelete = async () => {
    if (!deleteData.id) return;

    try {
      setSaving(true);

      await api.delete(`/api/admin/aff-withdraw-methods/${deleteData.id}`);

      toast.success("Affiliate withdraw method deleted successfully");

      if (selectedId === deleteData.id) {
        clearForm();
      }

      setDeleteData({
        id: "",
        name: "",
      });

      await qc.invalidateQueries({
        queryKey: ["admin-aff-withdraw-methods"],
      });

      refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const currentTitle = isCreateMode
    ? "Add Affiliate Withdraw Method"
    : "Update Affiliate Withdraw Method";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050607] p-4 text-white md:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.18),transparent_38%)]" />

      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#1A79D3]/20 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-[#1A79D3]/15 blur-3xl" />
      <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[#1A79D3]/15 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-7">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`${cardCls} p-5 md:p-8`}
        >
          <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#1A79D3]/30 bg-white/10 shadow-[0_0_45px_rgba(26,121,211,0.28)] backdrop-blur">
                <Wallet className="h-8 w-8 text-[#1A79D3]" />
              </div>

              <div>
                <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
                  {currentTitle}
                </h1>

                <p className="mt-1 text-sm text-slate-300">
                  Manage affiliate withdraw methods with dynamic fields.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {!isCreateMode && (
                <button
                  type="button"
                  onClick={() => requestDelete(selected)}
                  disabled={saving}
                  className={btnDanger}
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              )}

              <button
                type="button"
                onClick={handleSubmit(onSave)}
                disabled={saving}
                className={btnPrimary}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {isCreateMode ? "Create Method" : "Update Method"}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-3">
            <Sparkles className="h-5 w-5 text-[#1A79D3]" />

            <div>
              <h2 className="text-sm font-bold text-white">
                Affiliate Withdraw Setup
              </h2>

              <p className="text-xs text-slate-300">
                Add method name, logo, min/max amount and custom input fields.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSave)} className="space-y-7">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <label className={labelCls}>Method ID</label>
                <input
                  className={inputCls}
                  placeholder="BKASH / NAGAD / ROCKET"
                  {...register("methodId")}
                />
              </div>

              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-5 w-5 cursor-pointer accent-[#1A79D3]"
                    {...register("isActive")}
                  />
                  <span className="text-sm font-bold text-slate-200">
                    Active Method
                  </span>
                </label>
              </div>

              <div className="lg:col-span-2">
                <BiInput
                  title="Method Name"
                  bnProps={{
                    ...register("name_bn"),
                    placeholder: "যেমন: বিকাশ",
                  }}
                  enProps={{
                    ...register("name_en"),
                    placeholder: "e.g. bKash",
                  }}
                />
              </div>

              <div>
                <label className={labelCls}>Minimum Withdraw Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputCls}
                  placeholder="0"
                  {...register("minimumWithdrawAmount", {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div>
                <label className={labelCls}>Maximum Withdraw Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputCls}
                  placeholder="0"
                  {...register("maximumWithdrawAmount", {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="lg:col-span-2">
                <label className={labelCls}>Method Logo</label>

                <div className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-black/25 p-4 sm:flex-row sm:items-center">
                  <label
                    htmlFor="aff-logo-upload"
                    className="group flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-dashed border-[#1A79D3]/45 bg-black/35 transition hover:border-[#1A79D3]/80 hover:bg-[#1A79D3]/10"
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400 transition group-hover:text-white">
                        <ImagePlus size={32} />
                        <span className="text-xs font-bold">Upload Logo</span>
                      </div>
                    )}
                  </label>

                  <div className="flex flex-col gap-3">
                    <label htmlFor="aff-logo-upload" className={btnGhost}>
                      <ImagePlus size={18} />
                      Choose Image
                    </label>

                    <input
                      id="aff-logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />

                    {logoFile && (
                      <p className="text-xs text-slate-300">
                        Selected:{" "}
                        <span className="font-bold text-[#6fb5f4]">
                          {logoFile.name}
                        </span>
                      </p>
                    )}

                    <p className="text-xs text-slate-500">
                      Supported: png, jpg, jpeg, webp, svg, avif, gif
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/25 p-5">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-black text-white">
                    Withdraw Form Fields
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    These fields will show in affiliate withdraw form.
                  </p>
                </div>

                <button type="button" onClick={addField} className={btnGhost}>
                  <Plus size={18} />
                  Add Field
                </button>
              </div>

              <div className="space-y-5">
                {fields.map((field, index) => (
                  <div
                    key={index}
                    className="rounded-[24px] border border-[#1A79D3]/15 bg-white/[0.04] p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-black text-[#6fb5f4]">
                        Field #{index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        disabled={fields.length === 1}
                        className="cursor-pointer rounded-xl border border-red-500/30 bg-red-500/15 px-3 py-2 text-xs font-bold text-red-100 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className={labelCls}>Field Key</label>
                        <input
                          className={inputCls}
                          value={field.key || ""}
                          onChange={(e) =>
                            patchField(index, "key", e.target.value)
                          }
                          placeholder="accountNumber / phone / email"
                        />
                      </div>

                      <div>
                        <label className={labelCls}>Field Type</label>
                        <select
                          className={`${inputCls} cursor-pointer`}
                          value={field.type || "text"}
                          onChange={(e) =>
                            patchField(index, "type", e.target.value)
                          }
                        >
                          <option value="text">text</option>
                          <option value="number">number</option>
                          <option value="tel">tel</option>
                          <option value="email">email</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <BiInput
                          title="Label"
                          bnProps={{
                            value: field.label?.bn || "",
                            onChange: (e) =>
                              patchFieldBi(
                                index,
                                "label",
                                "bn",
                                e.target.value,
                              ),
                            placeholder: "বাংলা লেবেল",
                          }}
                          enProps={{
                            value: field.label?.en || "",
                            onChange: (e) =>
                              patchFieldBi(
                                index,
                                "label",
                                "en",
                                e.target.value,
                              ),
                            placeholder: "English label",
                          }}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <BiInput
                          title="Placeholder"
                          bnProps={{
                            value: field.placeholder?.bn || "",
                            onChange: (e) =>
                              patchFieldBi(
                                index,
                                "placeholder",
                                "bn",
                                e.target.value,
                              ),
                            placeholder: "বাংলা placeholder",
                          }}
                          enProps={{
                            value: field.placeholder?.en || "",
                            onChange: (e) =>
                              patchFieldBi(
                                index,
                                "placeholder",
                                "en",
                                e.target.value,
                              ),
                            placeholder: "English placeholder",
                          }}
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={field.required !== false}
                            onChange={(e) =>
                              patchField(index, "required", e.target.checked)
                            }
                            className="h-5 w-5 cursor-pointer accent-[#1A79D3]"
                          />

                          <span className="text-sm font-bold text-slate-200">
                            Required
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className={`${cardCls} p-5 md:p-8`}
        >
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black text-white">
                All Affiliate Withdraw Methods
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Edit, delete or create new withdraw methods.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => refetch()}
                className={btnGhost}
              >
                <RefreshCw size={18} />
                Refresh
              </button>

              <button type="button" onClick={clearForm} className={btnPrimary}>
                <Plus size={18} />
                New Method
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-slate-300">
              <Loader2 className="h-5 w-5 animate-spin text-[#1A79D3]" />
              Loading withdraw methods...
            </div>
          ) : methods.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-black/25 py-16 text-center text-slate-400">
              No affiliate withdraw method found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {methods.map((method) => {
                const displayName =
                  method.name?.en || method.name?.bn || method.methodId;

                return (
                  <div
                    key={method._id}
                    className={`rounded-[24px] border bg-black/25 p-5 transition hover:bg-white/[0.06] ${
                      selectedId === method._id
                        ? "border-[#1A79D3]/70 shadow-[0_0_35px_rgba(26,121,211,0.18)]"
                        : "border-white/10 hover:border-[#1A79D3]/35"
                    }`}
                  >
                    <div className="mb-4 flex items-start gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-[#1A79D3]/25 bg-black/40">
                        {method.logoUrl ? (
                          <img
                            src={`${API_URL}${method.logoUrl}`}
                            alt={displayName}
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <Wallet className="h-8 w-8 text-slate-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-black text-white">
                          {displayName}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          ID:{" "}
                          <span className="font-bold text-[#6fb5f4]">
                            {method.methodId}
                          </span>
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Status:{" "}
                          <span
                            className={
                              method.isActive
                                ? "font-bold text-emerald-300"
                                : "font-bold text-red-300"
                            }
                          >
                            {method.isActive ? "Active" : "Inactive"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[11px] text-slate-500">Min</p>
                        <p className="text-sm font-black text-white">
                          {Number(method.minimumWithdrawAmount || 0)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[11px] text-slate-500">Max</p>
                        <p className="text-sm font-black text-white">
                          {Number(method.maximumWithdrawAmount || 0)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[11px] text-slate-500">Fields</p>
                        <p className="text-sm font-black text-white">
                          {Array.isArray(method.fields)
                            ? method.fields.length
                            : 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedId(method._id)}
                        className="flex-1 cursor-pointer rounded-2xl bg-[#1A79D3]/15 px-4 py-3 text-sm font-black text-[#6fb5f4] transition hover:bg-[#1A79D3]/25"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Pencil size={16} />
                          Edit
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => requestDelete(method)}
                        className="cursor-pointer rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-black text-red-200 transition hover:bg-red-500/25"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <DeleteConfirmModal
        open={!!deleteData.id}
        methodName={deleteData.name}
        loading={saving}
        onClose={() =>
          setDeleteData({
            id: "",
            name: "",
          })
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AddAffWithdrawMethod;
