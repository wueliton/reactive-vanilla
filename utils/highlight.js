const hightlight = (element) => {
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

  const text = element.innerHTML;
  const keywordRegex = new RegExp(`\\b(?:${keywords.join("|")})\\b`, "g");

  const lines = text.split("\n");

  const formattedContent = lines
    .map((line) => {
      const formatted = line
        .replace(/(['"])(.*?)\1/g, (match) => `<span class="text-blue-300">${match}</span>`)
        .replace(keywordRegex, (match) => `<span class="text-red-300">${match}</span>`)
        .replace(/\/\/ .*$/gm, (match) => `<span class="text-gray-400">${match}</span>`)
        .replace(/[\w$]+(?=\s*\()/, (match) => `<span class="text-purple-300">${match}</span>`)
        .replace(/\b[\w$]+(?=\s*:)/g, (match) => `<span class="text-purple-300">${match}</span>`);

      return formatted;
    })
    .join("\n");

  element.innerHTML = formattedContent;
};

export { hightlight };
