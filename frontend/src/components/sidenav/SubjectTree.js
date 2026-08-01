import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setSubjectTopicsTree,
  setSelectedSubjectTopic,
} from "../../utils/store/notesSlice";
import {
  getSubjectTopicsTree,
  createSubjectTopic,
  updateSubjectTopic,
  deleteSubjectTopic,
} from "../../apis/subjectTopicsAPI";

const TreeNode = ({ node, level = 0, onSelect, selectedId, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [childName, setChildName] = useState("");
  const [editName, setEditName] = useState(node.name);

  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const handleAddChild = async (e) => {
    e.preventDefault();
    if (!childName.trim()) return;
    try {
      await createSubjectTopic({
        name: childName.trim(),
        parent_id: node.id,
      });
      setChildName("");
      setIsAddingChild(false);
      setIsOpen(true);
      onRefresh();
    } catch (err) {
      console.error("Failed to add subtopic:", err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    try {
      await updateSubjectTopic(node.id, editName.trim());
      setIsEditing(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to rename subject/topic:", err);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${node.name}" and all its subtopics?`)) {
      try {
        await deleteSubjectTopic(node.id);
        if (isSelected) {
          onSelect(null);
        }
        onRefresh();
      } catch (err) {
        console.error("Failed to delete subject/topic:", err);
      }
    }
  };

  return (
    <div className="flex flex-col text-xs">
      {/* Node Row */}
      <div
        onClick={() => onSelect(node)}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg cursor-pointer transition ${
          isSelected
            ? "bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-800/60"
            : "text-slate-300 hover:bg-slate-900/80 hover:text-slate-100"
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-1">
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="w-4 h-4 flex items-center justify-center text-[10px] text-slate-400 hover:text-white"
            >
              {isOpen ? "▼" : "▶"}
            </button>
          ) : (
            <span className="w-4"></span>
          )}

          <span className="text-sm shrink-0">
            {level === 0 ? "📚" : level === 1 ? "📁" : "🏷️"}
          </span>

          {isEditing ? (
            <form onSubmit={handleUpdate} className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                className="w-full p-1 bg-slate-950 border border-emerald-500 rounded text-xs text-white focus:outline-none"
              />
            </form>
          ) : (
            <span className="truncate" title={node.name}>
              {node.name}
            </span>
          )}
        </div>

        {/* Hover Action Buttons */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setIsAddingChild(!isAddingChild)}
            className="p-1 hover:bg-slate-800 rounded text-[10px] text-emerald-400 font-bold"
            title="Add Subtopic"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 hover:bg-slate-800 rounded text-[10px] text-slate-400"
            title="Rename"
          >
            ✏️
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-1 hover:bg-red-950/60 rounded text-[10px] text-red-400"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Inline Input for Adding Subtopic */}
      {isAddingChild && (
        <form
          onSubmit={handleAddChild}
          style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
          className="my-1 flex items-center gap-1.5"
        >
          <input
            type="text"
            placeholder="New subtopic name..."
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            autoFocus
            className="flex-1 p-1 bg-slate-950 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsAddingChild(false)}
            className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-[10px]"
          >
            ✕
          </button>
        </form>
      )}

      {/* Render Child Subtopics Recursively */}
      {isOpen && hasChildren && (
        <div className="flex flex-col">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SubjectTree = () => {
  const dispatch = useDispatch();
  const { subjectTopicsTree, selectedSubjectTopic } = useSelector(
    (store) => store.notes
  );

  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [rootName, setRootName] = useState("");

  const refreshTree = async () => {
    try {
      const treeData = await getSubjectTopicsTree();
      dispatch(setSubjectTopicsTree(treeData));
    } catch (err) {
      console.error("Failed to load subject topics tree:", err);
    }
  };

  useEffect(() => {
    refreshTree();
  }, [dispatch]);

  const handleAddRoot = async (e) => {
    e.preventDefault();
    if (!rootName.trim()) return;
    try {
      await createSubjectTopic({
        name: rootName.trim(),
        parent_id: null,
      });
      setRootName("");
      setIsAddingRoot(false);
      refreshTree();
    } catch (err) {
      console.error("Failed to create root subject:", err);
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-800/80">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span>📚</span> Subjects & Topics
        </span>
        <button
          type="button"
          onClick={() => setIsAddingRoot(!isAddingRoot)}
          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1"
        >
          <span>+ Subject</span>
        </button>
      </div>

      {/* Inline Input for Adding Root Subject */}
      {isAddingRoot && (
        <form onSubmit={handleAddRoot} className="px-2 flex items-center gap-1.5">
          <input
            type="text"
            placeholder="e.g. GS1 History..."
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            autoFocus
            className="flex-1 p-1 bg-slate-950 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-semibold"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setIsAddingRoot(false)}
            className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-[10px]"
          >
            ✕
          </button>
        </form>
      )}

      {/* "All Notes" Filter Option */}
      <div
        onClick={() => dispatch(setSelectedSubjectTopic(null))}
        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-xs transition ${
          selectedSubjectTopic === null
            ? "bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-800/60"
            : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
        }`}
      >
        <span>📂</span>
        <span>All Notes & Subjects</span>
      </div>

      {/* Recursive Subject/Topic Tree */}
      <div className="flex flex-col gap-0.5">
        {subjectTopicsTree && subjectTopicsTree.length > 0 ? (
          subjectTopicsTree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              level={0}
              onSelect={(n) => dispatch(setSelectedSubjectTopic(n))}
              selectedId={selectedSubjectTopic?.id}
              onRefresh={refreshTree}
            />
          ))
        ) : (
          <p className="px-2 py-1 text-[11px] text-slate-500 italic">
            No subjects created yet. Click "+ Subject" to organize notes.
          </p>
        )}
      </div>
    </div>
  );
};

export default SubjectTree;
