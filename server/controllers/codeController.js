const LANGUAGE_VERSIONS = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  cpp: { language: "c++", version: "10.2.0" },
  java: { language: "java", version: "15.0.2" },
};

export const runCode = async (req, res) => {
  try {
    const { language, code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Code is required" });
    }

    const langConfig = LANGUAGE_VERSIONS[language];
    if (!langConfig) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [{ content: code }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res
        .status(500)
        .json({ message: data.message || "Execution failed" });
    }

    const output = data.run?.output || "";
    const isError = Boolean(data.run?.stderr);

    res.status(200).json({ output, isError });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};