import React, { useRef, useState, useEffect } from "react";

const RichTextEditor = ({
  initialContent = "",
  onSave,
  noteName = "Untitled Note",
}) => {
  const editorRef = useRef(null);
  const [content, setContent] = useState(initialContent);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState("< 1 min");

  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
      calculateStats();
    }
  }, [initialContent]);

  const calculateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const minutes = Math.max(1, Math.ceil(words / 200));

    setWordCount(words);
    setCharCount(chars);
    setReadingTime(`${minutes} min read`);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    setContent(editorRef.current.innerHTML);
    setIsSaved(false);
    calculateStats();
  };

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleSave = () => {
    if (onSave && editorRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      onSave(htmlContent);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const handleCopy = () => {
    if (editorRef.current) {
      const plainText = editorRef.current.innerText;
      navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-text">
      {/* Google Docs Toolbar */}
      <div className="shrink-0 bg-slate-900 border-b border-slate-800 p-2 flex flex-wrap items-center justify-between gap-2 shadow-md z-10">
        {/* Formatting Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings Dropdown */}
          <select
            onChange={(e) => execCmd("formatBlock", e.target.value)}
            className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="p">Normal text</option>
            <option value="h1">Heading 1 (Title)</option>
            <option value="h2">Heading 2 (Section)</option>
            <option value="h3">Heading 3 (Subheading)</option>
            <option value="blockquote">Quote Block</option>
          </select>

          <div className="h-4 w-px bg-slate-800 mx-1"></div>

          {/* Inline Styles */}
          <button
            type="button"
            onClick={() => execCmd("bold")}
            className="p-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded font-bold text-xs cursor-pointer"
            title="Bold (Ctrl+B)"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => execCmd("italic")}
            className="p-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded italic text-xs cursor-pointer"
            title="Italic (Ctrl+I)"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => execCmd("underline")}
            className="p-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded underline text-xs cursor-pointer"
            title="Underline (Ctrl+U)"
          >
            U
          </button>
          <button
            type="button"
            onClick={() => execCmd("strikeThrough")}
            className="p-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded line-through text-xs cursor-pointer"
            title="Strikethrough"
          >
            S
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1"></div>

          {/* Lists */}
          <button
            type="button"
            onClick={() => execCmd("insertUnorderedList")}
            className="p-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs cursor-pointer"
            title="Bulleted List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => execCmd("insertOrderedList")}
            className="p-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs cursor-pointer"
            title="Numbered List"
          >
            1. List
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1"></div>

          {/* Alignment */}
          <button
            type="button"
            onClick={() => execCmd("justifyLeft")}
            className="p-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs cursor-pointer"
            title="Align Left"
          >
            ⇐
          </button>
          <button
            type="button"
            onClick={() => execCmd("justifyCenter")}
            className="p-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs cursor-pointer"
            title="Align Center"
          >
            ⇔
          </button>
          <button
            type="button"
            onClick={() => execCmd("justifyRight")}
            className="p-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs cursor-pointer"
            title="Align Right"
          >
            ⇒
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1"></div>

          <button
            type="button"
            onClick={() => execCmd("removeFormat")}
            className="p-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-400 cursor-pointer"
            title="Clear Formatting"
          >
            🧹 Clear
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            {copied ? "Copied! ✓" : "Copy Text"}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>{isSaved ? "Saved! ✓" : "Save Document"}</span>
          </button>
        </div>
      </div>

      {/* Live Document Stats Bar */}
      <div className="shrink-0 px-6 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span className="text-slate-300 font-semibold">📄 {noteName}</span>
        <div className="flex gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          <span>{readingTime}</span>
        </div>
      </div>

      {/* Google Docs Paper Canvas */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex justify-center bg-slate-950">
        <div className="w-full max-w-4xl min-h-[600px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 sm:p-12 text-slate-200 focus:outline-none leading-relaxed text-sm">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            suppressContentEditableWarning
            className="w-full h-full focus:outline-none min-h-[500px] prose prose-invert max-w-none"
            placeholder="Start typing your note content here..."
          />
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
