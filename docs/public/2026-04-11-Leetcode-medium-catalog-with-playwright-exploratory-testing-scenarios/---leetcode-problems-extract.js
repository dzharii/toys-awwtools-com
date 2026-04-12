(() => {
  const problems = Array.from(
    document.querySelectorAll('a[target="_self"][href^="/problems/"]')
  ).map((el) => {
    const href = el.getAttribute("href") || "";
    const fullUrl = new URL(href, location.origin).href;

    const titleNode = el.querySelector(".ellipsis.line-clamp-1");
    const rawTitle = titleNode?.textContent?.trim() || "";

    const match = rawTitle.match(/^(\d+)\.\s*(.+)$/);
    const problemId = match ? Number(match[1]) : null;
    const problemTitle = match ? match[2] : rawTitle;

    const acceptanceRate =
      Array.from(el.querySelectorAll("div, span, p"))
        .map((node) => node.textContent.trim())
        .find((text) => /^\d+(\.\d+)?%$/.test(text)) || null;

    const difficulty =
      Array.from(el.querySelectorAll("div, span, p"))
        .map((node) => node.textContent.trim())
        .find((text) => /^(Easy|Medium|Med\.|Hard)$/i.test(text)) || null;

    const isPremium =
      !!el.querySelector(
        'svg[data-icon="lock"], svg[data-icon="lock-keyhole"], .text-brand-orange'
      );

    return {
      problemId,
      problemTitle,
      problemUrl: href,
      fullUrl,
      acceptanceRate,
      difficulty,
      isPremium,
    };
  });

  console.log(JSON.stringify(problems, null, 2));
})();


