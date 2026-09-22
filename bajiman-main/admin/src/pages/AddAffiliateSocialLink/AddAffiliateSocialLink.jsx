import React, { useEffect, useMemo, useState } from "react";
import {
  FaEdit,
  FaImage,
  FaLink,
  FaPlus,
  FaSave,
  FaSpinner,
  FaTimes,
  FaToggleOff,
  FaToggleOn,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const AddAffiliateSocialLink = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [preview, setPreview] = useState("");
  const [existingIcon, setExistingIcon] = useState("");

  const [form, setForm] = useState({
    url: "",
    order: 0,
    status: "active",
    icon: null,
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/affiliate-social-link/admin");
      setItems(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load affiliate social links",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (!form.icon) {
      setPreview("");
      return;
    }

    const url = URL.createObjectURL(form.icon);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [form.icon]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if ((a?.order ?? 0) !== (b?.order ?? 0)) {
        return (a?.order ?? 0) - (b?.order ?? 0);
      }
      return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
    });
  }, [items]);

  const resetForm = () => {
    setForm({
      url: "",
      order: 0,
      status: "active",
      icon: null,
    });
    setPreview("");
    setExistingIcon("");
    setEditingId(null);

    const input = document.getElementById("affiliate-social-icon-input");
    if (input) input.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.url.trim()) return toast.error("URL is required");

    if (!editingId && !form.icon) {
      return toast.error("Social icon is required");
    }

    if (editingId && !form.icon && !existingIcon) {
      return toast.error("Social icon is required");
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("url", form.url.trim());
      fd.append("order", String(Number(form.order || 0)));
      fd.append("status", form.status || "active");

      if (form.icon instanceof File) {
        fd.append("icon", form.icon);
      }

      if (editingId) {
        await api.put(`/api/affiliate-social-link/admin/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Affiliate social link updated successfully");
      } else {
        await api.post("/api/affiliate-social-link/admin", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Affiliate social link added successfully");
      }

      resetForm();
      fetchItems();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to save affiliate social link",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setExistingIcon(item?.iconUrl || "");
    setPreview("");

    setForm({
      url: item?.url || "",
      order: item?.order ?? 0,
      status: item?.status === "inactive" ? "inactive" : "active",
      icon: null,
    });

    const input = document.getElementById("affiliate-social-icon-input");
    if (input) input.value = "";

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Are you sure you want to delete this affiliate social link?",
    );
    if (!ok) return;

    try {
      await api.delete(`/api/affiliate-social-link/admin/${id}`);
      toast.success("Affiliate social link deleted successfully");

      if (editingId === id) resetForm();

      fetchItems();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to delete affiliate social link",
      );
    }
  };

  const handleQuickToggle = async (item) => {
    try {
      const fd = new FormData();
      fd.append("url", item?.url || "");
      fd.append("order", String(Number(item?.order || 0)));
      fd.append("status", item?.status === "active" ? "inactive" : "active");

      await api.put(`/api/affiliate-social-link/admin/${item._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Status updated successfully");
      fetchItems();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="min-h-full text-white">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-[#8fc2f5] via-white to-[#63a8ee] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
              Affiliate Social Link Controller
            </h1>
            <p className="mt-1 text-sm text-blue-100/80 md:text-base">
              Add, edit, delete and manage affiliate floating social icons.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-300/20 bg-black/40 px-4 py-3 shadow-lg shadow-blue-900/20 backdrop-blur-md">
            <p className="text-sm text-blue-100/80">Total Icons</p>
            <p className="text-2xl font-bold text-white">{items.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="overflow-hidden rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/20 to-black shadow-2xl shadow-blue-900/20">
            <div className="border-b border-blue-300/20 bg-gradient-to-r from-black/70 via-[#2f79c9]/40 to-black/70 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] text-white shadow-lg shadow-blue-700/40">
                  <FaLink className="text-lg" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white md:text-xl">
                    {editingId
                      ? "Edit Affiliate Social Link"
                      : "Add New Affiliate Social Link"}
                  </h2>
                  <p className="text-sm text-blue-100/80">
                    Upload icon and set target URL.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-100">
                  Social Icon Preview
                </label>

                <label
                  htmlFor="affiliate-social-icon-input"
                  className="group flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300/30 bg-black/40 px-4 py-6 text-center transition hover:border-[#63a8ee] hover:bg-[#2f79c9]/10"
                >
                  {preview || existingIcon ? (
                    <div className="w-full">
                      <img
                        src={preview || existingIcon}
                        alt="Affiliate Social Icon Preview"
                        className="mx-auto h-36 w-full rounded-2xl object-contain"
                      />
                      <p className="mt-3 text-sm text-blue-100/80">
                        Click to change icon
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#2f79c9]/20 text-2xl text-[#8fc2f5] transition group-hover:scale-105">
                        <FaImage />
                      </div>
                      <p className="text-base font-semibold text-white">
                        Click to upload affiliate social icon
                      </p>
                      <p className="mt-1 text-sm text-blue-100/70">
                        PNG, JPG, JPEG, WEBP, SVG, AVIF, GIF
                      </p>
                    </>
                  )}
                </label>

                <input
                  id="affiliate-social-icon-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      icon: e.target.files?.[0] || null,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-100">
                  URL
                </label>

                <input
                  type="text"
                  value={form.url}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, url: e.target.value }))
                  }
                  placeholder="https://wa.me/... or https://t.me/..."
                  className="w-full rounded-2xl border border-blue-300/25 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-blue-100/35 focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-100">
                    Order
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, order: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-blue-300/25 bg-black/50 px-4 py-3 text-white outline-none transition placeholder:text-blue-100/35 focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-blue-100">
                    Status
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, status: "active" }))
                      }
                      className={`cursor-pointer rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        form.status === "active"
                          ? "bg-[#63a8ee] text-white"
                          : "border border-blue-300/25 bg-black/40 text-white"
                      }`}
                    >
                      Active
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, status: "inactive" }))
                      }
                      className={`cursor-pointer rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        form.status === "inactive"
                          ? "bg-red-500 text-white"
                          : "border border-blue-300/25 bg-black/40 text-white"
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-5 py-3 font-semibold text-white shadow-lg shadow-blue-700/30 transition hover:from-[#7bb7f1] hover:to-[#3b88db] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      {editingId ? "Updating..." : "Saving..."}
                    </>
                  ) : editingId ? (
                    <>
                      <FaSave />
                      Update Social Link
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Add Social Link
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-blue-300/25 bg-black/40 px-5 py-3 font-semibold text-white transition hover:bg-[#2f79c9]/20"
                >
                  <FaTimes />
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div className="overflow-hidden rounded-3xl border border-blue-300/20 bg-gradient-to-br from-black via-[#2f79c9]/15 to-black shadow-2xl shadow-blue-900/20">
            <div className="border-b border-blue-300/20 bg-gradient-to-r from-black/70 via-[#2f79c9]/40 to-black/70 px-5 py-4">
              <h2 className="text-lg font-bold text-white md:text-xl">
                All Affiliate Social Links
              </h2>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="flex min-h-[240px] items-center justify-center">
                  <FaSpinner className="animate-spin text-3xl text-blue-200" />
                </div>
              ) : sortedItems.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-blue-300/20 bg-black/30 p-10 text-center">
                  No affiliate social links found.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {sortedItems.map((item) => (
                    <div
                      key={item._id}
                      className="overflow-hidden rounded-3xl border border-blue-300/20 bg-black/40 shadow-lg transition hover:border-[#63a8ee]/60"
                    >
                      <div className="relative flex h-44 items-center justify-center bg-black/60 p-6">
                        {item?.iconUrl ? (
                          <img
                            src={item.iconUrl}
                            alt="affiliate-social-icon"
                            className="h-20 w-20 object-contain"
                          />
                        ) : (
                          <FaImage className="text-4xl text-[#8fc2f5]" />
                        )}

                        <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                          Order: {item.order ?? 0}
                        </div>

                        <div
                          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
                            item.status === "active"
                              ? "bg-emerald-500 text-black"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {item.status}
                        </div>
                      </div>

                      <div className="space-y-4 p-4">
                        <div className="rounded-2xl border border-blue-300/15 bg-[#2f79c9]/10 p-3">
                          <p className="text-xs text-blue-100/60">URL</p>
                          <p className="mt-1 break-all text-sm font-medium text-white">
                            {item?.url || "-"}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-3 py-2.5 text-sm font-semibold text-white"
                          >
                            <FaEdit />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickToggle(item)}
                            className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold ${
                              item.status === "active"
                                ? "bg-yellow-500 text-black"
                                : "bg-blue-500 text-white"
                            }`}
                          >
                            {item.status === "active" ? (
                              <>
                                <FaToggleOn />
                                Off
                              </>
                            ) : (
                              <>
                                <FaToggleOff />
                                On
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item._id)}
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-red-500 px-3 py-2.5 text-sm font-semibold text-white"
                          >
                            <FaTrash />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAffiliateSocialLink;
