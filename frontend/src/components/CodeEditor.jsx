import Editor from "@monaco-editor/react";

const LANG_MAP = {
  python: "python",
  javascript: "javascript",
  java: "java",
  cpp: "cpp",
  c: "c",
};

export default function CodeEditor({ value, onChange, language = "python" }) {
  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <Editor
        height="400px"
        language={LANG_MAP[language] || "python"}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 16 },
          lineNumbers: "on",
          tabSize: 4,
          wordWrap: "on",
          automaticLayout: true,
        }}
      />
    </div>
  );
}
