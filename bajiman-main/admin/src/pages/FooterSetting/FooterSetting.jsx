import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  Edit,
  Eye,
  ImagePlus,
  Loader2,
  PlusCircle,
  RotateCcw,
  Save,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL;

const localizedEmpty = { bn: "", en: "" };

const emptyFooter = {
  status: "active",

  paymentTitle: { bn: "পেমেন্ট মেথডস", en: "Payment Methods" },
  socialTitle: { bn: "সোশ্যাল নেটওয়ার্কস", en: "Social Networks" },
  sponsorTitle: { bn: "স্পন্সর", en: "Sponsor" },
  officialPartnerTitle: { bn: "অফিশিয়াল পার্টনার", en: "Official Partner" },
  ambassadorTitle: { bn: "ব্র্যান্ড অ্যাম্বাসেডর", en: "Brand Ambassador" },

  descriptionTitle: {
    bn: "Crickex - সবচেয়ে নির্ভরযোগ্য অনলাইন বেটিং সাইট",
    en: "Crickex - The Most Reliable Online Betting Site",
  },

  description: {
    bn: "ক্রিকেট, ফুটবল, কাবাডি, বাস্কেটবল, টেনিসসহ অসংখ্য স্পোর্টস বেটিং অপশনের মাধ্যমে Crickex বাংলাদেশে অন্যতম সেরা অনলাইন স্পোর্টস বেটিং সাইট এবং ক্যাসিনো প্ল্যাটফর্ম হিসেবে পরিচিত।",
    en: "With numerous sports betting options, including cricket, football, kabaddi, basketball, tennis, and many others, Crickex is one of the best online sports betting sites.",
  },

  readMoreText: { bn: "আরও পড়ুন", en: "Read More" },
  showLessText: { bn: "কম দেখুন", en: "Show Less" },

  footerQualityTitle: {
    bn: "সেরা মানের প্ল্যাটফর্ম",
    en: "Best Quality Platform",
  },

  copyrightText: "© 2026 CRICKEX Copyrights. All Rights Reserved",

  officialPartnerLink: "",

  footerLogo: "",
  officialPartnerImage: "",

  paymentMethods: [],
  socials: [],
  sponsors: [],
  ambassadors: [],
  links: [],

  footerBg: "#ffffff",
  footerText: "#111111",
  sectionTitleText: "#111111",
  dividerBg: "#d6d6d6",

  socialIconBg: "#0b66a8",
  socialIconText: "#ffffff",

  linkBorder: "#0b66a8",
  linkText: "#005daa",

  descriptionTitleText: "#444444",
  descriptionText: "#999999",

  readMoreButtonBg: "#006bb6",
  readMoreButtonText: "#ffffff",

  qualityTitleText: "#005daa",
  copyrightTextColor: "#888888",

  itemTitleText: "#111111",
  itemSubText: "#111111",
};

const colorFields = [
  ["footerBg", "Footer BG"],
  ["footerText", "Footer Text"],
  ["sectionTitleText", "Section Title Text"],
  ["dividerBg", "Divider BG"],
  ["socialIconBg", "Social Icon BG"],
  ["socialIconText", "Social Icon Text"],
  ["linkBorder", "Link Border"],
  ["linkText", "Link Text"],
  ["descriptionTitleText", "Description Title"],
  ["descriptionText", "Description Text"],
  ["readMoreButtonBg", "Read More Button BG"],
  ["readMoreButtonText", "Read More Button Text"],
  ["qualityTitleText", "Quality Title Text"],
  ["copyrightTextColor", "Copyright Text"],
  ["itemTitleText", "Item Title Text"],
  ["itemSubText", "Item Sub Text"],
];

const fileUrl = (path = "") => {
  if (!path) return "";
  if (String(path).startsWith("http")) return path;
  return `${API_URL}${String(path).startsWith("/") ? path : `/${path}`}`;
};

const makeLocal = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const inputClass =
  "w-full rounded-xl border border-[#1A79D3]/25 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#3ea0ff] focus:ring-2 focus:ring-[#1A79D3]/20";

const labelClass = "mb-2 block text-sm font-bold text-blue-100";

