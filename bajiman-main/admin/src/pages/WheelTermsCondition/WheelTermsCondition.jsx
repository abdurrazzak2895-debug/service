// src/pages/WheelTermsCondition/WheelTermsCondition.jsx

import React, { useCallback, useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaEye,
  FaFileContract,
  FaImage,
  FaPalette,
  FaSave,
  FaSyncAlt,
  FaToggleOff,
  FaToggleOn,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const defaultDesign = {
  pageBackgroundColor: "#172178",
  cardGradientFrom: "#172b88",
  cardGradientTo: "#4b4b4b",
  cardBorderColor: "#5364ba",
  cardBorderWidth: 1,
  cardBorderRadius: 18,
  cardShadowColor: "#000000",
  titleGradientFrom: "#ffb65c",
  titleGradientTo: "#c79b00",
  titleBorderColor: "#f5ca24",
  titleTextColor: "#ffffff",
  headingTextColor: "#ffffff",
  contentTextColor: "#ffffff",
  titleFontSize: 22,
  headingFontSize: 15,
  contentFontSize: 14,
  contentLineHeight: 1.8,
  maxWidth: 900,
};

const initialForm = {
  titleBn: "শর্তাবলী",
  titleEn: "Terms & Conditions",
  headingBn: "লাকি হুইল",
  headingEn: "LUCKY WHEEL",
  contentBn: "",
  contentEn: "",
  design: { ...defaultDesign },
  isActive: true,
};

const WheelTermsCondition = () => {
  const [form, setForm] = useState(initialForm);

  const [exists, setExists] = useState(false);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [statusUpdating, setStatusUpdating] = useState(false);

  const [previewLanguage, setPreviewLanguage] = useState("en");

  const [launcherIconUrl, setLauncherIconUrl] = useState("");
  const [launcherIconFile, setLauncherIconFile] = useState(null);
  const [launcherIconPreview, setLauncherIconPreview] = useState("");
  const [launcherIconSaving, setLauncherIconSaving] = useState(false);

  const loadTerms = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/admin/wheel-terms");

      const terms = data?.terms || null;

      setExists(Boolean(terms));

      setLauncherIconUrl(terms?.launcherIconUrl || "");
      setLauncherIconFile(null);
      setLauncherIconPreview("");

      if (!terms) {
        setForm({
          ...initialForm,
          design: {
            ...defaultDesign,
          },
        });

        return;
      }

      setForm({
        titleBn: terms.title?.bn || "শর্তাবলী",

        titleEn: terms.title?.en || "Terms & Conditions",

        headingBn: terms.heading?.bn || "লাকি হুইল",

        headingEn: terms.heading?.en || "LUCKY WHEEL",

        contentBn: terms.content?.bn || "",

        contentEn: terms.content?.en || "",

        design: {
          ...defaultDesign,
          ...(terms.design || {}),
        },

        isActive: terms.isActive !== false,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load Wheel Terms & Conditions",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

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

  const validateForm = () => {
    if (!form.titleBn.trim()) {
      toast.error("Bangla title is required");

      return false;
    }

    if (!form.titleEn.trim()) {
      toast.error("English title is required");

      return false;
    }

    if (!form.headingBn.trim()) {
      toast.error("Bangla heading is required");

      return false;
    }

    if (!form.headingEn.trim()) {
      toast.error("English heading is required");

      return false;
    }

    if (!form.contentBn.trim()) {
      toast.error("Bangla Terms content is required");

      return false;
    }

    if (!form.contentEn.trim()) {
      toast.error("English Terms content is required");

      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload = {
        title: {
          bn: form.titleBn.trim(),
          en: form.titleEn.trim(),
        },

        heading: {
          bn: form.headingBn.trim(),
          en: form.headingEn.trim(),
        },

        content: {
          bn: form.contentBn.trim(),
          en: form.contentEn.trim(),
        },

        design: {
          ...form.design,

          cardBorderWidth: Number(form.design.cardBorderWidth || 0),

          cardBorderRadius: Number(form.design.cardBorderRadius || 0),

          titleFontSize: Number(form.design.titleFontSize || 22),

          headingFontSize: Number(form.design.headingFontSize || 15),

          contentFontSize: Number(form.design.contentFontSize || 14),

          contentLineHeight: Number(form.design.contentLineHeight || 1.8),

          maxWidth: Number(form.design.maxWidth || 900),
        },

        isActive: form.isActive,
      };

      if (exists) {
        await api.put("/api/admin/wheel-terms", payload);

        toast.success("Wheel Terms & Conditions updated successfully");
      } else {
        await api.post("/api/admin/wheel-terms", payload);

        toast.success("Wheel Terms & Conditions created successfully");
      }

      await loadTerms();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to save Wheel Terms & Conditions",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async () => {
    if (!exists) {
      toast.error("Create Wheel Terms & Conditions first");

      return;
    }

    const nextStatus = !form.isActive;

    try {
      setStatusUpdating(true);

      const { data } = await api.patch("/api/admin/wheel-terms/status", {
        isActive: nextStatus,
      });

      setForm((previous) => ({
        ...previous,
        isActive: data?.terms?.isActive ?? nextStatus,
      }));

      toast.success(
        nextStatus ? "Wheel Terms activated" : "Wheel Terms deactivated",
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const resetDesign = () => {
    setForm((previous) => ({
      ...previous,

      design: {
        ...defaultDesign,
      },
    }));

    toast.success("Default design restored");
  };

  const handleLauncherIconChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLauncherIconFile(file);
    setLauncherIconPreview(URL.createObjectURL(file));
  };

  const saveLauncherIcon = async () => {
    if (!exists) {
      toast.error("Create Wheel Terms & Conditions first");
      return;
    }

    if (!launcherIconFile) {
      toast.error("Choose an icon image first");
      return;
    }

    try {
      setLauncherIconSaving(true);

      const fd = new FormData();
      fd.append("launcherIcon", launcherIconFile);

      const { data } = await api.patch(
        "/api/admin/wheel-terms/launcher-icon",
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setLauncherIconUrl(data?.terms?.launcherIconUrl || "");
      setLauncherIconFile(null);
      setLauncherIconPreview("");

      toast.success("Launcher icon updated successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update launcher icon",
      );
    } finally {
      setLauncherIconSaving(false);
    }
  };

  const removeLauncherIcon = async () => {
    if (!exists) return;

    try {
      setLauncherIconSaving(true);

      const fd = new FormData();
      fd.append("removeLauncherIcon", "true");

      await api.patch("/api/admin/wheel-terms/launcher-icon", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setLauncherIconUrl("");
      setLauncherIconFile(null);
      setLauncherIconPreview("");

      toast.success("Launcher icon removed");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to remove launcher icon",
      );
    } finally {
      setLauncherIconSaving(false);
    }
  };

  const previewTitle = previewLanguage === "bn" ? form.titleBn : form.titleEn;

  const previewHeading =
    previewLanguage === "bn" ? form.headingBn : form.headingEn;

  const previewContent =
    previewLanguage === "bn" ? form.contentBn : form.contentEn;

  const launcherIconSrc = launcherIconPreview || launcherIconUrl;

  if (loading) {
    return <TermsLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#2f79c9]/20 to-black p-4 text-white lg:p-6">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="flex items-center gap-3 bg-gradient-to-r from-[#8fc2f5] via-white to-[#63a8ee] bg-clip-text text-2xl font-black text-transparent lg:text-3xl">
              <FaFileContract className="text-[#63a8ee]" />
              Wheel Terms & Conditions
            </h1>

            <p className="mt-2 text-sm text-blue-100/80">
              Create and control the Wheel Terms & Conditions displayed on the
              Client site.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge active={form.isActive} exists={exists} />

            <button
              type="button"
              disabled={!exists || statusUpdating}
              onClick={handleStatusChange}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                !exists || statusUpdating
                  ? "cursor-not-allowed bg-gray-800 text-gray-500"
                  : form.isActive
                    ? "cursor-pointer bg-red-700/80 text-red-100 hover:bg-red-600"
                    : "cursor-pointer bg-emerald-700/80 text-emerald-100 hover:bg-emerald-600"
              }`}
            >
              {statusUpdating ? (
                <FaSyncAlt className="animate-spin" />
              ) : form.isActive ? (
                <FaToggleOn />
              ) : (
                <FaToggleOff />
              )}

              {statusUpdating
                ? "Updating..."
                : form.isActive
                  ? "Deactivate"
                  : "Activate"}
            </button>
          </div>
        </div>

        {/* Singleton notification */}
        <div
          className={`mb-6 rounded-xl border p-4 ${
            exists
              ? "border-emerald-600/40 bg-emerald-900/15"
              : "border-blue-300/30 bg-[#2f79c9]/10"
          }`}
        >
          <div className="flex items-start gap-3">
            <FaCheckCircle
              className={
                exists ? "mt-0.5 text-emerald-400" : "mt-0.5 text-[#63a8ee]"
              }
            />

            <div>
              <p
                className={`font-bold ${
                  exists ? "text-emerald-300" : "text-[#8fc2f5]"
                }`}
              >
                {exists
                  ? "Wheel Terms & Conditions already created"
                  : "No Wheel Terms & Conditions created yet"}
              </p>

              <p className="mt-1 text-xs text-white/50">
                {exists
                  ? "Only one Terms setting is allowed. Saving will update the existing setting."
                  : "Only one Terms setting can be created in the system."}
              </p>
            </div>
          </div>
        </div>

        {/* Launcher icon */}
        <AdminSection title="Home Page Launcher Icon" icon={<FaImage />}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-blue-300/25 bg-black/40">
              {launcherIconSrc ? (
                <img
                  src={launcherIconSrc}
                  alt="Launcher Icon"
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <FaImage className="text-2xl text-[#8fc2f5]/40" />
              )}
            </div>

            <div className="flex-1">
              <p className="mb-2 text-xs text-blue-100/70">
                This icon floats on the client home page (above the Check-In
                icon). Clicking it opens the full Wheel of Fortune page.
              </p>

              <div className="flex flex-wrap gap-2">
                <label
                  htmlFor="wheel-launcher-icon-input"
                  className="cursor-pointer rounded-xl border border-blue-300/25 bg-black/50 px-4 py-2 text-xs font-bold text-[#8fc2f5] transition hover:border-[#63a8ee]"
                >
                  Choose Icon
                </label>

                <input
                  id="wheel-launcher-icon-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLauncherIconChange}
                />

                <button
                  type="button"
                  disabled={!launcherIconFile || launcherIconSaving}
                  onClick={saveLauncherIcon}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    !launcherIconFile || launcherIconSaving
                      ? "cursor-not-allowed bg-gray-800 text-gray-500"
                      : "cursor-pointer bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white hover:from-[#7bb7f1] hover:to-[#3b88db]"
                  }`}
                >
                  {launcherIconSaving ? "Saving..." : "Save Icon"}
                </button>

                {launcherIconUrl && (
                  <button
                    type="button"
                    disabled={launcherIconSaving}
                    onClick={removeLauncherIcon}
                    className="cursor-pointer rounded-xl border border-red-700/50 bg-red-900/30 px-4 py-2 text-xs font-bold text-red-300 transition hover:bg-red-800/40"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </AdminSection>

        <form onSubmit={handleSubmit}>
          {/* Text content */}
          <AdminSection title="Terms Content" icon={<FaFileContract />}>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {/* Bangla */}
              <div className="rounded-2xl border border-blue-300/20 bg-black/40 p-4">
                <h3 className="mb-4 font-bold text-white">Bangla Content</h3>

                <div className="space-y-4">
                  <TextInput
                    label="Title (Bangla)"
                    value={form.titleBn}
                    onChange={(value) => handleBasicChange("titleBn", value)}
                  />

                  <TextInput
                    label="Heading (Bangla)"
                    value={form.headingBn}
                    onChange={(value) => handleBasicChange("headingBn", value)}
                  />

                  <TextArea
                    label="Terms Content (Bangla)"
                    value={form.contentBn}
                    placeholder={`উদাহরণ:

লাকি হুইল

রেজিস্ট্রেশন, ডিপোজিট অথবা রেফার করার মাধ্যমে রিওয়ার্ড কয়েন সংগ্রহ করুন।

কয়েন পাওয়ার নিয়ম:

ডিপোজিট - প্রতিদিন সর্বনিম্ন ৳২০০ ডিপোজিট করুন।

শর্তাবলী:

১. একজন সদস্য প্রতিদিন সর্বোচ্চ ১০ বার স্পিন করতে পারবেন।

২. প্রস্কার উত্তোলনের আগে প্রয়োজনীয় টার্নওভার সম্পন্ন করতে হবে।`}
                    onChange={(value) => handleBasicChange("contentBn", value)}
                  />
                </div>
              </div>

              {/* English */}
              <div className="rounded-2xl border border-blue-300/20 bg-black/40 p-4">
                <h3 className="mb-4 font-bold text-white">English Content</h3>

                <div className="space-y-4">
                  <TextInput
                    label="Title (English)"
                    value={form.titleEn}
                    onChange={(value) => handleBasicChange("titleEn", value)}
                  />

                  <TextInput
                    label="Heading (English)"
                    value={form.headingEn}
                    onChange={(value) => handleBasicChange("headingEn", value)}
                  />

                  <TextArea
                    label="Terms Content (English)"
                    value={form.contentEn}
                    placeholder={`Example:

LUCKY WHEEL

Collect Reward Coins when you register, deposit or refer a friend.

How to get Coins:

Deposit - Make a minimum deposit of ৳200 per day.

Terms & Conditions:

1. Members are allowed to Spin the Wheel a maximum of 10 times per day.

2. Members must complete the required turnover before withdrawal.`}
                    onChange={(value) => handleBasicChange("contentEn", value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label className="flex w-fit cursor-pointer items-center gap-3 rounded-xl border border-blue-300/20 bg-black/50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    handleBasicChange("isActive", event.target.checked)
                  }
                  className="h-4 w-4 cursor-pointer accent-[#63a8ee]"
                />

                <span className="text-sm font-bold text-blue-100">
                  Active after Save
                </span>
              </label>
            </div>
          </AdminSection>

          {/* Design controls */}
          <AdminSection
            title="Color & Design Control"
            icon={<FaPalette />}
            action={
              <button
                type="button"
                onClick={resetDesign}
                className="cursor-pointer rounded-lg border border-blue-300/25 bg-black/50 px-3 py-2 text-xs font-bold text-[#8fc2f5] transition hover:bg-[#2f79c9]/20"
              >
                Reset Design
              </button>
            }
          >
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              <ColorInput
                label="Page Background"
                value={form.design.pageBackgroundColor}
                onChange={(value) =>
                  handleDesignChange("pageBackgroundColor", value)
                }
              />

              <ColorInput
                label="Card Gradient Start"
                value={form.design.cardGradientFrom}
                onChange={(value) =>
                  handleDesignChange("cardGradientFrom", value)
                }
              />

              <ColorInput
                label="Card Gradient End"
                value={form.design.cardGradientTo}
                onChange={(value) =>
                  handleDesignChange("cardGradientTo", value)
                }
              />

              <ColorInput
                label="Card Border"
                value={form.design.cardBorderColor}
                onChange={(value) =>
                  handleDesignChange("cardBorderColor", value)
                }
              />

              <ColorInput
                label="Card Shadow"
                value={form.design.cardShadowColor}
                onChange={(value) =>
                  handleDesignChange("cardShadowColor", value)
                }
              />

              <ColorInput
                label="Title Gradient Start"
                value={form.design.titleGradientFrom}
                onChange={(value) =>
                  handleDesignChange("titleGradientFrom", value)
                }
              />

              <ColorInput
                label="Title Gradient End"
                value={form.design.titleGradientTo}
                onChange={(value) =>
                  handleDesignChange("titleGradientTo", value)
                }
              />

              <ColorInput
                label="Title Border"
                value={form.design.titleBorderColor}
                onChange={(value) =>
                  handleDesignChange("titleBorderColor", value)
                }
              />

              <ColorInput
                label="Title Text"
                value={form.design.titleTextColor}
                onChange={(value) =>
                  handleDesignChange("titleTextColor", value)
                }
              />

              <ColorInput
                label="Heading Text"
                value={form.design.headingTextColor}
                onChange={(value) =>
                  handleDesignChange("headingTextColor", value)
                }
              />

              <ColorInput
                label="Content Text"
                value={form.design.contentTextColor}
                onChange={(value) =>
                  handleDesignChange("contentTextColor", value)
                }
              />

              <NumberInput
                label="Card Border Width"
                value={form.design.cardBorderWidth}
                min={0}
                max={20}
                step={1}
                onChange={(value) =>
                  handleDesignChange("cardBorderWidth", value)
                }
              />

              <NumberInput
                label="Card Radius"
                value={form.design.cardBorderRadius}
                min={0}
                max={60}
                step={1}
                onChange={(value) =>
                  handleDesignChange("cardBorderRadius", value)
                }
              />

              <NumberInput
                label="Title Font Size"
                value={form.design.titleFontSize}
                min={12}
                max={60}
                step={1}
                onChange={(value) => handleDesignChange("titleFontSize", value)}
              />

              <NumberInput
                label="Heading Font Size"
                value={form.design.headingFontSize}
                min={10}
                max={50}
                step={1}
                onChange={(value) =>
                  handleDesignChange("headingFontSize", value)
                }
              />

              <NumberInput
                label="Content Font Size"
                value={form.design.contentFontSize}
                min={10}
                max={40}
                step={1}
                onChange={(value) =>
                  handleDesignChange("contentFontSize", value)
                }
              />

              <NumberInput
                label="Content Line Height"
                value={form.design.contentLineHeight}
                min={1}
                max={4}
                step={0.1}
                onChange={(value) =>
                  handleDesignChange("contentLineHeight", value)
                }
              />

              <NumberInput
                label="Maximum Width"
                value={form.design.maxWidth}
                min={300}
                max={1800}
                step={10}
                onChange={(value) => handleDesignChange("maxWidth", value)}
              />
            </div>
          </AdminSection>

          {/* Live preview */}
          <AdminSection
            title="Live Preview"
            icon={<FaEye />}
            action={
              <div className="flex rounded-lg border border-blue-300/25 bg-black/50 p-1">
                <button
                  type="button"
                  onClick={() => setPreviewLanguage("bn")}
                  className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-bold ${
                    previewLanguage === "bn"
                      ? "bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white"
                      : "text-blue-100/70"
                  }`}
                >
                  বাংলা
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewLanguage("en")}
                  className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-bold ${
                    previewLanguage === "en"
                      ? "bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white"
                      : "text-blue-100/70"
                  }`}
                >
                  English
                </button>
              </div>
            }
          >
            <TermsPreview
              title={previewTitle}
              heading={previewHeading}
              content={previewContent}
              design={form.design}
            />
          </AdminSection>

          {/* Save */}
          <div className="mb-10 flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={saving}
              className={`flex min-w-[190px] items-center justify-center gap-2 rounded-xl px-8 py-3.5 font-bold transition ${
                saving
                  ? "cursor-not-allowed bg-gray-700 text-gray-400"
                  : "cursor-pointer bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white hover:from-[#7bb7f1] hover:to-[#3b88db]"
              }`}
            >
              {saving ? <FaSyncAlt className="animate-spin" /> : <FaSave />}

              {saving ? "Saving..." : exists ? "Update Terms" : "Create Terms"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ======================================================
   TERMS PREVIEW
====================================================== */

const TermsPreview = ({ title, heading, content, design }) => {
  const cardShadow = `${design.cardShadowColor} 0px 18px 40px -12px`;

  return (
    <div
      className="overflow-hidden rounded-xl px-3 py-12 sm:px-6"
      style={{
        backgroundColor: design.pageBackgroundColor,
      }}
    >
      <div
        className="relative mx-auto px-5 pb-8 pt-14 sm:px-10 sm:pb-12 sm:pt-16"
        style={{
          maxWidth: `${Number(design.maxWidth || 900)}px`,

          minHeight: "420px",

          background: `linear-gradient(180deg, ${design.cardGradientFrom}, ${design.cardGradientTo})`,

          border: `${Number(
            design.cardBorderWidth || 0,
          )}px solid ${design.cardBorderColor}`,

          borderRadius: `${Number(design.cardBorderRadius || 0)}px`,

          boxShadow: cardShadow,
        }}
      >
        {/* Floating title badge */}
        <div
          className="absolute left-1/2 top-0 flex min-w-[230px] -translate-x-1/2 -translate-y-1/2 items-center justify-center px-6 py-3 text-center font-extrabold shadow-lg sm:min-w-[290px]"
          style={{
            background: `linear-gradient(180deg, ${design.titleGradientFrom}, ${design.titleGradientTo})`,

            border: `2px solid ${design.titleBorderColor}`,

            borderRadius: "15px",

            color: design.titleTextColor,

            fontSize: `${Number(design.titleFontSize || 22)}px`,

            boxShadow: `0 5px 0 ${design.titleBorderColor}66, 0 10px 18px ${design.cardShadowColor}88`,
          }}
        >
          {title || "Terms & Conditions"}
        </div>

        <h3
          className="font-extrabold"
          style={{
            color: design.headingTextColor,

            fontSize: `${Number(design.headingFontSize || 15)}px`,
          }}
        >
          {heading || "LUCKY WHEEL"}
        </h3>

        <div
          className="mt-5 whitespace-pre-line break-words font-medium"
          style={{
            color: design.contentTextColor,

            fontSize: `${Number(design.contentFontSize || 14)}px`,

            lineHeight: Number(design.contentLineHeight || 1.8),
          }}
        >
          {content || "Your Terms & Conditions content will appear here."}
        </div>
      </div>
    </div>
  );
};

/* ======================================================
   SMALL COMPONENTS
====================================================== */

const AdminSection = ({ title, icon, action, children }) => (
  <section className="mb-6 rounded-2xl border border-blue-300/20 bg-black/40 p-4 shadow-xl lg:p-5">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-lg font-bold text-white">
        {icon}
        {title}
      </h2>

      {action}
    </div>

    {children}
  </section>
);

const TextInput = ({ label, value, onChange }) => (
  <div>
    <Label>{label}</Label>

    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-xl border border-blue-300/25 bg-black/50 px-3 text-sm text-white outline-none transition focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25"
    />
  </div>
);

const TextArea = ({ label, value, placeholder, onChange }) => (
  <div>
    <Label>{label}</Label>

    <textarea
      value={value}
      placeholder={placeholder}
      rows={18}
      onChange={(event) => onChange(event.target.value)}
      className="w-full resize-y rounded-xl border border-blue-300/25 bg-black/50 p-4 text-sm leading-6 text-white placeholder-white/20 outline-none transition focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25"
    />

    <p className="mt-2 text-right text-[10px] text-blue-100/60">
      {value.length.toLocaleString()} characters
    </p>
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
        className="min-w-0 flex-1 bg-transparent px-2 text-xs text-white outline-none"
      />
    </div>
  </div>
);

const NumberInput = ({ label, value, min, max, step, onChange }) => (
  <div>
    <Label>{label}</Label>

    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-xl border border-blue-300/25 bg-black/50 px-3 text-sm text-white outline-none transition focus:border-[#63a8ee]"
    />
  </div>
);

const Label = ({ children }) => (
  <label className="mb-2 block text-xs font-bold text-blue-100/80">
    {children}
  </label>
);

const StatusBadge = ({ active, exists }) => {
  if (!exists) {
    return (
      <span className="rounded-full border border-gray-600/40 bg-gray-700/30 px-4 py-2 text-xs font-bold text-gray-400">
        Not Created
      </span>
    );
  }

  return (
    <span
      className={`rounded-full border px-4 py-2 text-xs font-bold ${
        active
          ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
          : "border-red-500/30 bg-red-500/15 text-red-400"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
};

const TermsLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-[#2f79c9]/20 to-black">
    <div className="text-center">
      <FaSyncAlt className="mx-auto animate-spin text-5xl text-[#63a8ee]" />

      <p className="mt-4 text-sm font-bold text-blue-100/70">
        Loading Wheel Terms...
      </p>
    </div>
  </div>
);

export default WheelTermsCondition;
