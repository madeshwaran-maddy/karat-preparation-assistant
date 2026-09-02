"use client";

import { useRef } from "react";

type JavaCodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  height?: string;
};

export default function JavaCodeEditor({ value, onChange, height = "420px" }: JavaCodeEditorProps) {
  const codeLayerRef = useRef<HTMLPreElement>(null);
  const lineNumberLayerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = event.currentTarget;
    if (codeLayerRef.current) {
      codeLayerRef.current.scrollTop = scrollTop;
      codeLayerRef.current.scrollLeft = scrollLeft;
    }
    if (lineNumberLayerRef.current) {
      lineNumberLayerRef.current.scrollTop = scrollTop;
    }
  };

  return (
    <div className="relative flex overflow-hidden bg-[#1b2941]" style={{ height }}>
      <div
        ref={lineNumberLayerRef}
        aria-hidden="true"
        className="z-10 w-12 shrink-0 overflow-hidden border-r border-slate-700 bg-[#172238] px-3 pt-4 text-right font-mono text-sm leading-6 text-slate-500"
      >
        {value.split("\n").map((_, index) => (
          <div key={index}>{index + 1}</div>
        ))}
      </div>

      <div className="relative min-w-0 flex-1 overflow-hidden">
        <pre
          ref={codeLayerRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre px-4 py-4 font-mono text-sm leading-6 text-slate-100"
        >
          <HighlightedJavaCode code={value} />
        </pre>
        <textarea
          aria-label="Java code editor"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onScroll={handleScroll}
          spellCheck={false}
          className="absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent px-4 py-4 font-mono text-sm leading-6 text-transparent caret-white outline-none selection:bg-blue-500/40"
          style={{ tabSize: 4 }}
        />
      </div>
    </div>
  );
}

function HighlightedJavaCode({ code }: { code: string }) {
  const tokenPattern = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|@[A-Za-z_]\w*|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g;
  const keywords = new Set([
    "abstract", "assert", "break", "case", "catch", "class", "const", "continue", "default", "do", "else",
    "enum", "extends", "final", "finally", "for", "if", "implements", "import", "instanceof", "interface",
    "native", "new", "package", "private", "protected", "public", "return", "static", "strictfp", "super",
    "switch", "synchronized", "this", "throw", "throws", "transient", "try", "var", "volatile", "while",
    "boolean", "byte", "char", "double", "float", "int", "long", "short", "void", "true", "false", "null",
  ]);
  const types = new Set(["String", "System", "Integer", "Long", "Double", "Boolean", "Object", "Math", "List", "Map", "Set"]);
  let lastIndex = 0;
  const highlighted: React.ReactNode[] = [];

  for (const match of code.matchAll(tokenPattern)) {
    const token = match[0];
    const index = match.index ?? 0;
    if (index > lastIndex) highlighted.push(code.slice(lastIndex, index));

    let className = "text-slate-100";
    if (token.startsWith("//") || token.startsWith("/*")) className = "text-slate-500";
    else if (token.startsWith('"') || token.startsWith("'")) className = "text-emerald-300";
    else if (token.startsWith("@")) className = "text-amber-300";
    else if (/^\d/.test(token)) className = "text-cyan-300";
    else if (keywords.has(token)) className = "text-pink-300";
    else if (types.has(token)) className = "text-sky-300";

    highlighted.push(<span key={`${index}-${token}`} className={className}>{token}</span>);
    lastIndex = index + token.length;
  }

  if (lastIndex < code.length) highlighted.push(code.slice(lastIndex));
  return highlighted;
}