const normalizeFooter = (data = {}) => ({
  ...emptyFooter,
  ...data,

  paymentTitle: data.paymentTitle || emptyFooter.paymentTitle,
  socialTitle: data.socialTitle || emptyFooter.socialTitle,
  sponsorTitle: data.sponsorTitle || emptyFooter.sponsorTitle,
  officialPartnerTitle:
    data.officialPartnerTitle || emptyFooter.officialPartnerTitle,
  ambassadorTitle: data.ambassadorTitle || emptyFooter.ambassadorTitle,
  descriptionTitle: data.descriptionTitle || emptyFooter.descriptionTitle,
  description: data.description || emptyFooter.description,
  readMoreText: data.readMoreText || emptyFooter.readMoreText,
  showLessText: data.showLessText || emptyFooter.showLessText,
  footerQualityTitle: data.footerQualityTitle || emptyFooter.footerQualityTitle,

  paymentMethods: Array.isArray(data.paymentMethods) ? data.paymentMethods : [],
  socials: Array.isArray(data.socials) ? data.socials : [],
  sponsors: Array.isArray(data.sponsors) ? data.sponsors : [],
  ambassadors: Array.isArray(data.ambassadors) ? data.ambassadors : [],
  links: Array.isArray(data.links) ? data.links : [],
});

