// Judge0 CE Language IDs
const LANGUAGE_IDS = {
  javascript: 63, // Node.js
  python: 71,     // Python 3
  cpp: 54,        // C++ (GCC)
  java: 62,       // Java (OpenJDK)
};

export const runCode = async (req, res) => {
  try {
    const { language, code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Code is required" });
    }

    const languageId = LANGUAGE_IDS[language];
    if (!languageId) {
      return res.status(400).json({ message: "Unsupported language" });
    }

    const response = await fetch(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res
        .status(500)
        .json({ message: data.error || data.message || "Execution failed" });
    }

    const output =
      data.stdout ||
      data.stderr ||
      data.compile_output ||
      data.message ||
      "";
    const isError = Boolean(
      data.stderr || data.compile_output || (data.status && data.status.id > 3)
    );

    res.status(200).json({ output, isError });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};