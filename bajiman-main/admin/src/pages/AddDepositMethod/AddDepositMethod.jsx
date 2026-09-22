import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaSyncAlt,
  FaSave,
  FaImage,
} from "react-icons/fa";
import { PiHandDepositBold } from "react-icons/pi";
import { api } from "../../api/axios";

const emptyBi = { bn: "", en: "" };

const defaultContact = () => ({
  id: "",
  label: { ...emptyBi },
  number: "",
  isActive: true,
  sort: 0,
});

const sectionCard =
  "rounded-2xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/20 to-black shadow-lg shadow-blue-900/20";

const inputBase =
  "w-full h-11 rounded-xl border border-blue-300/20 bg-black/40 px-4 text-white placeholder-blue-100/40 outline-none transition-all focus:border-[#63a8ee] focus:ring-2 focus:ring-[#63a8ee]/20";

const labelCls = "mb-2 block text-sm font-medium text-blue-100";
const titleCls = "text-xl font-bold text-white";
const subTitleCls = "text-lg font-semibold text-blue-100";

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

const formatMoney = (value) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const BiInput = ({ title, bnProps, enProps, bnPlaceholder, enPlaceholder }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div>
      <label className={labelCls}>{title} (BN)</label>
      <input className={inputBase} placeholder={bnPlaceholder} {...bnProps} />
    </div>
    <div>
      <label className={labelCls}>{title} (EN)</label>
      <input className={inputBase} placeholder={enPlaceholder} {...enProps} />
    </div>
  </div>
);

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, name }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-gradient-to-br from-black via-red-950/20 to-black p-6">
        <h3 className="text-xl font-bold text-white">Delete Confirmation</h3>
        <p className="mt-3 text-sm text-red-100">
          তুমি কি নিশ্চিত <span className="font-bold text-red-300">{name}</span>{" "}
          delete করতে চাও?
        </p>

        <div className="mt-6 flex gap-3">
          <button onClick={onConfirm} className={btnDanger}>
            Yes, Delete
          </button>
          <button onClick={onClose} className={btnGhost}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const AddDepositMethod = () => {
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
      methodName_bn: "",
      methodName_en: "",
      methodType: "agent",
      minDepositAmount: "",
      maxDepositAmount: "",
      isActive: true,
    },
  });

  const {
    data: responseData = {},
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["deposit-methods"],
    queryFn: async () => {
      const res = await api.get("/api/deposit-methods");
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
  const [contacts, setContacts] = useState([defaultContact()]);

  const selected = useMemo(
    () => list.find((item) => item._id === selectedId) || null,
    [list, selectedId],
  );

  const isCreateMode = !selectedId;
  const watchedActive = watch("isActive");
  const watchedMin = watch("minDepositAmount");
  const watchedMax = watch("maxDepositAmount");

  useEffect(() => {
    if (!logoFile) return;

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile]);

  useEffect(() => {
    if (!selected) {
      reset({
        methodId: "",
        methodName_bn: "",
        methodName_en: "",
        methodType: "agent",
        minDepositAmount: "",
        maxDepositAmount: "",
        isActive: true,
      });
      setContacts([defaultContact()]);
      setLogoFile(null);
      setLogoPreview("");
      return;
    }

    reset({
      methodId: selected.methodId || "",
      methodName_bn: selected.methodName?.bn || "",
      methodName_en: selected.methodName?.en || "",
      methodType: selected.methodType || "agent",
      minDepositAmount:
        selected.minDepositAmount !== undefined &&
        selected.minDepositAmount !== null
          ? String(selected.minDepositAmount)
          : "",
      maxDepositAmount:
        selected.maxDepositAmount !== undefined &&
        selected.maxDepositAmount !== null
          ? String(selected.maxDepositAmount)
          : "",
      isActive: selected.isActive ?? true,
    });

    setContacts(
      Array.isArray(selected.contacts) && selected.contacts.length
        ? selected.contacts
        : [defaultContact()],
    );

    setLogoFile(null);
    setLogoPreview(selected.logoUrl ? getImageUrl(selected.logoUrl) : "");
  }, [selected, reset]);

  const clearToCreate = () => {
    setSelectedId("");
    setDeleteId("");
    setDeleteName("");
    setLogoFile(null);
    setLogoPreview("");
    setContacts([defaultContact()]);
    reset({
      methodId: "",
      methodName_bn: "",
      methodName_en: "",
      methodType: "agent",
      minDepositAmount: "",
      maxDepositAmount: "",
      isActive: true,
    });
  };

  const patchContact = (idx, key, value) => {
    setContacts((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)),
    );
  };

  const patchContactBi = (idx, key, lang, value) => {
    setContacts((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              [key]: { ...(item[key] || emptyBi), [lang]: value },
            }
          : item,
      ),
    );
  };

  const validateBeforeSave = (values) => {
    if (!values.methodId?.trim()) return "Method ID লাগবে";

    if (!values.methodName_bn?.trim() || !values.methodName_en?.trim()) {
      return "Method name এর BN / EN দুটোই লাগবে";
    }

    const minAmount = Number(values.minDepositAmount);
    const maxAmount = Number(values.maxDepositAmount);

    if (values.minDepositAmount === "" || Number.isNaN(minAmount)) {
      return "Minimum deposit amount লাগবে";
    }

    if (values.maxDepositAmount === "" || Number.isNaN(maxAmount)) {
      return "Maximum deposit amount লাগবে";
    }

    if (minAmount < 0) return "Minimum deposit amount 0 এর কম হতে পারবে না";
    if (maxAmount < 0) return "Maximum deposit amount 0 এর কম হতে পারবে না";

    if (minAmount > maxAmount) {
      return "Minimum deposit amount maximum এর চেয়ে বেশি হতে পারবে না";
    }

    for (const c of contacts) {
      if (!String(c.number || "").trim()) return "সব number fill করতে হবে";

      if (
        !String(c.label?.bn || "").trim() ||
        !String(c.label?.en || "").trim()
      ) {
        return "সব label এর BN / EN লাগবে";
      }
    }

    return null;
  };

  const onSave = async (values) => {
    const errorMessage = validateBeforeSave(values);

    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    try {
      const payload = new FormData();

      payload.append(
        "methodId",
        String(values.methodId || "")
          .trim()
          .toLowerCase(),
      );

      payload.append(
        "methodName",
        JSON.stringify({
          bn: values.methodName_bn || "",
          en: values.methodName_en || "",
        }),
      );

      payload.append("methodType", values.methodType || "agent");
      payload.append(
        "minDepositAmount",
        String(Number(values.minDepositAmount)),
      );
      payload.append(
        "maxDepositAmount",
        String(Number(values.maxDepositAmount)),
      );
      payload.append("isActive", String(!!values.isActive));
      payload.append("contacts", JSON.stringify(contacts));

      if (logoFile) {
        payload.append("logo", logoFile);
      }

      if (selected?._id) {
        const res = await api.put(
          `/api/deposit-methods/${selected._id}`,
          payload,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        toast.success(res?.data?.message || "Deposit method updated");
      } else {
        const res = await api.post("/api/deposit-methods", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success(res?.data?.message || "Deposit method created");
      }

      await qc.invalidateQueries({ queryKey: ["deposit-methods"] });
      await refetch();

      if (isCreateMode) clearToCreate();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Save failed");
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await api.delete(`/api/deposit-methods/${deleteId}`);

      toast.success(res?.data?.message || "Deleted successfully");

      setDeleteId("");
      setDeleteName("");

      if (selectedId === deleteId) clearToCreate();

      await qc.invalidateQueries({ queryKey: ["deposit-methods"] });
      await refetch();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] shadow-lg shadow-blue-500/40">
                <PiHandDepositBold className="text-3xl text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">
                  Add Deposit Method
                </h1>
                <p className="text-sm text-blue-100/80">
                  Method name, image, type, amount range and number manage করো
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={refetch} className={btnGhost}>
                <span className="flex items-center gap-2">
                  <FaSyncAlt />
                  Refresh
                </span>
              </button>

              <button
                type="button"
                onClick={clearToCreate}
                className={btnPrimary}
              >
                <span className="flex items-center gap-2">
                  <FaPlus />
                  New Method
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className={titleCls}>
                {isCreateMode
                  ? "Create Deposit Method"
                  : "Update Deposit Method"}
              </h2>
              <p className="mt-1 text-sm text-blue-100/70">
                BN + EN দুই ভাষায় data fill করো
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {!isCreateMode && selected?._id && (
                <button
                  type="button"
                  onClick={() => {
                    setDeleteId(selected._id);
                    setDeleteName(selected.methodName?.en || selected.methodId);
                  }}
                  className={btnDanger}
                >
                  Delete Method
                </button>
              )}

              <button
                type="button"
                onClick={handleSubmit(onSave)}
                disabled={isSubmitting}
                className={btnPrimary}
              >
                <span className="flex items-center gap-2">
                  <FaSave />
                  {isSubmitting
                    ? "Saving..."
                    : isCreateMode
                      ? "Create Method"
                      : "Update Method"}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <label className={labelCls}>Method ID</label>
              <input
                {...register("methodId")}
                placeholder="bkash / nagad / rocket"
                className={inputBase}
              />
            </div>

            <div>
              <label className={labelCls}>Method Type</label>
              <select {...register("methodType")} className={inputBase}>
                <option value="agent">agent</option>
                <option value="personal">personal</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <BiInput
                title="Method Name"
                bnProps={register("methodName_bn")}
                enProps={register("methodName_en")}
                bnPlaceholder="যেমন: বিকাশ"
                enPlaceholder="e.g. bKash"
              />
            </div>

            <div>
              <label className={labelCls}>Minimum Deposit Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("minDepositAmount")}
                placeholder="e.g. 100"
                className={inputBase}
              />
            </div>

            <div>
              <label className={labelCls}>Maximum Deposit Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                {...register("maxDepositAmount")}
                placeholder="e.g. 50000"
                className={inputBase}
              />
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-blue-300/20 bg-black/30 p-4">
                <p className="text-sm text-blue-100/80">
                  Deposit Range:{" "}
                  <span className="font-bold text-white">
                    ৳ {formatMoney(watchedMin || 0)}
                  </span>{" "}
                  -{" "}
                  <span className="font-bold text-white">
                    ৳ {formatMoney(watchedMax || 0)}
                  </span>
                </p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <label className={labelCls}>Logo Image</label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-blue-300/20 bg-black/30 px-4 py-3 hover:bg-blue-900/20">
                <FaImage className="text-blue-200" />
                <span className="text-sm text-blue-100">
                  image upload করতে click করো
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setLogoFile(file);
                  }}
                />
              </label>

              {logoPreview && (
                <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-blue-300/20 bg-black/30 p-3 md:flex-row md:items-center">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="h-48 w-48 rounded-xl border border-blue-300/20 bg-black/40 object-contain"
                  />
                  <div>
                    <p className="text-sm font-semibold text-blue-100">
                      Logo preview
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(
                          selected?.logoUrl
                            ? getImageUrl(selected.logoUrl)
                            : "",
                        );
                      }}
                      className={`${btnGhost} mt-3`}
                    >
                      Clear New Image
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="h-5 w-5 cursor-pointer accent-[#63a8ee]"
                />
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    watchedActive
                      ? "border border-green-500/30 bg-green-500/20 text-green-300"
                      : "border border-red-500/30 bg-red-500/20 text-red-300"
                  }`}
                >
                  {watchedActive ? "Active" : "Inactive"}
                </span>
              </label>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-blue-300/20 bg-black/30 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className={subTitleCls}>Numbers / Contacts</h3>

              <button
                type="button"
                onClick={() =>
                  setContacts((prev) => [...prev, defaultContact()])
                }
                className={btnGhost}
              >
                + Add Number
              </button>
            </div>

            <div className="space-y-4">
              {contacts.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-blue-300/20 bg-gradient-to-br from-black/80 to-[#2f79c9]/10 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold text-blue-100">
                      Number #{idx + 1}
                    </h4>

                    <button
                      type="button"
                      onClick={() =>
                        setContacts((prev) => prev.filter((_, i) => i !== idx))
                      }
                      disabled={contacts.length === 1}
                      className={btnDanger}
                    >
                      Remove
                    </button>
                  </div>

                  <BiInput
                    title="Label"
                    bnProps={{
                      value: item.label?.bn || "",
                      onChange: (e) =>
                        patchContactBi(idx, "label", "bn", e.target.value),
                    }}
                    enProps={{
                      value: item.label?.en || "",
                      onChange: (e) =>
                        patchContactBi(idx, "label", "en", e.target.value),
                    }}
                    bnPlaceholder="যেমন: এজেন্ট নাম্বার"
                    enPlaceholder="e.g. Agent Number"
                  />

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className={labelCls}>Number</label>
                      <input
                        className={inputBase}
                        value={item.number || ""}
                        onChange={(e) =>
                          patchContact(idx, "number", e.target.value)
                        }
                        placeholder="01XXXXXXXXX"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Sort</label>
                      <input
                        type="number"
                        className={inputBase}
                        value={Number(item.sort ?? 0)}
                        onChange={(e) =>
                          patchContact(idx, "sort", Number(e.target.value || 0))
                        }
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-5 w-5 cursor-pointer accent-[#63a8ee]"
                          checked={item.isActive ?? true}
                          onChange={(e) =>
                            patchContact(idx, "isActive", e.target.checked)
                          }
                        />
                        <span className="font-medium text-blue-100">
                          Active
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${sectionCard} p-5 lg:p-6`}>
          <div className="mb-6">
            <h2 className={titleCls}>All Deposit Methods</h2>
            <p className="mt-1 text-sm text-blue-100/70">
              নিচে সব method card আকারে show করবে
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-blue-300/20 bg-black/20 p-10 text-center text-blue-100/70">
              Loading deposit methods...
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-blue-300/20 bg-black/20 p-10 text-center text-blue-100/70">
              কোনো deposit method পাওয়া যায়নি
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {list.map((method) => {
                const displayName =
                  method.methodName?.bn ||
                  method.methodName?.en ||
                  method.methodId;

                return (
                  <div
                    key={method._id}
                    className="rounded-2xl border border-blue-300/20 bg-gradient-to-br from-black/80 to-[#2f79c9]/10 p-5 shadow-lg shadow-blue-900/10"
                  >
                    <div className="flex flex-col gap-5 md:flex-row">
                      <div className="shrink-0">
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-blue-300/20 bg-black/50">
                          {method.logoUrl ? (
                            <img
                              src={getImageUrl(method.logoUrl)}
                              alt={displayName}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <FaImage className="text-3xl text-blue-200/60" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {displayName}
                            </h3>
                            <p className="mt-1 text-sm text-blue-100/80">
                              ID: {method.methodId}
                            </p>
                            <p className="mt-1 text-sm text-blue-100/80">
                              Type: {method.methodType}
                            </p>
                            <p className="mt-1 text-sm text-blue-100/80">
                              Min Deposit: ৳{" "}
                              {formatMoney(method.minDepositAmount)}
                            </p>
                            <p className="mt-1 text-sm text-blue-100/80">
                              Max Deposit: ৳{" "}
                              {formatMoney(method.maxDepositAmount)}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              method.isActive
                                ? "border border-green-500/30 bg-green-500/20 text-green-300"
                                : "border border-red-500/30 bg-red-500/20 text-red-300"
                            }`}
                          >
                            {method.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="rounded-xl border border-blue-300/20 bg-black/30 p-3">
                          <p className="mb-2 text-sm font-semibold text-blue-200">
                            Added Numbers
                          </p>

                          {method.contacts?.length ? (
                            <div className="flex flex-wrap gap-2">
                              {method.contacts.map((c, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-1 text-sm text-blue-100"
                                >
                                  {c.number}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-blue-100/70">
                              কোনো number নেই
                            </p>
                          )}
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
                            <span className="flex items-center gap-2">
                              <FaEdit />
                              Edit
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteId(method._id);
                              setDeleteName(displayName);
                            }}
                            className={btnDanger}
                          >
                            <span className="flex items-center gap-2">
                              <FaTrash />
                              Delete
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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
        name={deleteName}
      />
    </div>
  );
};

export default AddDepositMethod;
