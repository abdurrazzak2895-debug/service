import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Save,
  Image,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../api/axios";

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
};

const inputWrap =
  "flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 transition focus-within:border-[#1A79D3]/60 focus-within:shadow-[0_0_25px_rgba(26,121,211,0.20)]";

const inputClass =
  "w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500";

const labelClass = "mb-2 block text-sm font-semibold text-slate-200";

const cardClass =
  "rounded-[32px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-6";

const btnPrimary =
  "group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3 text-sm font-black text-white shadow-[0_18px_50px_rgba(26,121,211,0.25)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60";

const btnGhost =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#1A79D3]/20 bg-white/[0.07] px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-[#1A79D3]/15";

const btnDanger =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-400/25 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500/20";

const BiInput = ({ title, bnProps, enProps, bnPlaceholder, enPlaceholder }) => (
  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
    <div>
      <label className={labelClass}>{title} BN</label>
      <div className={inputWrap}>
        <Sparkles className="h-5 w-5 text-[#1A79D3]" />
        <input
          className={inputClass}
          placeholder={bnPlaceholder}
          {...bnProps}
        />
      </div>
    </div>

    <div>
      <label className={labelClass}>{title} EN</label>
      <div className={inputWrap}>
        <Sparkles className="h-5 w-5 text-[#1A79D3]" />
        <input
          className={inputClass}
          placeholder={enPlaceholder}
          {...enProps}
        />
      </div>
    </div>
  </div>
);

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, methodName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.94 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-[28px] border border-[#1A79D3]/20 bg-[#050607] p-6 text-white shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black">Delete Confirmation</h3>

              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer text-slate-300 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <p className="text-sm leading-6 text-slate-300">
              তুমি কি নিশ্চিত{" "}
              <span className="font-black text-red-300">
                {methodName || "this withdraw method"}
              </span>{" "}
              delete করতে চাও?
            </p>

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={onConfirm} className={btnDanger}>
                <Trash2 size={17} />
                Yes, Delete
              </button>

              <button type="button" onClick={onClose} className={btnGhost}>
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AddWithdraw = () => {
  const qc = useQueryClient();

  const {
    register,
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      methodId: "",
      name_bn: "",
      name_en: "",
      isActive: true,
      minimumWithdrawAmount: 0,
      maximumWithdrawAmount: 0,
    },
  });

  const {
    data: responseData = {},
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["withdraw-methods"],
    queryFn: async () => {
      const res = await api.get("/api/withdraw-methods");
      return res.data;
    },
    staleTime: 10000,
  });

  const list = useMemo(() => responseData?.data || [], [responseData]);

  const [selectedId, setSelectedId] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [deleteName, setDeleteName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  const selected = useMemo(
    () => list.find((item) => item._id === selectedId) || null,
    [list, selectedId],
  );

  const isCreateMode = !selectedId;
  const watchedActive = watch("isActive");

  useEffect(() => {
    if (!logoFile) return;

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  useEffect(() => {
    if (!selected) {
      if (isCreateMode) {
        reset({
          methodId: "",
          name_bn: "",
          name_en: "",
          isActive: true,
          minimumWithdrawAmount: 0,
          maximumWithdrawAmount: 0,
        });

        setLogoFile(null);
        setLogoPreview("");
      }
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

    setLogoFile(null);
    setLogoPreview(selected?.logoUrl ? getImageUrl(selected.logoUrl) : "");
  }, [selected, reset, isCreateMode]);

  const clearToCreate = () => {
    setSelectedId("");
    setDeleteId("");
    setDeleteName("");
    setLogoFile(null);
    setLogoPreview("");

    reset({
      methodId: "",
      name_bn: "",
      name_en: "",
      isActive: true,
      minimumWithdrawAmount: 0,
      maximumWithdrawAmount: 0,
    });
  };

  const validateBeforeSave = (values) => {
    const methodId = String(values.methodId || "")
      .trim()
      .toUpperCase();

    if (!methodId) return "Method ID is required";

    if (!values.name_bn?.trim() || !values.name_en?.trim()) {
      return "Both BN and EN names are required";
    }

    const minWithdraw = Number(values.minimumWithdrawAmount ?? 0);
    const maxWithdraw = Number(values.maximumWithdrawAmount ?? 0);

    if (Number.isNaN(minWithdraw) || minWithdraw < 0) {
      return "Minimum withdraw must be >= 0";
    }

    if (Number.isNaN(maxWithdraw) || maxWithdraw < 0) {
      return "Maximum withdraw must be >= 0";
    }

    if (maxWithdraw > 0 && minWithdraw > maxWithdraw) {
      return "Minimum withdraw cannot be greater than maximum withdraw";
    }

    return null;
  };

  const onSave = async (values) => {
    const err = validateBeforeSave(values);

    if (err) {
      toast.error(err);
      return;
    }

    try {
      const payload = new FormData();

      payload.append(
        "methodId",
        String(values.methodId || "")
          .trim()
          .toUpperCase(),
      );

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

      if (logoFile) {
        payload.append("logo", logoFile);
      }

      if (selected?._id) {
        const res = await api.put(
          `/api/withdraw-methods/${selected._id}`,
          payload,
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        toast.success(
          res?.data?.message || "Withdraw method updated successfully",
        );
      } else {
        const res = await api.post("/api/withdraw-methods", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success(
          res?.data?.message || "Withdraw method created successfully",
        );
      }

      await qc.invalidateQueries({ queryKey: ["withdraw-methods"] });
      await refetch();

      if (isCreateMode) clearToCreate();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await api.delete(`/api/withdraw-methods/${deleteId}`);

      toast.success(
        res?.data?.message || "Withdraw method deleted successfully",
      );

      if (selectedId === deleteId) clearToCreate();

      setDeleteId("");
      setDeleteName("");

      await qc.invalidateQueries({ queryKey: ["withdraw-methods"] });
      await refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050607] p-4 text-white md:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(26,121,211,0.18),transparent_38%)]" />

      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#1A79D3]/20 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-[#1A79D3]/15 blur-3xl" />
      <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[#1A79D3]/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-[32px] border border-[#1A79D3]/20 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#1A79D3]/30 bg-white/10 shadow-[0_0_45px_rgba(26,121,211,0.28)] backdrop-blur">
                <WalletCards className="h-8 w-8 text-[#1A79D3]" />
              </div>

              <div>
                <h1 className="bg-gradient-to-r from-[#6fb5f4] via-[#1A79D3] to-[#3ea0ff] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
                  Withdraw Method Manager
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Create, update, delete and control all withdraw methods.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={refetch} className={btnGhost}>
                <RefreshCw
                  size={17}
                  className={isFetching ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={clearToCreate}
                className={btnPrimary}
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition duration-700 group-hover:translate-x-full" />
                <Plus size={17} />
                New Method
              </button>
            </div>
          </div>
        </motion.div>

        <div className={cardClass}>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-3 rounded-2xl border border-[#1A79D3]/20 bg-[#1A79D3]/10 px-4 py-3">
                <Sparkles className="h-5 w-5 text-[#1A79D3]" />
                <div>
                  <h2 className="text-sm font-bold text-white">
                    {isCreateMode
                      ? "Create Withdraw Method"
                      : "Update Withdraw Method"}
                  </h2>
                  <p className="text-xs text-slate-300">
                    BN + EN দুই ভাষাতেই method info fill করো.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {!isCreateMode && selected?._id && (
                <button
                  type="button"
                  onClick={() => {
                    setDeleteId(selected._id);
                    setDeleteName(selected.name?.en || selected.methodId);
                  }}
                  className={btnDanger}
                >
                  <Trash2 size={17} />
                  Delete Method
                </button>
              )}

              <button
                type="button"
                onClick={handleSubmit(onSave)}
                disabled={isSubmitting}
                className={btnPrimary}
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition duration-700 group-hover:translate-x-full" />
                {isSubmitting ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                {isSubmitting
                  ? isCreateMode
                    ? "Creating..."
                    : "Updating..."
                  : isCreateMode
                    ? "Create Method"
                    : "Update Method"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <label className={labelClass}>Method ID uppercase</label>
              <div className={inputWrap}>
                <ShieldCheck className="h-5 w-5 text-[#1A79D3]" />
                <input
                  {...register("methodId")}
                  placeholder="NAGAD / BKASH / ROCKET"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex items-end">
              <label className="flex h-[50px] cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="h-5 w-5 cursor-pointer accent-[#1A79D3]"
                />

                <span
                  className={`rounded-full px-3 py-1 text-sm font-black ${
                    watchedActive
                      ? "border border-[#1A79D3]/30 bg-[#1A79D3]/15 text-[#6fb5f4]"
                      : "border border-red-400/25 bg-red-500/15 text-red-200"
                  }`}
                >
                  {watchedActive ? "Active" : "Inactive"}
                </span>
              </label>
            </div>

            <div className="lg:col-span-2">
              <BiInput
                title="Method Name"
                bnProps={register("name_bn")}
                enProps={register("name_en")}
                bnPlaceholder="যেমন: নগদ"
                enPlaceholder="e.g. Nagad"
              />
            </div>

            <div>
              <label className={labelClass}>Minimum Withdraw Amount</label>
              <div className={inputWrap}>
                <WalletCards className="h-5 w-5 text-[#1A79D3]" />
                <input
                  type="number"
                  {...register("minimumWithdrawAmount", {
                    valueAsNumber: true,
                  })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Maximum Withdraw Amount</label>
              <div className={inputWrap}>
                <WalletCards className="h-5 w-5 text-[#1A79D3]" />
                <input
                  type="number"
                  {...register("maximumWithdrawAmount", {
                    valueAsNumber: true,
                  })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className={labelClass}>Logo Image</label>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[#1A79D3]/30 bg-black/35 px-4 py-4 transition hover:bg-[#1A79D3]/10">
                <UploadCloud className="h-5 w-5 text-[#1A79D3]" />
                <span className="text-sm text-slate-300">
                  image upload করতে click করো
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                />
              </label>

              {logoPreview && (
                <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[#1A79D3]/20 bg-black/35 p-3">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="h-20 w-20 rounded-2xl border border-[#1A79D3]/20 bg-white object-contain p-2"
                  />
                  <span className="text-sm text-slate-300">Logo preview</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black text-white">
                All Withdraw Methods
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                নিচে সব method card আকারে show করবে.
              </p>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={refetch} className={btnGhost}>
                <RefreshCw size={17} />
                Refresh List
              </button>

              <button
                type="button"
                onClick={clearToCreate}
                className={btnPrimary}
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition duration-700 group-hover:translate-x-full" />
                <Plus size={17} />
                New Method
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/35 p-10 text-center text-slate-300">
              Loading withdraw methods...
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#1A79D3]/25 bg-black/35 p-10 text-center text-slate-300">
              কোনো withdraw method পাওয়া যায়নি
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {list.map((method) => {
                const displayName =
                  method.name?.bn || method.name?.en || method.methodId;

                return (
                  <motion.div
                    key={method._id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[26px] border border-[#1A79D3]/20 bg-black/35 p-5 shadow-xl shadow-black/25 transition hover:border-[#1A79D3]/40 hover:bg-white/[0.08]"
                  >
                    <div className="flex flex-col gap-5 md:flex-row">
                      <div className="shrink-0">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-[#1A79D3]/20 bg-black/40">
                          {method.logoUrl ? (
                            <img
                              src={getImageUrl(method.logoUrl)}
                              alt={displayName}
                              className="h-full w-full bg-white object-contain p-2"
                            />
                          ) : (
                            <Image className="h-9 w-9 text-[#1A79D3]/70" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-black text-white">
                              {displayName}
                            </h3>
                            <p className="mt-1 text-sm text-slate-300">
                              ID: {method.methodId}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              method.isActive
                                ? "border border-[#1A79D3]/30 bg-[#1A79D3]/15 text-[#6fb5f4]"
                                : "border border-red-400/25 bg-red-500/15 text-red-200"
                            }`}
                          >
                            {method.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
                            <p className="text-sm text-[#6fb5f4]">
                              Min Withdraw
                            </p>
                            <p className="mt-1 text-lg font-black text-white">
                              {Number(method.minimumWithdrawAmount ?? 0)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-black/35 p-3">
                            <p className="text-sm text-[#6fb5f4]">
                              Max Withdraw
                            </p>
                            <p className="mt-1 text-lg font-black text-white">
                              {Number(method.maximumWithdrawAmount ?? 0)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedId(method._id);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={btnPrimary}
                          >
                            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition duration-700 group-hover:translate-x-full" />
                            <Edit3 size={17} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteId(method._id);
                              setDeleteName(displayName);
                            }}
                            className={btnDanger}
                          >
                            <Trash2 size={17} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => {
          setDeleteId("");
          setDeleteName("");
        }}
        onConfirm={confirmDelete}
        methodName={deleteName}
      />
    </div>
  );
};

export default AddWithdraw;
