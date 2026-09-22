// src/pages/WheelOfFortuneReward/WheelOfFortuneReward.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaCoins,
  FaEdit,
  FaGift,
  FaImage,
  FaPalette,
  FaSave,
  FaSearch,
  FaSyncAlt,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaultSegmentColors = [
  "#ffc800",
  "#263574",
  "#ff8a00",
  "#6338a8",
  "#18a957",
  "#d9365e",
  "#1683eb",
  "#8a5a00",
];

const createDefaultSegments = () =>
  Array.from({ length: 8 }, (_, index) => ({
    position: index + 1,
    text: {
      bn: `${index + 1} নম্বর প্রস্কার`,
      en: `Prize ${index + 1}`,
    },
    prizeType: "balance",
    amount: 10,
    probability: 12.5,
    turnoverMultiplier: 0,
    backgroundColor: defaultSegmentColors[index],
    textColor: index % 2 === 0 ? "#000000" : "#ffffff",
    textSize: 14,
    fontWeight: "bold",
    isActive: true,
  }));

const defaultDesign = {
  pageBackgroundColor: "#66005f",
  cardBackgroundColor: "#ffffff",
  wheelBackgroundColor: "#ffffff",
  wheelBorderColor: "#d89d00",
  wheelBorderWidth: 8,
  pointerColor: "#ffc800",
  centerButtonColor: "#ffc800",
  centerButtonTextColor: "#000000",
  titleColor: "#ffffff",
  descriptionColor: "#ffffff",
  costBoxColor: "#ffc800",
  costTextColor: "#000000",
};

const defaultConditions = {
  dailySpinLimit: 0,
  totalSpinLimit: 0,
  cooldownMinutes: 0,
  minimumDeposit: 0,
  minimumTurnover: 0,
  minimumGameLoss: 0,
};

const createInitialForm = () => ({
  titleBn: "",
  titleEn: "",
  descriptionBn: "",
  descriptionEn: "",
  spinButtonTextBn: "স্পিন",
  spinButtonTextEn: "SPIN",
  spinCost: 30,
  segments: createDefaultSegments(),
  design: { ...defaultDesign },
  conditions: { ...defaultConditions },
  startAt: "",
  endAt: "",
  order: 0,
  isActive: true,
});

