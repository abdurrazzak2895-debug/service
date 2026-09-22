// src/pages/CheckInReward/CheckInReward.jsx

import React, { useEffect, useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaCoins,
  FaImage,
  FaPlus,
  FaSave,
  FaSpinner,
  FaTrash,
  FaWallet,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const makeLocal = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createReward = () => ({
  localId: makeLocal(),
  rewardType: "balance",
  amount: "",
  icon: "",
  iconFile: null,
  iconPreview: "",
});

const createDay = (dayNumber) => ({
  localId: makeLocal(),
  dayNumber,

  dayName: {
    bn: `দিন ${dayNumber}`,
    en: `Day ${dayNumber}`,
  },

  rewards: [createReward()],
});

const initialForm = {
  titleBn: "দৈনিক চেক ইন",
  titleEn: "Daily Check In",

  descriptionBn: "প্রতিদিন চেক ইন করুন এবং আপনার দৈনিক প্রস্কার সংগ্রহ করুন।",
  descriptionEn: "Check in daily and collect your daily reward.",

  days: [createDay(1)],
  isActive: true,

  launcherIcon: "",
  launcherIconUrl: "",
  launcherIconFile: null,
  launcherIconPreview: "",
  removeLauncherIcon: false,
};

const CheckInReward = () => {
  const [settingId, setSettingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [version, setVersion] = useState(1);

  const loadSetting = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/admin/check-in-reward");

      const setting = data?.data;

      if (!setting) {
        setSettingId(null);
        setForm(initialForm);
        setVersion(1);
        return;
      }

      setSettingId(setting._id);
      setVersion(setting.version || 1);

      setForm({
        titleBn: setting.title?.bn || "দৈনিক চেক ইন",
        titleEn: setting.title?.en || "Daily Check In",

        descriptionBn: setting.description?.bn || "",
        descriptionEn: setting.description?.en || "",

        days:
          Array.isArray(setting.days) && setting.days.length > 0
            ? [...setting.days]
                .sort((a, b) => a.dayNumber - b.dayNumber)
                .map((day, index) => ({
                  localId: makeLocal(),
                  dayNumber: index + 1,

                  dayName: {
                    bn: day.dayName?.bn || `দিন ${index + 1}`,
                    en: day.dayName?.en || `Day ${index + 1}`,
                  },

                  rewards:
                    Array.isArray(day.rewards) && day.rewards.length > 0
                      ? day.rewards.map((reward) => ({
                          localId: makeLocal(),
                          rewardType: reward.rewardType || "balance",
                          amount: reward.amount ?? "",
                          icon: reward.icon || "",
                          iconUrl: reward.iconUrl || "",
                          iconFile: null,
                          iconPreview: "",
                        }))
                      : [createReward()],
                }))
            : [createDay(1)],

        isActive: setting.isActive !== false,

        launcherIcon: setting.launcherIcon || "",
        launcherIconUrl: setting.launcherIconUrl || "",
        launcherIconFile: null,
        launcherIconPreview: "",
        removeLauncherIcon: false,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load Check-In setting",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSetting();
  }, []);

  const summary = useMemo(() => {
    return form.days.reduce(
      (result, day) => {
        day.rewards.forEach((reward) => {
          const amount = Number(reward.amount || 0);

          if (reward.rewardType === "balance") result.balance += amount;
          if (reward.rewardType === "reward_coin")
            result.rewardCoin += amount;
        });

        return result;
      },
      { balance: 0, rewardCoin: 0 },
    );
  }, [form.days]);

  const handleTextChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const updateDayName = (dayIndex, language, value) => {
    setForm((previous) => {
      const days = [...previous.days];

      days[dayIndex] = {
        ...days[dayIndex],
        dayName: { ...days[dayIndex].dayName, [language]: value },
      };

      return { ...previous, days };
    });
  };

  const updateReward = (dayIndex, rewardIndex, field, value) => {
    setForm((previous) => {
      const days = [...previous.days];
      const rewards = [...days[dayIndex].rewards];

      rewards[rewardIndex] = { ...rewards[rewardIndex], [field]: value };
      days[dayIndex] = { ...days[dayIndex], rewards };

      return { ...previous, days };
    });
  };

  const updateRewardIcon = (dayIndex, rewardIndex, file) => {
    if (!file) return;

    setForm((previous) => {
      const days = [...previous.days];
      const rewards = [...days[dayIndex].rewards];

      rewards[rewardIndex] = {
        ...rewards[rewardIndex],
        iconFile: file,
        iconPreview: URL.createObjectURL(file),
      };

      days[dayIndex] = { ...days[dayIndex], rewards };

      return { ...previous, days };
    });
  };

  const addReward = (dayIndex) => {
    setForm((previous) => {
      const days = [...previous.days];

      if (days[dayIndex].rewards.length >= 5) {
        toast.info("Maximum 5 rewards are allowed per day");
        return previous;
      }

      days[dayIndex] = {
        ...days[dayIndex],
        rewards: [...days[dayIndex].rewards, createReward()],
      };

      return { ...previous, days };
    });
  };

  const removeReward = (dayIndex, rewardIndex) => {
    setForm((previous) => {
      const days = [...previous.days];

      if (days[dayIndex].rewards.length <= 1) {
        toast.error("At least one reward is required per day");
        return previous;
      }

      days[dayIndex] = {
        ...days[dayIndex],
        rewards: days[dayIndex].rewards.filter((_, i) => i !== rewardIndex),
      };

      return { ...previous, days };
    });
  };

  const addDay = () => {
    if (form.days.length >= 7) {
      toast.info("Maximum 7 Check-In days are allowed");
      return;
    }

    const nextDayNumber = form.days.length + 1;

    setForm((previous) => ({
      ...previous,
      days: [...previous.days, createDay(nextDayNumber)],
    }));
  };

  const removeDay = (dayIndex) => {
    if (form.days.length <= 1) {
      toast.error("At least one Check-In day is required");
      return;
    }

    setForm((previous) => {
      const days = previous.days
        .filter((_, i) => i !== dayIndex)
        .map((day, i) => ({ ...day, dayNumber: i + 1 }));

      return { ...previous, days };
    });
  };

  const handleLauncherIconChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setForm((previous) => ({
      ...previous,
      launcherIconFile: file,
      launcherIconPreview: URL.createObjectURL(file),
      removeLauncherIcon: false,
    }));
  };

  const handleRemoveLauncherIcon = () => {
    setForm((previous) => ({
      ...previous,
      launcherIcon: "",
      launcherIconUrl: "",
      launcherIconFile: null,
      launcherIconPreview: "",
      removeLauncherIcon: true,
    }));

    const input = document.getElementById("launcher-icon-input");
    if (input) input.value = "";
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

    if (form.days.length < 1 || form.days.length > 7) {
      toast.error("You must create between 1 and 7 days");
      return false;
    }

    for (let dayIndex = 0; dayIndex < form.days.length; dayIndex += 1) {
      const day = form.days[dayIndex];

      if (!day.dayName?.bn?.trim()) {
        toast.error(`Bangla name is required for Day ${dayIndex + 1}`);
        return false;
      }

      if (!day.dayName?.en?.trim()) {
        toast.error(`English name is required for Day ${dayIndex + 1}`);
        return false;
      }

      if (!day.rewards.length) {
        toast.error(`At least one reward is required for Day ${dayIndex + 1}`);
        return false;
      }

      for (let rewardIndex = 0; rewardIndex < day.rewards.length; rewardIndex += 1) {
        const reward = day.rewards[rewardIndex];

        if (!["balance", "reward_coin"].includes(reward.rewardType)) {
          toast.error(
            `Invalid reward type for Day ${dayIndex + 1}, reward ${rewardIndex + 1}`,
          );
          return false;
        }

        const amount = Number(reward.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
          toast.error(
            `Enter a valid amount for Day ${dayIndex + 1}, reward ${rewardIndex + 1}`,
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      const fd = new FormData();

      fd.append("titleBn", form.titleBn.trim());
      fd.append("titleEn", form.titleEn.trim());
      fd.append("descriptionBn", form.descriptionBn.trim());
      fd.append("descriptionEn", form.descriptionEn.trim());
      fd.append("isActive", String(form.isActive));

      const daysPayload = form.days.map((day, dayIndex) => ({
        dayNumber: dayIndex + 1,

        dayName: {
          bn: day.dayName.bn.trim(),
          en: day.dayName.en.trim(),
        },

        rewards: day.rewards.map((reward) => ({
          rewardType: reward.rewardType,
          amount: Number(reward.amount),
          icon: reward.icon || "",
        })),
      }));

      fd.append("days", JSON.stringify(daysPayload));

      form.days.forEach((day, dayIndex) => {
        day.rewards.forEach((reward, rewardIndex) => {
          if (reward.iconFile instanceof File) {
            fd.append(
              `days.${dayIndex}.rewards.${rewardIndex}.icon`,
              reward.iconFile,
            );
          }
        });
      });

      if (form.launcherIconFile instanceof File) {
        fd.append("launcherIcon", form.launcherIconFile);
      } else if (form.removeLauncherIcon) {
        fd.append("removeLauncherIcon", "true");
      }

      if (settingId) {
        await api.put(`/api/admin/check-in-reward/${settingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Check-In reward updated successfully");
      } else {
        await api.post("/api/admin/check-in-reward", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Check-In reward created successfully");
      }

      await loadSetting();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to save Check-In reward",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async () => {
    if (!settingId) {
      setForm((previous) => ({ ...previous, isActive: !previous.isActive }));
      return;
    }

    const nextStatus = !form.isActive;

    try {
      setStatusUpdating(true);

      const { data } = await api.patch(
        `/api/admin/check-in-reward/${settingId}/status`,
        { isActive: nextStatus },
      );

      setForm((previous) => ({
        ...previous,
        isActive: data?.data?.isActive ?? nextStatus,
      }));

      toast.success(
        nextStatus
          ? "Check-In reward activated"
          : "Check-In reward deactivated",
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#2f79c9]/20 to-black p-6">
        <div className="mx-auto max-w-7xl space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl border border-blue-300/20 bg-black/50"
            />
          ))}
        </div>
      </div>
    );
  }

  const launcherIconSrc = form.launcherIconPreview || form.launcherIconUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#2f79c9]/20 to-black p-4 text-white lg:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-[#8fc2f5] via-white to-[#63a8ee] bg-clip-text text-2xl font-black text-transparent lg:text-3xl">
              {settingId ? "Update Check-In Reward" : "Create Check-In Reward"}
            </h1>

            <p className="mt-2 text-sm text-blue-100/80">
              Create a maximum of seven daily Check-In rewards. Each day can
              have multiple rewards, each with its own icon.
            </p>

            {settingId && (
              <p className="mt-1 text-xs text-blue-100/60">
                Configuration version: {version}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={statusUpdating}
            onClick={handleStatusChange}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
              form.isActive
                ? "bg-emerald-600 text-white hover:bg-emerald-500"
                : "bg-red-700 text-white hover:bg-red-600"
            } ${statusUpdating ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <FaCheckCircle />

            {statusUpdating
              ? "Updating..."
              : form.isActive
                ? "Active"
                : "Inactive"}
          </button>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={<FaCheckCircle />}
            label="Configured Days"
            value={`${form.days.length} / 7`}
          />

          <SummaryCard
            icon={<FaWallet />}
            label="Total Balance Reward"
            value={`৳${summary.balance.toLocaleString()}`}
          />

          <SummaryCard
            icon={<FaCoins />}
            label="Total Reward Coin"
            value={summary.rewardCoin.toLocaleString()}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* General setting */}
          <div className="mb-6 rounded-2xl border border-blue-300/20 bg-black/40 p-5 shadow-xl shadow-blue-900/20 backdrop-blur-md lg:p-7">
            <h2 className="mb-5 text-lg font-bold text-white">
              General Information
            </h2>

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
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
                <label className="mb-1 block text-sm font-semibold text-blue-100">
                  Launcher Icon
                </label>

                <p className="mb-2 text-xs text-blue-100/70">
                  This icon floats on the client home page. Clicking it opens
                  the Check-In popup.
                </p>

                <div className="flex flex-wrap gap-2">
                  <label
                    htmlFor="launcher-icon-input"
                    className="cursor-pointer rounded-xl border border-blue-300/25 bg-black/50 px-4 py-2 text-xs font-bold text-[#8fc2f5] transition hover:border-[#63a8ee]"
                  >
                    {launcherIconSrc ? "Change Icon" : "Upload Icon"}
                  </label>

                  {launcherIconSrc && (
                    <button
                      type="button"
                      onClick={handleRemoveLauncherIcon}
                      className="cursor-pointer rounded-xl border border-red-700/50 bg-red-900/30 px-4 py-2 text-xs font-bold text-red-300 transition hover:bg-red-800/40"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <input
                  id="launcher-icon-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLauncherIconChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <TextInput
                label="Title (Bangla)"
                value={form.titleBn}
                onChange={(value) => handleTextChange("titleBn", value)}
                placeholder="দৈনিক চেক ইন"
              />

              <TextInput
                label="Title (English)"
                value={form.titleEn}
                onChange={(value) => handleTextChange("titleEn", value)}
                placeholder="Daily Check In"
              />

              <TextArea
                label="Description (Bangla)"
                value={form.descriptionBn}
                onChange={(value) => handleTextChange("descriptionBn", value)}
                placeholder="বাংলা বিবরণ"
              />

              <TextArea
                label="Description (English)"
                value={form.descriptionEn}
                onChange={(value) => handleTextChange("descriptionEn", value)}
                placeholder="English description"
              />
            </div>
          </div>

          {/* Days */}
          <div className="rounded-2xl border border-blue-300/20 bg-black/40 p-5 shadow-xl shadow-blue-900/20 backdrop-blur-md lg:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Check-In Days
                </h2>

                <p className="mt-1 text-xs text-blue-100/70">
                  Users will claim one set of rewards every 24 hours.
                </p>
              </div>

              <button
                type="button"
                onClick={addDay}
                disabled={form.days.length >= 7}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  form.days.length >= 7
                    ? "cursor-not-allowed bg-gray-800 text-gray-500"
                    : "cursor-pointer bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white hover:from-[#7bb7f1] hover:to-[#3b88db]"
                }`}
              >
                <FaPlus />
                Add Day
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {form.days.map((day, dayIndex) => (
                <div
                  key={day.localId}
                  className="relative rounded-2xl border border-blue-300/20 bg-[#2f79c9]/10 p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] font-black text-white shadow-lg shadow-blue-700/40">
                        {dayIndex + 1}
                      </div>

                      <div>
                        <h3 className="font-bold text-white">
                          Day {dayIndex + 1}
                        </h3>

                        <p className="text-[10px] text-blue-100/60">
                          Check-In position
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={form.days.length <= 1}
                      onClick={() => removeDay(dayIndex)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                        form.days.length <= 1
                          ? "cursor-not-allowed bg-gray-800 text-gray-600"
                          : "cursor-pointer bg-red-800/60 text-red-300 hover:bg-red-700 hover:text-white"
                      }`}
                    >
                      <FaTrash size={13} />
                    </button>
                  </div>

                  <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextInput
                      label="Day Name (Bangla)"
                      value={day.dayName?.bn || ""}
                      onChange={(value) => updateDayName(dayIndex, "bn", value)}
                      placeholder={`দিন ${dayIndex + 1}`}
                    />

                    <TextInput
                      label="Day Name (English)"
                      value={day.dayName?.en || ""}
                      onChange={(value) => updateDayName(dayIndex, "en", value)}
                      placeholder={`Day ${dayIndex + 1}`}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wide text-blue-100/80">
                        Rewards
                      </label>

                      <button
                        type="button"
                        onClick={() => addReward(dayIndex)}
                        disabled={day.rewards.length >= 5}
                        className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
                          day.rewards.length >= 5
                            ? "cursor-not-allowed bg-gray-800 text-gray-500"
                            : "cursor-pointer bg-[#2f79c9]/15 text-[#8fc2f5] hover:bg-[#2f79c9]/25"
                        }`}
                      >
                        <FaPlus size={10} />
                        Add Reward
                      </button>
                    </div>

                    {day.rewards.map((reward, rewardIndex) => {
                      const iconSrc = reward.iconPreview || reward.iconUrl;
                      const inputId = `reward-icon-${day.localId}-${reward.localId}`;

                      return (
                        <div
                          key={reward.localId}
                          className="flex items-center gap-3 rounded-xl border border-blue-300/20 bg-black/40 p-3"
                        >
                          <label
                            htmlFor={inputId}
                            className="group relative flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-blue-300/25 bg-black/50 transition hover:border-[#63a8ee]"
                          >
                            {iconSrc ? (
                              <img
                                src={iconSrc}
                                alt="reward-icon"
                                className="h-full w-full object-contain p-1"
                              />
                            ) : reward.rewardType === "balance" ? (
                              <FaWallet className="text-[#8fc2f5]/50" />
                            ) : (
                              <FaCoins className="text-[#8fc2f5]/50" />
                            )}
                          </label>

                          <input
                            id={inputId}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) {
                                updateRewardIcon(dayIndex, rewardIndex, file);
                              }
                            }}
                          />

                          <select
                            value={reward.rewardType}
                            onChange={(event) =>
                              updateReward(
                                dayIndex,
                                rewardIndex,
                                "rewardType",
                                event.target.value,
                              )
                            }
                            className="h-11 cursor-pointer rounded-xl border border-blue-300/25 bg-black/50 px-2 text-xs text-white outline-none transition focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25"
                          >
                            <option value="balance">Main Balance</option>
                            <option value="reward_coin">Reward Coin</option>
                          </select>

                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={reward.amount}
                            onChange={(event) =>
                              updateReward(
                                dayIndex,
                                rewardIndex,
                                "amount",
                                event.target.value,
                              )
                            }
                            placeholder="Amount"
                            className="h-11 w-full min-w-0 flex-1 rounded-xl border border-blue-300/25 bg-black/50 px-3 text-sm text-white placeholder:text-blue-100/35 outline-none transition focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25"
                          />

                          <button
                            type="button"
                            disabled={day.rewards.length <= 1}
                            onClick={() => removeReward(dayIndex, rewardIndex)}
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                              day.rewards.length <= 1
                                ? "cursor-not-allowed bg-gray-800 text-gray-600"
                                : "cursor-pointer bg-red-800/60 text-red-300 hover:bg-red-700 hover:text-white"
                            }`}
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 rounded-2xl border border-blue-300/20 bg-black/40 p-5 shadow-xl lg:p-7">
            <h2 className="mb-5 text-lg font-bold text-white">
              Client Preview
            </h2>

            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-max items-center gap-4">
                {form.days.map((day, dayIndex) => (
                  <div
                    key={day.localId}
                    className="w-[130px] rounded-xl border border-blue-300/20 bg-[#292929] p-3 text-center"
                  >
                    <p className="truncate text-xs font-bold text-white">
                      {day.dayName?.en || `Day ${dayIndex + 1}`}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                      {day.rewards.map((reward) => {
                        const iconSrc = reward.iconPreview || reward.iconUrl;

                        return (
                          <div key={reward.localId} className="text-center">
                            <div className="mx-auto flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#63a8ee] to-[#2f79c9] text-white">
                              {iconSrc ? (
                                <img
                                  src={iconSrc}
                                  alt="reward"
                                  className="h-full w-full object-contain p-1"
                                />
                              ) : reward.rewardType === "balance" ? (
                                <FaWallet size={13} />
                              ) : (
                                <FaCoins size={13} />
                              )}
                            </div>

                            <p className="mt-1 text-[10px] font-extrabold text-[#8fc2f5]">
                              {reward.rewardType === "balance"
                                ? `৳${Number(reward.amount || 0)}`
                                : `${Number(reward.amount || 0)}`}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="mt-7 flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={saving}
              className={`flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-bold transition ${
                saving
                  ? "cursor-not-allowed bg-gray-700 text-gray-400"
                  : "cursor-pointer bg-gradient-to-r from-[#63a8ee] to-[#2f79c9] text-white shadow-lg shadow-blue-700/40 hover:from-[#7bb7f1] hover:to-[#3b88db]"
              }`}
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}

              {saving
                ? "Saving..."
                : settingId
                  ? "Update Check-In Reward"
                  : "Create Check-In Reward"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value }) => (
  <div className="rounded-xl border border-blue-300/20 bg-black/40 p-4 shadow-lg">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2f79c9]/15 text-xl text-[#63a8ee]">
        {icon}
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase text-blue-100/70">
          {label}
        </p>

        <p className="mt-1 text-lg font-extrabold text-white">{value}</p>
      </div>
    </div>
  </div>
);

const TextInput = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="mb-2 block text-xs font-medium text-blue-100/80">
      {label}
    </label>

    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-11 w-full rounded-xl border border-blue-300/25 bg-black/50 px-3 text-sm text-white placeholder:text-blue-100/35 outline-none transition focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25"
    />
  </div>
);

const TextArea = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="mb-2 block text-xs font-medium text-blue-100/80">
      {label}
    </label>

    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={4}
      className="w-full resize-none rounded-xl border border-blue-300/25 bg-black/50 px-3 py-3 text-sm text-white placeholder:text-blue-100/35 outline-none transition focus:border-[#63a8ee] focus:ring-2 focus:ring-[#2f79c9]/25"
    />
  </div>
);

export default CheckInReward;
