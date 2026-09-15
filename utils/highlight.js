const hightlight = (content) => {
  const keywords = [
    "const",
    "let",
    "var",
    "import",
    "from",
    "export",
    "default",
    "function",
    "return",
    "if",
    "else",
    "for",
    "while",
    "new",
    "extends",
    "async",
    "await",
  ];

  const keywordRegex = new RegExp(`\\b(?:${keywords.join("|")})\\b`, "g");

  const lines = escapeHtml(content).split("\n");

  const formattedContent = lines
    .map((line) => {
      const formatted = line
        .replace(/(&lt;\/?)([a-zA-Z][\w-]*)/g, '$1<span class="text-blue-400">$2</span>')
        .replace(
          /(&quot;.*?&quot;|&#39;.*?&#39;)/g,
          (match) => `<span class="text-blue-300">${match}</span>`,
        )
        .replace(keywordRegex, (match) => `<span class="text-red-300">${match}</span>`)
        .replace(/\/\/ .*$/gm, (match) => `<span class="text-gray-400">${match}</span>`)
        .replace(/[\w$]+(?=\s*\()/g, (match) => `<span class="text-purple-300">${match}</span>`)
        .replace(/\b[\w$]+(?=\s*:)/g, (match) => `<span class="text-purple-300">${match}</span>`);

      return formatted;
    })
    .join("\n");

  return formattedContent;
};

const escapeHtml = (value) => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

export { hightlight };
