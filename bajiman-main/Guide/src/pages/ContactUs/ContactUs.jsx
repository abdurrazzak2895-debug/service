import React from "react";

import StaticPageLayout from "../../components/StaticPageLayout/StaticPageLayout";

const ContactUs = () => {
  const title = {
    en: "Contact Us",
    bn: "যোগাযোগ করুন",
  };

  const sections = [
    {
      paragraphs: [
        {
          en: "We’re here to help. If you have any questions about your account, deposits, withdrawals, promotions or the VIP program, reach out to our support team through any of the channels below.",
          bn: "আমরা আপনাকে সাহায্য করার জন্য এখানে আছি। আপনার অ্যাকাউন্ট, ডিপোজিট, উইথড্র, প্রমোশন অথবা VIP প্রোগ্রাম সম্পর্কে কোনো প্রশ্ন থাকলে নিচের যেকোনো মাধ্যমে আমাদের সাপোর্ট টিমের সঙ্গে যোগাযোগ করুন।",
        },
      ],
    },
    {
      heading: {
        en: "Live Support",
        bn: "লাইভ সাপোর্ট",
      },
      paragraphs: [
        {
          en: "Our support team is available 24/7 through live chat on the Bajiman website and app to assist you with any issue, any time.",
          bn: "Bajiman ওয়েবসাইট ও অ্যাপে লাইভ চ্যাটের মাধ্যমে আমাদের সাপোর্ট টিম ২৪/৭ আপনার যেকোনো সমস্যার সমাধানে প্রস্তুত।",
        },
      ],
    },
    {
      heading: {
        en: "Community",
        bn: "কমিউনিটি",
      },
      paragraphs: [
        {
          en: "You can also connect with us through our official social channels listed in the footer for the latest updates, promotions and announcements.",
          bn: "সর্বশেষ আপডেট, প্রমোশন এবং ঘোষণার জন্য ফুটারে দেওয়া আমাদের অফিসিয়াল সোশ্যাল চ্যানেলগুলোর মাধ্যমেও আমাদের সঙ্গে যুক্ত থাকতে পারেন।",
        },
      ],
    },
  ];

  return <StaticPageLayout title={title} sections={sections} />;
};

export default ContactUs;
