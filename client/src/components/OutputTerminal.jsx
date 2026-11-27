import { Terminal, Trash2, Loader2 } from "lucide-react";

export default function OutputTerminal({
  output,
  isError,
  isRunning,
  onClear,
}) {
  return (
    <div className="h-48 sm:h-52 border-t border-zinc-800 bg-zinc-950 flex flex-col shrink-0">
      {/* Terminal Header */}
      <div className="h-9 px-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Output</span>
          {isRunning && (
            <span className="inline-flex items-center gap-1 text-indigo-400 ml-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Running...
            </span>
          )}
        </div>

        {output && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs sm:text-sm">
        {output ? (
          <pre
            className={`whitespace-pre-wrap break-words ${
              isError ? "text-red-400" : "text-zinc-200"
            }`}
          >
            {output}
          </pre>
        ) : (
          <p className="text-zinc-600 italic">
            Click "Run Code" to execute your code and see the output here...
          </p>
        )}
      </div>
    </div>
  );
}