const FooterSetting = () => {
  const [form, setForm] = useState(emptyFooter);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [footerLogoFile, setFooterLogoFile] = useState(null);
  const [partnerImageFile, setPartnerImageFile] = useState(null);

  const [footerLogoPreview, setFooterLogoPreview] = useState("");
  const [partnerImagePreview, setPartnerImagePreview] = useState("");

  const setLocalized = (field, lang, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || localizedEmpty),
        [lang]: value,
      },
    }));
  };

  const setColor = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const loadFooter = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/api/footer-settings");
      const data = normalizeFooter(res.data?.data || {});
      setForm(data);
      setFooterLogoPreview(data.footerLogoUrl || fileUrl(data.footerLogo));
      setPartnerImagePreview(
        data.officialPartnerImageUrl || fileUrl(data.officialPartnerImage),
      );
      setFooterLogoFile(null);
      setPartnerImageFile(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load footer");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadFooter();
  }, []);

  useEffect(() => {
    if (footerLogoFile instanceof File) {
      const url = URL.createObjectURL(footerLogoFile);
      setFooterLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [footerLogoFile]);

  useEffect(() => {
    if (partnerImageFile instanceof File) {
      const url = URL.createObjectURL(partnerImageFile);
      setPartnerImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [partnerImageFile]);

  const updateArrayItem = (key, index, field, value) => {
    setForm((prev) => {
      const list = [...(prev[key] || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [key]: list };
    });
  };

  const updateArrayLocalized = (key, index, field, lang, value) => {
    setForm((prev) => {
      const list = [...(prev[key] || [])];
      list[index] = {
        ...list[index],
        [field]: {
          ...(list[index]?.[field] || localizedEmpty),
          [lang]: value,
        },
      };
      return { ...prev, [key]: list };
    });
  };

  const updateArrayImage = (key, index, file) => {
    setForm((prev) => {
      const list = [...(prev[key] || [])];
      list[index] = {
        ...list[index],
        imageFile: file,
        imagePreview: file ? URL.createObjectURL(file) : "",
      };
      return { ...prev, [key]: list };
    });
  };

  const removeArrayItem = (key, index) => {
    setForm((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== index),
    }));
  };

  const addPayment = () => {
    setForm((prev) => ({
      ...prev,
      paymentMethods: [
        ...(prev.paymentMethods || []),
        {
          localId: makeLocal(),
          image: "",
          imageFile: null,
          order: prev.paymentMethods?.length || 0,
          status: "active",
        },
      ],
    }));
  };

  const addSocial = () => {
    setForm((prev) => ({
      ...prev,
      socials: [
        ...(prev.socials || []),
        {
          localId: makeLocal(),
          label: "",
          iconText: "",
          link: "",
          order: prev.socials?.length || 0,
          status: "active",
        },
      ],
    }));
  };

  const addSponsor = () => {
    setForm((prev) => ({
      ...prev,
      sponsors: [
        ...(prev.sponsors || []),
        {
          localId: makeLocal(),
          image: "",
          imageFile: null,
          name: { bn: "", en: "" },
          sub: { bn: "", en: "" },
          year: "",
          order: prev.sponsors?.length || 0,
          status: "active",
        },
      ],
    }));
  };

  const addAmbassador = () => {
    setForm((prev) => ({
      ...prev,
      ambassadors: [
        ...(prev.ambassadors || []),
        {
          localId: makeLocal(),
          image: "",
          imageFile: null,
          name: { bn: "", en: "" },
          sub: { bn: "", en: "" },
          year: "",
          order: prev.ambassadors?.length || 0,
          status: "active",
        },
      ],
    }));
  };

  const addLink = () => {
    setForm((prev) => ({
      ...prev,
      links: [
        ...(prev.links || []),
        {
          localId: makeLocal(),
          title: { bn: "", en: "" },
          link: "",
          order: prev.links?.length || 0,
          status: "active",
        },
      ],
    }));
  };

  const cleanListForJson = (list = []) =>
    list.map(({ imageFile, imagePreview, localId, imageUrl, ...rest }) => rest);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("status", form.status);

      fd.append("paymentTitle", JSON.stringify(form.paymentTitle));
      fd.append("socialTitle", JSON.stringify(form.socialTitle));
      fd.append("sponsorTitle", JSON.stringify(form.sponsorTitle));
      fd.append(
        "officialPartnerTitle",
        JSON.stringify(form.officialPartnerTitle),
      );
      fd.append("ambassadorTitle", JSON.stringify(form.ambassadorTitle));
      fd.append("descriptionTitle", JSON.stringify(form.descriptionTitle));
      fd.append("description", JSON.stringify(form.description));
      fd.append("readMoreText", JSON.stringify(form.readMoreText));
      fd.append("showLessText", JSON.stringify(form.showLessText));
      fd.append("footerQualityTitle", JSON.stringify(form.footerQualityTitle));

      fd.append("copyrightText", form.copyrightText || "");
      fd.append("officialPartnerLink", form.officialPartnerLink || "");

      colorFields.forEach(([key]) => {
        fd.append(key, form[key] || "");
      });

      fd.append(
        "paymentMethods",
        JSON.stringify(cleanListForJson(form.paymentMethods)),
      );
      fd.append("socials", JSON.stringify(cleanListForJson(form.socials)));
      fd.append("sponsors", JSON.stringify(cleanListForJson(form.sponsors)));
      fd.append(
        "ambassadors",
        JSON.stringify(cleanListForJson(form.ambassadors)),
      );
      fd.append("links", JSON.stringify(cleanListForJson(form.links)));

      if (footerLogoFile instanceof File) {
        fd.append("footerLogo", footerLogoFile);
      }

      if (partnerImageFile instanceof File) {
        fd.append("officialPartnerImage", partnerImageFile);
      }

      form.paymentMethods?.forEach((item, index) => {
        if (item.imageFile instanceof File) {
          fd.append(`paymentMethods.${index}.image`, item.imageFile);
        }
      });

      form.sponsors?.forEach((item, index) => {
        if (item.imageFile instanceof File) {
          fd.append(`sponsors.${index}.image`, item.imageFile);
        }
      });

      form.ambassadors?.forEach((item, index) => {
        if (item.imageFile instanceof File) {
          fd.append(`ambassadors.${index}.image`, item.imageFile);
        }
      });

      await api.put("/api/footer-settings", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Footer setting saved successfully");
      await loadFooter();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Footer save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetColors = async () => {
    const ok = window.confirm("Are you sure you want to reset footer colors?");
    if (!ok) return;

    try {
      setLoading(true);
      await api.patch("/api/footer-settings/reset-colors");
      toast.success("Footer colors reset successfully");
      await loadFooter();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Color reset failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveServerImage = async (type, parentId = "") => {
    try {
      const ok = window.confirm("Are you sure you want to remove this image?");
      if (!ok) return;

      await api.patch("/api/footer-settings/remove-image", {
        type,
        parentId,
      });

      toast.success("Image removed successfully");
      await loadFooter();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Image remove failed");
    }
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center text-white">
        <Loader2 className="h-10 w-10 animate-spin text-[#3ea0ff]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-[#1A79D3]/20 bg-gradient-to-r from-black/80 via-[#06182a] to-black/80 p-6 shadow-2xl shadow-black/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,121,211,0.30),transparent_35%)]" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] shadow-lg shadow-[#1A79D3]/40">
              <Settings className="h-9 w-9" />
            </div>

            <h1 className="text-3xl font-black md:text-4xl">
              Footer{" "}
              <span className="bg-gradient-to-r from-[#3ea0ff] to-blue-100 bg-clip-text text-transparent">
                Setting
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Control footer content, images, links and all colors from admin
              panel.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 p-5">
            <p className="text-sm font-black text-blue-100">Footer Status</p>
            <p className="mt-1 text-3xl font-black text-[#3ea0ff]">
              {form.status?.toUpperCase()}
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[1fr_430px]"
      >
        <div className="space-y-6">
          <Section title="Live Preview">
            <FooterPreview
              form={form}
              footerLogoPreview={footerLogoPreview}
              partnerImagePreview={partnerImagePreview}
            />
          </Section>

          <Section title="Footer Color Control">
            <div className="mb-5 flex justify-end">
              <button
                type="button"
                onClick={handleResetColors}
                disabled={loading}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20 disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Colors
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {colorFields.map(([key, label]) => (
                <ColorInput
                  key={key}
                  label={label}
                  value={form[key]}
                  onChange={(v) => setColor(key, v)}
                />
              ))}
            </div>
          </Section>

          <Section title="General Footer Text">
            <div className="grid gap-5 md:grid-cols-2">
              <LocalizedInput
                label="Payment Title"
                value={form.paymentTitle}
                onChange={(lang, value) =>
                  setLocalized("paymentTitle", lang, value)
                }
              />

              <LocalizedInput
                label="Social Title"
                value={form.socialTitle}
                onChange={(lang, value) =>
                  setLocalized("socialTitle", lang, value)
                }
              />

              <LocalizedInput
                label="Sponsor Title"
                value={form.sponsorTitle}
                onChange={(lang, value) =>
                  setLocalized("sponsorTitle", lang, value)
                }
              />

              <LocalizedInput
                label="Official Partner Title"
                value={form.officialPartnerTitle}
                onChange={(lang, value) =>
                  setLocalized("officialPartnerTitle", lang, value)
                }
              />

              <LocalizedInput
                label="Ambassador Title"
                value={form.ambassadorTitle}
                onChange={(lang, value) =>
                  setLocalized("ambassadorTitle", lang, value)
                }
              />

              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option className="bg-[#050607]" value="active">
                    Active
                  </option>
                  <option className="bg-[#050607]" value="inactive">
                    Inactive
                  </option>
                </select>
              </div>
            </div>
          </Section>

          <Section title="Description Area">
            <div className="grid gap-5 md:grid-cols-2">
              <LocalizedInput
                label="Description Title"
                value={form.descriptionTitle}
                onChange={(lang, value) =>
                  setLocalized("descriptionTitle", lang, value)
                }
              />

              <LocalizedInput
                label="Read More Text"
                value={form.readMoreText}
                onChange={(lang, value) =>
                  setLocalized("readMoreText", lang, value)
                }
              />

              <LocalizedInput
                label="Show Less Text"
                value={form.showLessText}
                onChange={(lang, value) =>
                  setLocalized("showLessText", lang, value)
                }
              />

              <LocalizedInput
                label="Footer Quality Title"
                value={form.footerQualityTitle}
                onChange={(lang, value) =>
                  setLocalized("footerQualityTitle", lang, value)
                }
              />

              <LocalizedTextarea
                label="Footer Description"
                value={form.description}
                onChange={(lang, value) =>
                  setLocalized("description", lang, value)
                }
              />

              <div>
                <label className={labelClass}>Copyright Text</label>
                <input
                  className={inputClass}
                  value={form.copyrightText || ""}
                  onChange={(e) =>
                    setForm({ ...form, copyrightText: e.target.value })
                  }
                  placeholder="© 2026 CRICKEX Copyrights. All Rights Reserved"
                />
              </div>
            </div>
          </Section>

          <Section title="Logo & Official Partner">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <ImageInput
                  label="Footer Logo"
                  preview={footerLogoPreview}
                  onChange={setFooterLogoFile}
                />

                {form.footerLogo && (
                  <button
                    type="button"
                    onClick={() => handleRemoveServerImage("footerLogo")}
                    className="mt-3 w-full cursor-pointer rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20"
                  >
                    Remove Footer Logo
                  </button>
                )}
              </div>

              <div>
                <ImageInput
                  label="Official Partner Image"
                  preview={partnerImagePreview}
                  onChange={setPartnerImageFile}
                />

                <label className={`${labelClass} mt-4`}>
                  Official Partner Link
                </label>
                <input
                  className={inputClass}
                  value={form.officialPartnerLink || ""}
                  onChange={(e) =>
                    setForm({ ...form, officialPartnerLink: e.target.value })
                  }
                  placeholder="https://example.com"
                />

                {form.officialPartnerImage && (
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveServerImage("officialPartnerImage")
                    }
                    className="mt-3 w-full cursor-pointer rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 hover:bg-red-500/20"
                  >
                    Remove Partner Image
                  </button>
                )}
              </div>
            </div>
          </Section>

          <ListSection title="Payment Methods" onAdd={addPayment}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {form.paymentMethods?.map((item, index) => (
                <Card key={item._id || item.localId || index}>
                  <ImageInput
                    label="Payment Image"
                    preview={
                      item.imagePreview || item.imageUrl || fileUrl(item.image)
                    }
                    onChange={(file) =>
                      updateArrayImage("paymentMethods", index, file)
                    }
                  />

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <SmallInput
                      label="Order"
                      type="number"
                      value={item.order}
                      onChange={(v) =>
                        updateArrayItem("paymentMethods", index, "order", v)
                      }
                    />

                    <StatusSelect
                      value={item.status}
                      onChange={(v) =>
                        updateArrayItem("paymentMethods", index, "status", v)
                      }
                    />
                  </div>

                  <CardActions
                    onRemove={() => removeArrayItem("paymentMethods", index)}
                    onRemoveImage={
                      item._id && item.image
                        ? () =>
                            handleRemoveServerImage("paymentMethod", item._id)
                        : null
                    }
                  />
                </Card>
              ))}
            </div>
          </ListSection>

          <ListSection title="Social Networks" onAdd={addSocial}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {form.socials?.map((item, index) => (
                <Card key={item._id || item.localId || index}>
                  <SmallInput
                    label="Label"
                    value={item.label}
                    onChange={(v) =>
                      updateArrayItem("socials", index, "label", v)
                    }
                    placeholder="Facebook"
                  />

                  <SmallInput
                    label="Icon Text"
                    value={item.iconText}
                    onChange={(v) =>
                      updateArrayItem("socials", index, "iconText", v)
                    }
                    placeholder="f"
                  />

                  <SmallInput
                    label="Link"
                    value={item.link}
                    onChange={(v) =>
                      updateArrayItem("socials", index, "link", v)
                    }
                    placeholder="https://facebook.com"
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <SmallInput
                      label="Order"
                      type="number"
                      value={item.order}
                      onChange={(v) =>
                        updateArrayItem("socials", index, "order", v)
                      }
                    />

                    <StatusSelect
                      value={item.status}
                      onChange={(v) =>
                        updateArrayItem("socials", index, "status", v)
                      }
                    />
                  </div>

                  <CardActions
                    onRemove={() => removeArrayItem("socials", index)}
                  />
                </Card>
              ))}
            </div>
          </ListSection>

          <ListSection title="Sponsors" onAdd={addSponsor}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {form.sponsors?.map((item, index) => (
                <Card key={item._id || item.localId || index}>
                  <ImageInput
                    label="Sponsor Image"
                    preview={
                      item.imagePreview || item.imageUrl || fileUrl(item.image)
                    }
                    onChange={(file) =>
                      updateArrayImage("sponsors", index, file)
                    }
                  />

                  <LocalizedInput
                    label="Sponsor Name"
                    value={item.name}
                    onChange={(lang, value) =>
                      updateArrayLocalized(
                        "sponsors",
                        index,
                        "name",
                        lang,
                        value,
                      )
                    }
                  />

                  <LocalizedInput
                    label="Sponsor Sub Title"
                    value={item.sub}
                    onChange={(lang, value) =>
                      updateArrayLocalized(
                        "sponsors",
                        index,
                        "sub",
                        lang,
                        value,
                      )
                    }
                  />

                  <SmallInput
                    label="Year"
                    value={item.year}
                    onChange={(v) =>
                      updateArrayItem("sponsors", index, "year", v)
                    }
                    placeholder="2023 - 2024"
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <SmallInput
                      label="Order"
                      type="number"
                      value={item.order}
                      onChange={(v) =>
                        updateArrayItem("sponsors", index, "order", v)
                      }
                    />

                    <StatusSelect
                      value={item.status}
                      onChange={(v) =>
                        updateArrayItem("sponsors", index, "status", v)
                      }
                    />
                  </div>

                  <CardActions
                    onRemove={() => removeArrayItem("sponsors", index)}
                    onRemoveImage={
                      item._id && item.image
                        ? () => handleRemoveServerImage("sponsor", item._id)
                        : null
                    }
                  />
                </Card>
              ))}
            </div>
          </ListSection>

          <ListSection title="Brand Ambassadors" onAdd={addAmbassador}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {form.ambassadors?.map((item, index) => (
                <Card key={item._id || item.localId || index}>
                  <ImageInput
                    label="Ambassador Image"
                    preview={
                      item.imagePreview || item.imageUrl || fileUrl(item.image)
                    }
                    onChange={(file) =>
                      updateArrayImage("ambassadors", index, file)
                    }
                  />

                  <LocalizedInput
                    label="Ambassador Name"
                    value={item.name}
                    onChange={(lang, value) =>
                      updateArrayLocalized(
                        "ambassadors",
                        index,
                        "name",
                        lang,
                        value,
                      )
                    }
                  />

                  <LocalizedInput
                    label="Ambassador Sub Title"
                    value={item.sub}
                    onChange={(lang, value) =>
                      updateArrayLocalized(
                        "ambassadors",
                        index,
                        "sub",
                        lang,
                        value,
                      )
                    }
                  />

                  <SmallInput
                    label="Year"
                    value={item.year}
                    onChange={(v) =>
                      updateArrayItem("ambassadors", index, "year", v)
                    }
                    placeholder="2025 - Present"
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <SmallInput
                      label="Order"
                      type="number"
                      value={item.order}
                      onChange={(v) =>
                        updateArrayItem("ambassadors", index, "order", v)
                      }
                    />

                    <StatusSelect
                      value={item.status}
                      onChange={(v) =>
                        updateArrayItem("ambassadors", index, "status", v)
                      }
                    />
                  </div>

                  <CardActions
                    onRemove={() => removeArrayItem("ambassadors", index)}
                    onRemoveImage={
                      item._id && item.image
                        ? () => handleRemoveServerImage("ambassador", item._id)
                        : null
                    }
                  />
                </Card>
              ))}
            </div>
          </ListSection>

          <ListSection title="Footer Links" onAdd={addLink}>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {form.links?.map((item, index) => (
                <Card key={item._id || item.localId || index}>
                  <LocalizedInput
                    label="Link Title"
                    value={item.title}
                    onChange={(lang, value) =>
                      updateArrayLocalized("links", index, "title", lang, value)
                    }
                  />

                  <SmallInput
                    label="Link"
                    value={item.link}
                    onChange={(v) => updateArrayItem("links", index, "link", v)}
                    placeholder="/about-us"
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <SmallInput
                      label="Order"
                      type="number"
                      value={item.order}
                      onChange={(v) =>
                        updateArrayItem("links", index, "order", v)
                      }
                    />

                    <StatusSelect
                      value={item.status}
                      onChange={(v) =>
                        updateArrayItem("links", index, "status", v)
                      }
                    />
                  </div>

                  <CardActions
                    onRemove={() => removeArrayItem("links", index)}
                  />
                </Card>
              ))}
            </div>
          </ListSection>
        </div>

        <aside className="sticky top-6 h-fit space-y-6">
          <Section title="Quick Preview">
            <FooterPreview
              form={form}
              footerLogoPreview={footerLogoPreview}
              partnerImagePreview={partnerImagePreview}
            />
          </Section>

          <div className="rounded-3xl border border-[#1A79D3]/20 bg-black/80 p-4 shadow-2xl backdrop-blur">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3ea0ff] via-[#1A79D3] to-[#0d5fa8] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#1A79D3]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {loading ? "Saving Footer..." : "Save Footer Setting"}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
};

const Section = ({ title, children }) => (
  <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
    <div className="mb-5 flex items-center gap-3">
      <BadgeCheck className="h-5 w-5 text-[#3ea0ff]" />
      <h2 className="text-xl font-black">{title}</h2>
    </div>
    {children}
  </section>
);

const ListSection = ({ title, onAdd, children }) => (
  <section className="rounded-3xl border border-[#1A79D3]/20 bg-black/35 p-5 shadow-2xl md:p-6">
    <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div className="flex items-center gap-3">
        <Edit className="h-5 w-5 text-[#3ea0ff]" />
        <h2 className="text-xl font-black">{title}</h2>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1A79D3]/25 bg-[#1A79D3]/10 px-4 py-3 text-sm font-black text-blue-100 hover:bg-[#1A79D3]/20"
      >
        <PlusCircle className="h-4 w-4" />
        Add New
      </button>
    </div>

    {children}
  </section>
);

const Card = ({ children }) => (
  <div className="rounded-2xl border border-[#1A79D3]/20 bg-black/30 p-5 shadow-xl transition hover:border-[#3ea0ff]/50">
    <div className="space-y-4">{children}</div>
  </div>
);

const ColorInput = ({ label, value, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>

    <div className="flex gap-3">
      <input
        type="color"
        value={String(value || "#000000").startsWith("#") ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-[46px] w-[58px] cursor-pointer rounded-xl border border-[#1A79D3]/25 bg-black/40 p-1"
      />

      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder="#000000 or rgba(...)"
      />
    </div>
  </div>
);

const LocalizedInput = ({ label, value = localizedEmpty, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>

    <div className="grid gap-3 md:grid-cols-2">
      <input
        className={inputClass}
        value={value?.bn || ""}
        onChange={(e) => onChange("bn", e.target.value)}
        placeholder="Bangla"
      />

      <input
        className={inputClass}
        value={value?.en || ""}
        onChange={(e) => onChange("en", e.target.value)}
        placeholder="English"
      />
    </div>
  </div>
);

const LocalizedTextarea = ({ label, value = localizedEmpty, onChange }) => (
  <div className="md:col-span-2">
    <label className={labelClass}>{label}</label>

    <div className="grid gap-3 md:grid-cols-2">
      <textarea
        className={`${inputClass} min-h-[130px] resize-none`}
        value={value?.bn || ""}
        onChange={(e) => onChange("bn", e.target.value)}
        placeholder="Bangla description"
      />

      <textarea
        className={`${inputClass} min-h-[130px] resize-none`}
        value={value?.en || ""}
        onChange={(e) => onChange("en", e.target.value)}
        placeholder="English description"
      />
    </div>
  </div>
);

const SmallInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input
      type={type}
      min={type === "number" ? 0 : undefined}
      className={inputClass}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

const StatusSelect = ({ value, onChange }) => (
  <div>
    <label className={labelClass}>Status</label>
    <select
      value={value || "active"}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} cursor-pointer`}
    >
      <option className="bg-[#050607]" value="active">
        Active
      </option>
      <option className="bg-[#050607]" value="inactive">
        Inactive
      </option>
    </select>
  </div>
);

const ImageInput = ({ label, preview, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>

    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#1A79D3]/40 bg-black/40 p-4 text-center transition hover:border-[#3ea0ff] hover:bg-[#1A79D3]/10">
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="aspect-video w-full rounded-xl object-contain"
        />
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-black/30">
          <ImagePlus className="mb-3 h-10 w-10 text-[#3ea0ff]" />
          <p className="text-sm font-black text-slate-100">
            Click to upload image
          </p>
          <p className="mt-1 text-xs text-slate-500">PNG, JPG, WEBP, SVG</p>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="hidden"
      />
    </label>
  </div>
);

const CardActions = ({ onRemove, onRemoveImage }) => (
  <div className="grid gap-3 md:grid-cols-2">
    {onRemoveImage ? (
      <button
        type="button"
        onClick={onRemoveImage}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
      >
        <X className="h-4 w-4" />
        Remove Image
      </button>
    ) : (
      <div />
    )}

    <button
      type="button"
      onClick={onRemove}
      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-200 hover:bg-red-500/20"
    >
      <Trash2 className="h-4 w-4" />
      Remove Item
    </button>
  </div>
);

const getText = (obj, fallback = "") => obj?.en || obj?.bn || fallback;

const FooterPreview = ({ form, footerLogoPreview, partnerImagePreview }) => {
  const paymentMethods = Array.isArray(form.paymentMethods)
    ? form.paymentMethods.slice(0, 4)
    : [];

  const socials = Array.isArray(form.socials) ? form.socials.slice(0, 5) : [];
  const sponsors = Array.isArray(form.sponsors)
    ? form.sponsors.slice(0, 3)
    : [];
  const links = Array.isArray(form.links) ? form.links.slice(0, 4) : [];

  return (
    <div
      className="overflow-hidden rounded-2xl border border-white/10 p-4"
      style={{
        backgroundColor: form.footerBg,
        color: form.footerText,
      }}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-black">
        <Eye className="h-4 w-4" />
        Footer Preview
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3
            className="mb-2 text-[14px] font-medium"
            style={{ color: form.sectionTitleText }}
          >
            {getText(form.paymentTitle, "Payment Methods")}
          </h3>

          <div className="flex flex-wrap gap-2">
            {paymentMethods.length ? (
              paymentMethods.map((item, index) => {
                const img =
                  item.imagePreview || item.imageUrl || fileUrl(item.image);
                return img ? (
                  <img
                    key={item._id || item.localId || index}
                    src={img}
                    alt="payment"
                    className="h-[22px] object-contain"
                  />
                ) : (
                  <div
                    key={index}
                    className="h-[22px] w-[45px] rounded bg-gray-300"
                  />
                );
              })
            ) : (
              <>
                <div className="h-[22px] w-[45px] rounded bg-gray-300" />
                <div className="h-[22px] w-[45px] rounded bg-gray-300" />
              </>
            )}
          </div>
        </div>

        <div>
          <h3
            className="mb-2 text-[14px] font-medium"
            style={{ color: form.sectionTitleText }}
          >
            {getText(form.socialTitle, "Social Networks")}
          </h3>

          <div className="flex flex-wrap gap-2">
            {(socials.length
              ? socials
              : [{ iconText: "f" }, { iconText: "t" }]
            ).map((item, index) => (
              <div
                key={item._id || item.localId || index}
                className="flex h-[23px] w-[23px] items-center justify-center rounded-full text-[13px] font-bold"
                style={{
                  backgroundColor: form.socialIconBg,
                  color: form.socialIconText,
                }}
              >
                {item.iconText || "•"}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="my-4 h-px w-full"
        style={{ backgroundColor: form.dividerBg }}
      />

      <div>
        <h3
          className="mb-2 text-[14px] font-medium"
          style={{ color: form.sectionTitleText }}
        >
          {getText(form.sponsorTitle, "Sponsor")}
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {(sponsors.length
            ? sponsors
            : [
                {
                  name: { en: "Sponsor" },
                  sub: { en: "Partner" },
                  year: "2026",
                },
              ]
          ).map((item, index) => {
            const img =
              item.imagePreview || item.imageUrl || fileUrl(item.image);

            return (
              <div key={item._id || item.localId || index} className="min-w-0">
                {img ? (
                  <img
                    src={img}
                    alt="sponsor"
                    className="mb-1 h-[34px] object-contain"
                  />
                ) : (
                  <div className="mb-1 h-[34px] w-[70px] rounded bg-gray-300" />
                )}

                <h4
                  className="truncate text-[12px] font-bold leading-none"
                  style={{ color: form.itemTitleText }}
                >
                  {getText(item.name, "Sponsor")}
                </h4>

                <p
                  className="text-[11px] italic leading-none"
                  style={{ color: form.itemSubText }}
                >
                  {getText(item.sub, "Partner")}
                </p>

                <p
                  className="text-[11px] italic leading-none"
                  style={{ color: form.itemSubText }}
                >
                  {item.year || "2026"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {partnerImagePreview && (
        <>
          <div
            className="my-4 h-px w-full"
            style={{ backgroundColor: form.dividerBg }}
          />

          <h3
            className="mb-2 text-[14px] font-medium"
            style={{ color: form.sectionTitleText }}
          >
            {getText(form.officialPartnerTitle, "Official Partner")}
          </h3>

          <img
            src={partnerImagePreview}
            alt="partner"
            className="h-[40px] object-contain"
          />
        </>
      )}

      <div
        className="my-4 h-px w-full"
        style={{ backgroundColor: form.dividerBg }}
      />

      <div className="flex flex-wrap gap-y-2">
        {(links.length
          ? links
          : [{ title: { en: "About Us" } }, { title: { en: "Contact" } }]
        ).map((item, index) => (
          <span
            key={item._id || item.localId || index}
            className="border-l-2 px-3 text-[13px]"
            style={{
              borderColor: form.linkBorder,
              color: form.linkText,
            }}
          >
            {getText(item.title, "Link")}
          </span>
        ))}
      </div>

      <div
        className="my-4 h-px w-full"
        style={{ backgroundColor: form.dividerBg }}
      />

      <h2
        className="mb-3 text-[18px] font-bold"
        style={{ color: form.descriptionTitleText }}
      >
        {getText(form.descriptionTitle, "Footer Description Title")}
      </h2>

      <p
        className="line-clamp-2 text-[14px] leading-[20px]"
        style={{ color: form.descriptionText }}
      >
        {getText(form.description, "Footer description preview text here.")}
      </p>

      <button
        type="button"
        className="mt-4 rounded-[3px] px-4 py-2 text-[13px] font-medium"
        style={{
          backgroundColor: form.readMoreButtonBg,
          color: form.readMoreButtonText,
        }}
      >
        {getText(form.readMoreText, "Read More")} ⌄
      </button>

      <div
        className="my-4 h-px w-full"
        style={{ backgroundColor: form.dividerBg }}
      />

      <div className="flex items-center gap-4">
        {footerLogoPreview ? (
          <img
            src={footerLogoPreview}
            alt="logo"
            className="h-[26px] object-contain"
          />
        ) : (
          <div className="h-[26px] w-[90px] rounded bg-gray-300" />
        )}

        <div>
          <h4
            className="text-[13px] font-bold"
            style={{ color: form.qualityTitleText }}
          >
            {getText(form.footerQualityTitle, "Best Quality Platform")}
          </h4>

          <p className="text-[12px]" style={{ color: form.copyrightTextColor }}>
            {form.copyrightText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FooterSetting;
