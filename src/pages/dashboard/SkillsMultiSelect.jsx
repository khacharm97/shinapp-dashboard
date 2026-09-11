import { useState, useRef, useEffect } from "react";
import { ChevronsUpDown, Search, X } from "lucide-react";

// Searchable multi-select for existing skills only. Unlike the profile/settings
// multi-select on the main site, this never lets the admin type in a skill that
// isn't already in `options` — admin-created users shouldn't get skill keys
// that don't exist anywhere else in the app.
export function SkillsMultiSelect({ options, selected, onChange, placeholder = "Select skills..." }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggle = (key) => {
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    onChange(next);
  };

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <div
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-blue-gray-200 bg-white px-3 py-2 text-sm cursor-pointer min-h-[42px] h-auto focus:border-blue-500"
      >
        <div className="flex flex-wrap gap-1">
          {selected.length === 0 && (
            <span className="text-blue-gray-400">{placeholder}</span>
          )}
          {selected.map((key) => {
            const option = options.find((o) => o.value === key);
            return (
              <span
                key={key}
                className="flex items-center gap-1 bg-blue-gray-50 text-blue-gray-700 rounded-md px-2 py-0.5 text-xs font-medium"
              >
                {option ? option.label : key}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(key);
                  }}
                >
                  <X className="w-3 h-3 text-blue-gray-400 hover:text-blue-gray-700" />
                </button>
              </span>
            );
          })}
        </div>
        <ChevronsUpDown className="w-4 h-4 shrink-0 text-blue-gray-400" />
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-blue-gray-100 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-blue-gray-100 p-2">
            <Search className="w-4 h-4 text-blue-gray-400" />
            <input
              autoFocus
              className="flex-1 border-0 text-sm outline-none"
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length === 0 && (
              <div className="p-2 text-center text-sm text-blue-gray-400">No skills found.</div>
            )}
            {filteredOptions.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-blue-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(option.value)}
                    className="rounded border-blue-gray-300"
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
