import React from "react";
import { Link, Navigate, useParams } from "react-router";
import { ChevronLeft } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import { findArticle } from "../../data/topicsData";

const ArticlePage = () => {
  const { topicSlug, articleSlug } = useParams();
  const { isBangla } = useLanguage();

  const { topic, article } = findArticle(topicSlug, articleSlug);

  if (!topic || !article) {
    return <Navigate to="/" replace />;
  }

  const topicLabel = isBangla ? topic.title.bn : topic.title.en;

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to={`/topic/${topic.slug}`}
        className="mb-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[#0b66a8] hover:underline"
      >
        <ChevronLeft size={16} />
        {topicLabel}
      </Link>

      <h1 className="mb-4 text-[24px] font-extrabold text-[#1c2b3a]">
        {isBangla ? article.title.bn : article.title.en}
      </h1>

      <p className="text-[15px] leading-[26px] text-[#43505e]">
        {isBangla ? article.content.bn : article.content.en}
      </p>
    </div>
  );
};

export default ArticlePage;