const WheelOfFortuneReward = () => {
  const [form, setForm] = useState(createInitialForm);

  const [backgroundImage, setBackgroundImage] = useState(null);
  const [wheelImage, setWheelImage] = useState(null);

  const [backgroundPreview, setBackgroundPreview] = useState("");
  const [wheelPreview, setWheelPreview] = useState("");

  const [currentBackgroundImage, setCurrentBackgroundImage] = useState("");
  const [currentWheelImage, setCurrentWheelImage] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [wheels, setWheels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  const resolveImage = (image = "") => {
    if (!image) return "";

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    const baseUrl = String(
      import.meta.env.VITE_API_URL || api.defaults.baseURL || "",
    ).replace(/\/+$/, "");

    return `${baseUrl}${image.startsWith("/") ? image : `/${image}`}`;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 450);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!backgroundImage) {
      setBackgroundPreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(backgroundImage);
    setBackgroundPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [backgroundImage]);

  useEffect(() => {
    if (!wheelImage) {
      setWheelPreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(wheelImage);
    setWheelPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [wheelImage]);

  const loadWheels = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: 12,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const { data } = await api.get("/api/admin/wheels", {
        params,
      });

      setWheels(data?.wheels || []);

      setPagination({
        page: Number(data?.pagination?.page || currentPage),
        limit: Number(data?.pagination?.limit || 12),
        total: Number(data?.pagination?.total || 0),
        totalPages: Math.max(Number(data?.pagination?.totalPages || 1), 1),
      });
    } catch (error) {
      setWheels([]);

      toast.error(error?.response?.data?.message || "Failed to load Wheels");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    loadWheels();
  }, [loadWheels]);

  const totalProbability = useMemo(() => {
    return form.segments.reduce((total, segment) => {
      if (!segment.isActive) return total;

      return total + Number(segment.probability || 0);
    }, 0);
  }, [form.segments]);

  const wheelGradient = useMemo(() => {
    const segmentSize = 100 / form.segments.length;

    const parts = form.segments.map((segment, index) => {
      const start = index * segmentSize;
      const end = (index + 1) * segmentSize;

      return `${segment.backgroundColor} ${start}% ${end}%`;
    });

    return `conic-gradient(from -22.5deg, ${parts.join(", ")})`;
  }, [form.segments]);

  const displayedBackgroundImage =
    backgroundPreview ||
    (currentBackgroundImage ? resolveImage(currentBackgroundImage) : "");

  const displayedWheelImage =
    wheelPreview || (currentWheelImage ? resolveImage(currentWheelImage) : "");

  const formatDateForInput = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const offset = date.getTimezoneOffset();

    return new Date(date.getTime() - offset * 60 * 1000)
      .toISOString()
      .slice(0, 16);
  };

  const formatDate = (value) => {
    if (!value) return "No limit";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "No limit";
    }

    return date.toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const resetForm = () => {
    setForm(createInitialForm());

    setBackgroundImage(null);
    setWheelImage(null);

    setBackgroundPreview("");
    setWheelPreview("");

    setCurrentBackgroundImage("");
    setCurrentWheelImage("");

    setEditingId(null);
  };

  const handleBasicChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleDesignChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      design: {
        ...previous.design,
        [field]: value,
      },
    }));
  };

  const handleConditionChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      conditions: {
        ...previous.conditions,
        [field]: value,
      },
    }));
  };

  const handleSegmentChange = (index, field, value) => {
    setForm((previous) => {
      const segments = [...previous.segments];
      let segment = { ...segments[index] };

      if (field === "textBn" || field === "textEn") {
        const language = field === "textBn" ? "bn" : "en";

        segment = {
          ...segment,
          text: {
            ...segment.text,
            [language]: value,
          },
        };
      } else {
        segment[field] = value;
      }

      if (field === "prizeType" && value !== "balance") {
        segment.turnoverMultiplier = 0;
      }

      if (field === "prizeType" && value === "no_prize") {
        segment.amount = 0;
      }

      if (field === "isActive" && value === false) {
        segment.probability = 0;
      }

      segments[index] = segment;

      return {
        ...previous,
        segments,
      };
    });
  };

  const validateImage = (file, imageName) => {
    if (!file.type.startsWith("image/")) {
      toast.error(`${imageName} must be an image file`);
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${imageName} cannot be larger than 10MB`);
      return false;
    }

    return true;
  };

  const handleBackgroundImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!validateImage(file, "Background image")) {
      event.target.value = "";
      return;
    }

    setBackgroundImage(file);
  };

  const handleWheelImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!validateImage(file, "Wheel image")) {
      event.target.value = "";
      return;
    }

    setWheelImage(file);
  };

  const validateForm = () => {
    if (!form.titleBn.trim()) {
      toast.error("Bangla Wheel title is required");
      return false;
    }

    if (!form.titleEn.trim()) {
      toast.error("English Wheel title is required");
      return false;
    }

    if (!editingId && !backgroundImage) {
      toast.error("Background image is required");
      return false;
    }

    if (!editingId && !wheelImage) {
      toast.error("Wheel image is required");
      return false;
    }

    if (editingId && !backgroundImage && !currentBackgroundImage) {
      toast.error("Background image is required");
      return false;
    }

    if (editingId && !wheelImage && !currentWheelImage) {
      toast.error("Wheel image is required");
      return false;
    }

    if (!Number.isFinite(Number(form.spinCost)) || Number(form.spinCost) < 0) {
      toast.error("Enter a valid Spin cost");
      return false;
    }

    if (form.segments.length !== 8) {
      toast.error("Wheel must contain exactly 8 segments");
      return false;
    }

    for (let index = 0; index < 8; index += 1) {
      const segment = form.segments[index];

      if (!segment.text.bn.trim()) {
        toast.error(`Bangla text is required for Segment ${index + 1}`);
        return false;
      }

      if (!segment.text.en.trim()) {
        toast.error(`English text is required for Segment ${index + 1}`);
        return false;
      }

      if (segment.prizeType !== "no_prize" && Number(segment.amount) <= 0) {
        toast.error(`Prize amount is required for Segment ${index + 1}`);
        return false;
      }
    }

    if (Math.abs(totalProbability - 100) > 0.001) {
      toast.error(`Probability must total 100%. Current: ${totalProbability}%`);
      return false;
    }

    if (
      form.startAt &&
      form.endAt &&
      new Date(form.endAt) <= new Date(form.startAt)
    ) {
      toast.error("End date must be later than start date");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const formData = new FormData();

      if (backgroundImage) {
        formData.append("backgroundImage", backgroundImage);
      }

      if (wheelImage) {
        formData.append("wheelImage", wheelImage);
      }

      formData.append("titleBn", form.titleBn.trim());
      formData.append("titleEn", form.titleEn.trim());

      formData.append("descriptionBn", form.descriptionBn.trim());

      formData.append("descriptionEn", form.descriptionEn.trim());

      formData.append("spinButtonTextBn", form.spinButtonTextBn.trim());

      formData.append("spinButtonTextEn", form.spinButtonTextEn.trim());

      formData.append("spinCost", String(form.spinCost));

      formData.append(
        "segments",
        JSON.stringify(
          form.segments.map((segment, index) => ({
            ...segment,
            position: index + 1,
            amount: Number(segment.amount || 0),
            probability: Number(segment.probability || 0),
            turnoverMultiplier:
              segment.prizeType === "balance"
                ? Number(segment.turnoverMultiplier || 0)
                : 0,
            textSize: Number(segment.textSize || 14),
          })),
        ),
      );

      formData.append(
        "design",
        JSON.stringify({
          ...form.design,
          wheelBorderWidth: Number(form.design.wheelBorderWidth || 0),
        }),
      );

      formData.append(
        "conditions",
        JSON.stringify(
          Object.fromEntries(
            Object.entries(form.conditions).map(([key, value]) => [
              key,
              Number(value || 0),
            ]),
          ),
        ),
      );

      formData.append("startAt", form.startAt || "");
      formData.append("endAt", form.endAt || "");
      formData.append("order", String(form.order || 0));
      formData.append("isActive", String(form.isActive));

      if (editingId) {
        await api.put(`/api/admin/wheels/${editingId}`, formData);

        toast.success("Wheel updated successfully");
      } else {
        await api.post("/api/admin/wheels", formData);

        toast.success("Wheel created successfully");
      }

      resetForm();
      await loadWheels();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save Wheel");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (wheel) => {
    setEditingId(wheel._id);

    setForm({
      titleBn: wheel.title?.bn || "",
      titleEn: wheel.title?.en || "",
      descriptionBn: wheel.description?.bn || "",
      descriptionEn: wheel.description?.en || "",
      spinButtonTextBn: wheel.spinButtonText?.bn || "স্পিন",
      spinButtonTextEn: wheel.spinButtonText?.en || "SPIN",
      spinCost: wheel.spinCost ?? 0,

      segments:
        Array.isArray(wheel.segments) && wheel.segments.length === 8
          ? [...wheel.segments]
              .sort((a, b) => a.position - b.position)
              .map((segment) => ({
                position: segment.position,
                text: {
                  bn: segment.text?.bn || "",
                  en: segment.text?.en || "",
                },
                prizeType: segment.prizeType || "balance",
                amount: segment.amount ?? 0,
                probability: segment.probability ?? 0,
                turnoverMultiplier: segment.turnoverMultiplier ?? 0,
                backgroundColor: segment.backgroundColor || "#ffc800",
                textColor: segment.textColor || "#000000",
                textSize: segment.textSize || 14,
                fontWeight: segment.fontWeight || "bold",
                isActive: segment.isActive !== false,
              }))
          : createDefaultSegments(),

      design: {
        ...defaultDesign,
        ...(wheel.design || {}),
      },

      conditions: {
        ...defaultConditions,
        ...(wheel.conditions || {}),
      },

      startAt: formatDateForInput(wheel.startAt),
      endAt: formatDateForInput(wheel.endAt),
      order: wheel.order || 0,
      isActive: wheel.isActive !== false,
    });

    setCurrentBackgroundImage(wheel.backgroundImage || "");

    setCurrentWheelImage(wheel.wheelImage || "");

    setBackgroundImage(null);
    setWheelImage(null);

    setBackgroundPreview("");
    setWheelPreview("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleStatusChange = async (wheel) => {
    const nextStatus = !wheel.isActive;

    try {
      setStatusUpdatingId(wheel._id);

      const { data } = await api.patch(
        `/api/admin/wheels/${wheel._id}/status`,
        {
          isActive: nextStatus,
        },
      );

      setWheels((previous) =>
        previous.map((item) => (item._id === wheel._id ? data.wheel : item)),
      );

      toast.success(nextStatus ? "Wheel activated" : "Wheel deactivated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      setDeleting(true);

      await api.delete(`/api/admin/wheels/${deleteConfirmId}`);

      if (editingId === deleteConfirmId) {
        resetForm();
      }

      setDeleteConfirmId(null);

      toast.success("Wheel deleted successfully");

      await loadWheels();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete Wheel");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#2f79c9]/20 to-black p-4 text-white lg:p-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6">
          <h1 className="bg-gradient-to-r from-[#8fc2f5] via-white to-[#63a8ee] bg-clip-text text-2xl font-black text-transparent lg:text-3xl">
            {editingId ? "Update Wheel of Fortune" : "Create Wheel of Fortune"}
          </h1>

          <p className="mt-2 text-sm text-blue-100/80">
            Configure background, Wheel image, prizes, probability, colors and
            Spin conditions.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Section title="General Information" icon={<FaGift />}>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <ImageUpload
                label="Background Image"
                description="Used as the Client Wheel page background."
                preview={displayedBackgroundImage}
                onChange={handleBackgroundImageChange}
                required={!editingId}
              />

              <ImageUpload
                label="Wheel Image"
                description="Used in the Wheel selection card."
                preview={displayedWheelImage}
                onChange={handleWheelImageChange}
                required={!editingId}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Title (Bangla)"
                  value={form.titleBn}
                  onChange={(value) => handleBasicChange("titleBn", value)}
                />

                <Input
                  label="Title (English)"
                  value={form.titleEn}
                  onChange={(value) => handleBasicChange("titleEn", value)}
                />

                <Input
                  label="Spin Button (Bangla)"
                  value={form.spinButtonTextBn}
                  onChange={(value) =>
                    handleBasicChange("spinButtonTextBn", value)
                  }
                />

                <Input
                  label="Spin Button (English)"
                  value={form.spinButtonTextEn}
                  onChange={(value) =>
                    handleBasicChange("spinButtonTextEn", value)
                  }
                />

                <NumberInput
                  label="Spin Cost"
                  value={form.spinCost}
                  onChange={(value) => handleBasicChange("spinCost", value)}
                />

                <NumberInput
                  label="Display Order"
                  value={form.order}
                  onChange={(value) => handleBasicChange("order", value)}
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <TextArea
                label="Description (Bangla)"
                value={form.descriptionBn}
                onChange={(value) => handleBasicChange("descriptionBn", value)}
              />

              <TextArea
                label="Description (English)"
                value={form.descriptionEn}
                onChange={(value) => handleBasicChange("descriptionEn", value)}
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <DateInput
                label="Start Date"
                value={form.startAt}
                onChange={(value) => handleBasicChange("startAt", value)}
              />

              <DateInput
                label="End Date"
                value={form.endAt}
                onChange={(value) => handleBasicChange("endAt", value)}
              />

              <div>
                <Label>Status</Label>

                <select
                  value={form.isActive ? "active" : "inactive"}
                  onChange={(event) =>
                    handleBasicChange(
                      "isActive",
                      event.target.value === "active",
                    )
                  }
                  className="h-11 w-full cursor-pointer rounded-xl border border-blue-300/25 bg-black/50 px-3 text-sm outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </Section>

          <Section title="Eight Wheel Segments" icon={<FaCoins />}>
            <div
              className={`mb-5 rounded-xl border p-4 ${
                Math.abs(totalProbability - 100) <= 0.001
                  ? "border-emerald-600/40 bg-emerald-900/15"
                  : "border-red-600/50 bg-red-900/20"
              }`}
            >
              <p className="font-bold">
                Total Probability:{" "}
                <span
                  className={
                    Math.abs(totalProbability - 100) <= 0.001
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                >
                  {totalProbability.toFixed(2)}%
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {form.segments.map((segment, index) => (
                <SegmentEditor
                  key={segment.position}
                  index={index}
                  segment={segment}
                  onChange={handleSegmentChange}
                />
              ))}
            </div>
          </Section>

          <Section title="Wheel Design Control" icon={<FaPalette />}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              {[
                ["pageBackgroundColor", "Page Background"],
                ["cardBackgroundColor", "Card Background"],
                ["wheelBorderColor", "Wheel Border"],
                ["pointerColor", "Pointer"],
                ["centerButtonColor", "Center Button"],
                ["centerButtonTextColor", "Center Text"],
                ["titleColor", "Title Color"],
                ["descriptionColor", "Description"],
                ["costBoxColor", "Cost Box"],
                ["costTextColor", "Cost Text"],
              ].map(([key, label]) => (
                <ColorInput
                  key={key}
                  label={label}
                  value={form.design[key]}
                  onChange={(value) => handleDesignChange(key, value)}
                />
              ))}

              <NumberInput
                label="Border Width"
                value={form.design.wheelBorderWidth}
                max={40}
                onChange={(value) =>
                  handleDesignChange("wheelBorderWidth", value)
                }
              />
            </div>
          </Section>

          <Section title="Spin Conditions" icon={<FaSyncAlt />}>
            <p className="mb-4 text-xs text-blue-100/70">
              Set 0 for no restriction.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["dailySpinLimit", "Daily Spin Limit"],
                ["totalSpinLimit", "Total Spin Limit"],
                ["cooldownMinutes", "Cooldown Minutes"],
                ["minimumDeposit", "Minimum Deposit"],
                ["minimumTurnover", "Minimum Turnover"],
                ["minimumGameLoss", "Minimum Game Loss"],
              ].map(([key, label]) => (
                <NumberInput
                  key={key}
                  label={label}
                  value={form.conditions[key]}
                  onChange={(value) => handleConditionChange(key, value)}
                />
              ))}
            </div>
          </Section>

          <Section title="Wheel Preview" icon={<FaImage />}>
            <div
              className="overflow-hidden rounded-2xl bg-cover bg-center p-5"
              style={{
                backgroundColor: form.design.pageBackgroundColor,
                backgroundImage: displayedBackgroundImage
                  ? `linear-gradient(rgba(0,0,0,.48), rgba(0,0,0,.62)), url("${displayedBackgroundImage}")`
                  : "none",
              }}
            >
              <div className="flex flex-col items-center">
                <h3
                  className="text-xl font-extrabold"
                  style={{
                    color: form.design.titleColor,
                  }}
                >
                  {form.titleEn || "Wheel Title"}
                </h3>

                <div className="relative mt-8">
                  <div
                    className="absolute left-1/2 top-[-20px] z-30 -translate-x-1/2 border-x-[17px] border-t-[30px] border-x-transparent"
                    style={{
                      borderTopColor: form.design.pointerColor,
                    }}
                  />

                  <div
                    className="relative h-[270px] w-[270px] rounded-full sm:h-[350px] sm:w-[350px]"
                    style={{
                      background: wheelGradient,
                      border: `${form.design.wheelBorderWidth}px solid ${form.design.wheelBorderColor}`,
                    }}
                  >
                    {form.segments.map((segment, index) => (
                      <div
                        key={segment.position}
                        className="absolute inset-0"
                        style={{
                          transform: `rotate(${index * 45}deg)`,
                        }}
                      >
                        <span
                          className="absolute left-1/2 top-[10%] -translate-x-1/2 text-xs font-black"
                          style={{
                            color: segment.textColor,
                          }}
                        >
                          {segment.position}
                        </span>
                      </div>
                    ))}

                    <div
                      className="absolute left-1/2 top-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white/50 font-black"
                      style={{
                        backgroundColor: form.design.centerButtonColor,
                        color: form.design.centerButtonTextColor,
                      }}
                    >
                      {form.spinButtonTextEn || "SPIN"}
                    </div>
                  </div>
                </div>

                <div
                  className="mt-5 rounded-full px-5 py-2 text-sm font-extrabold"
                  style={{
                    backgroundColor: form.design.costBoxColor,
                    color: form.design.costTextColor,
                  }}
                >
                  {form.spinCost} Reward Coins / Spin
                </div>
              </div>
            </div>
          </Section>

          <div className="mb-10 flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center gap-2 rounded-xl px-8 py-3.5 font-bold transition ${
                saving
                  ? "cursor-not-allowed bg-gray-700 text-gray-400"
                  : "cursor-pointer bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white hover:from-[#7bb7f1] hover:to-[#3b88db]"
              }`}
            >
              <FaSave />

              {saving
                ? "Saving..."
                : editingId
                  ? "Update Wheel"
                  : "Create Wheel"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="cursor-pointer rounded-xl border border-blue-300/25 bg-black/50 px-8 py-3.5 font-bold text-[#8fc2f5]"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div>
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">All Wheels</h2>

              <p className="text-xs text-blue-100/70">
                {pagination.total} Wheel(s)
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8fc2f5]/60" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search Wheels..."
                  className="h-11 rounded-xl border border-blue-300/25 bg-black/50 pl-10 pr-3 text-sm outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 cursor-pointer rounded-xl border border-blue-300/25 bg-black/50 px-3 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {loading ? (
            <EmptyState text="Loading Wheels..." />
          ) : wheels.length === 0 ? (
            <EmptyState text="No Wheels found" />
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {wheels.map((wheel) => (
                <WheelCard
                  key={wheel._id}
                  wheel={wheel}
                  resolveImage={resolveImage}
                  formatDate={formatDate}
                  statusUpdating={statusUpdatingId === wheel._id}
                  onEdit={() => startEdit(wheel)}
                  onStatus={() => handleStatusChange(wheel)}
                  onDelete={() => setDeleteConfirmId(wheel._id)}
                />
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => page - 1)}
                className="cursor-pointer rounded-lg bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="rounded-lg bg-black/50 px-4 py-2 text-white">
                {currentPage} / {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
                className="cursor-pointer rounded-lg bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-blue-300/25 bg-[#0b1220] p-6">
            <h3 className="text-xl font-bold text-white">Delete Wheel?</h3>

            <p className="mt-2 text-sm text-white/60">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="cursor-pointer rounded-lg bg-white/10 px-4 py-2"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 font-bold disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <section className="mb-6 rounded-2xl border border-blue-300/20 bg-black/40 p-5 shadow-xl">
    <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
      {icon}
      {title}
    </h2>

    {children}
  </section>
);

const Label = ({ children }) => (
  <label className="mb-2 block text-xs font-bold text-blue-100/80">
    {children}
  </label>
);

const Input = ({ label, value, onChange }) => (
  <div>
    <Label>{label}</Label>

    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-xl border border-blue-300/25 bg-black/50 px-3 text-sm outline-none focus:border-[#63a8ee]"
    />
  </div>
);

const NumberInput = ({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = "any",
  disabled = false,
}) => (
  <div>
    <Label>{label}</Label>

    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-xl border border-blue-300/25 bg-black/50 px-3 text-sm outline-none focus:border-[#63a8ee] disabled:cursor-not-allowed disabled:opacity-40"
    />
  </div>
);

const TextArea = ({ label, value, onChange }) => (
  <div>
    <Label>{label}</Label>

    <textarea
      value={value}
      rows={4}
      onChange={(event) => onChange(event.target.value)}
      className="w-full resize-none rounded-xl border border-blue-300/25 bg-black/50 p-3 text-sm outline-none focus:border-[#63a8ee]"
    />
  </div>
);

const DateInput = ({ label, value, onChange }) => (
  <div>
    <Label>{label}</Label>

    <input
      type="datetime-local"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full cursor-pointer rounded-xl border border-blue-300/25 bg-black/50 px-3 text-sm outline-none"
    />
  </div>
);

const ColorInput = ({ label, value, onChange }) => (
  <div>
    <Label>{label}</Label>

    <div className="flex h-11 overflow-hidden rounded-xl border border-blue-300/25 bg-black/50">
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full w-12 cursor-pointer border-0 bg-transparent"
      />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none"
      />
    </div>
  </div>
);

const ImageUpload = ({ label, description, preview, onChange, required }) => (
  <div>
    <Label>
      {label}
      {required && <span className="ml-1 text-red-400">*</span>}
    </Label>

    <input
      type="file"
      accept="image/*"
      onChange={onChange}
      className="w-full cursor-pointer rounded-xl border border-blue-300/25 bg-black/50 px-4 py-3 text-sm file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-[#63a8ee] file:to-[#2f79c9] file:px-4 file:py-2 file:font-bold file:text-white"
    />

    <p className="mt-2 text-[11px] text-blue-100/70">{description}</p>

    {preview && (
      <img
        src={preview}
        alt={label}
        className="mt-4 h-52 w-full rounded-xl border border-blue-300/20 object-cover"
      />
    )}
  </div>
);

const SegmentEditor = ({ index, segment, onChange }) => (
  <div className="rounded-xl border border-blue-300/20 bg-black/40 p-4">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-bold text-white">Segment {index + 1}</h3>

      <label className="flex cursor-pointer items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={segment.isActive}
          onChange={(event) =>
            onChange(index, "isActive", event.target.checked)
          }
          className="cursor-pointer accent-[#63a8ee]"
        />
        Active
      </label>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Input
        label="Text (Bangla)"
        value={segment.text.bn}
        onChange={(value) => onChange(index, "textBn", value)}
      />

      <Input
        label="Text (English)"
        value={segment.text.en}
        onChange={(value) => onChange(index, "textEn", value)}
      />

      <div>
        <Label>Prize Type</Label>

        <select
          value={segment.prizeType}
          onChange={(event) => onChange(index, "prizeType", event.target.value)}
          className="h-11 w-full cursor-pointer rounded-xl border border-blue-300/25 bg-black/50 px-3 text-sm"
        >
          <option value="balance">Balance</option>
          <option value="reward_coin">Reward Coin</option>
          <option value="no_prize">No Prize</option>
        </select>
      </div>

      <NumberInput
        label="Prize Amount"
        value={segment.amount}
        disabled={segment.prizeType === "no_prize"}
        onChange={(value) => onChange(index, "amount", value)}
      />

      <NumberInput
        label="Probability (%)"
        value={segment.probability}
        max={100}
        disabled={!segment.isActive}
        onChange={(value) => onChange(index, "probability", value)}
      />

      <NumberInput
        label="Turnover Multiple"
        value={segment.turnoverMultiplier}
        disabled={segment.prizeType !== "balance"}
        onChange={(value) => onChange(index, "turnoverMultiplier", value)}
      />

      <ColorInput
        label="Background Color"
        value={segment.backgroundColor}
        onChange={(value) => onChange(index, "backgroundColor", value)}
      />

      <ColorInput
        label="Text Color"
        value={segment.textColor}
        onChange={(value) => onChange(index, "textColor", value)}
      />
    </div>
  </div>
);

const WheelCard = ({
  wheel,
  resolveImage,
  formatDate,
  statusUpdating,
  onEdit,
  onStatus,
  onDelete,
}) => (
  <div className="overflow-hidden rounded-2xl border border-blue-300/20 bg-black/40 shadow-xl">
    <div className="grid grid-cols-2">
      <img
        src={resolveImage(wheel.backgroundImage)}
        alt="Background"
        className="h-36 w-full object-cover"
      />

      <img
        src={resolveImage(wheel.wheelImage)}
        alt={wheel.title?.en || "Wheel"}
        className="h-36 w-full object-cover"
      />
    </div>

    <div className="p-5">
      <div className="flex justify-between gap-3">
        <div>
          <h3 className="font-bold text-white">
            {wheel.title?.en || wheel.title?.bn}
          </h3>

          <p className="mt-1 text-xs text-blue-100/70">
            {wheel.spinCost} Coins / Spin
          </p>
        </div>

        <span
          className={`h-fit rounded-full px-3 py-1 text-[10px] font-bold ${
            wheel.isActive
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {wheel.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Info label="Start" value={formatDate(wheel.startAt)} />

        <Info label="End" value={formatDate(wheel.endAt)} />
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] px-3 py-2 text-xs font-bold text-white"
        >
          <FaEdit />
          Edit
        </button>

        <button
          type="button"
          disabled={statusUpdating}
          onClick={onStatus}
          className="cursor-pointer rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold disabled:cursor-not-allowed"
        >
          <FaSyncAlt className={statusUpdating ? "animate-spin" : ""} />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="cursor-pointer rounded-lg bg-red-600 px-3 py-2 text-xs font-bold"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  </div>
);

const Info = ({ label, value }) => (
  <div className="rounded-lg bg-white/5 p-2">
    <p className="text-[9px] uppercase text-white/35">{label}</p>

    <p className="mt-1 truncate text-[10px] font-bold text-blue-100/80">
      {value}
    </p>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="rounded-2xl border border-blue-300/20 bg-black/40 p-10 text-center text-blue-100/70">
    {text}
  </div>
);

export default WheelOfFortuneReward;
