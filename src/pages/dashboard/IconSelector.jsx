import React, { useState, useMemo, useRef } from "react";
import * as LucideIcons from "lucide-react";
import { useUploadSkillIconMutation } from "../../services/api";
import {
  Input,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
} from "@material-tailwind/react";

// Get all valid icon component names (they start with a capital letter)
const allIconNames = Object.keys(LucideIcons).filter((key) => /^[A-Z]/.test(key) && key !== 'LucideProps' && key !== 'IconNode' && key !== 'IconProps');

// Keep in sync with the backend limits on POST /admin/skills/icon
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];

export function IconSelector({ value, onChange, onUploaded }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const [uploadSkillIcon, { isLoading: isUploading }] = useUploadSkillIconMutation();

  const handleOpen = () => setOpen(!open);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setUploadError("");
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Please choose a PNG, JPG, WEBP, GIF or SVG image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Image must be 2 MB or smaller.");
      return;
    }
    try {
      const { url } = await uploadSkillIcon(file).unwrap();
      onUploaded?.(url);
      onChange(url);
      setOpen(false);
    } catch (err) {
      setUploadError(err?.data?.message || "Upload failed. Please try again.");
    }
  };

  // Limit displayed icons to 100 to prevent performance issues, filtered by search
  const displayedIcons = useMemo(() => {
    if (!search.trim()) {
      return allIconNames.slice(0, 100);
    }
    const lowerSearch = search.toLowerCase();
    return allIconNames
      .filter((name) => name.toLowerCase().includes(lowerSearch))
      .slice(0, 100);
  }, [search]);

  const CurrentIcon = value && LucideIcons[value] ? LucideIcons[value] : null;

  const handleSelectIcon = (iconName) => {
    onChange(iconName);
    setOpen(false);
  };

  const handleSetCustomUrl = () => {
    if (customUrl.trim()) {
      onChange(customUrl.trim());
      setOpen(false);
    }
  };

  const isUrl = value && (value.startsWith('http') || value.startsWith('/'));

  return (
    <div className="flex flex-col gap-2">
      <Typography variant="small" color="blue-gray" className="font-medium">
        Skill Icon
      </Typography>
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg border border-blue-gray-200 bg-blue-gray-50">
          {CurrentIcon ? (
            <CurrentIcon className="w-6 h-6 text-blue-gray-700" />
          ) : isUrl ? (
            <img src={value} alt="Icon" className="w-6 h-6 object-contain" />
          ) : (
            <span className="text-xs text-blue-gray-400">None</span>
          )}
        </div>
        <Button variant="outlined" color="blue-gray" size="sm" onClick={handleOpen}>
          {value ? "Change Icon" : "Select Icon"}
        </Button>
        {value && (
          <Button variant="text" color="red" size="sm" onClick={() => onChange(null)}>
            Clear
          </Button>
        )}
      </div>

      <Dialog open={open} handler={handleOpen} size="lg">
        <DialogHeader>Select an Icon</DialogHeader>
        <DialogBody divider className="h-[60vh] overflow-y-auto flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <Typography variant="small" color="blue-gray" className="font-bold">
              Choose from Library
            </Typography>
            <Input 
              label="Search icons..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              icon={<LucideIcons.Search className="w-4 h-4" />}
            />
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 mt-4">
              {displayedIcons.map((name) => {
                const Icon = LucideIcons[name];
                return (
                  <div 
                    key={name}
                    onClick={() => handleSelectIcon(name)}
                    className="flex flex-col items-center justify-center p-3 gap-2 rounded-lg border border-transparent hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                    title={name}
                  >
                    <Icon className="w-6 h-6 text-blue-gray-700" />
                    <span className="text-[10px] text-center text-blue-gray-500 truncate w-full">{name}</span>
                  </div>
                );
              })}
              {displayedIcons.length === 0 && (
                <div className="col-span-full py-8 text-center text-blue-gray-400">
                  No icons found.
                </div>
              )}
            </div>
            {displayedIcons.length === 100 && (
              <Typography variant="small" color="blue-gray" className="text-center opacity-70 mt-2">
                Showing top 100 results. Type to search for more.
              </Typography>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t pt-4">
            <Typography variant="small" color="blue-gray" className="font-bold">
              Or use Custom Image URL
            </Typography>
            <div className="flex gap-2">
              <Input 
                label="https://example.com/icon.png" 
                value={customUrl} 
                onChange={(e) => setCustomUrl(e.target.value)} 
              />
              <Button onClick={handleSetCustomUrl} disabled={!customUrl.trim()}>Apply</Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t pt-4">
            <Typography variant="small" color="blue-gray" className="font-bold">
              Or upload an Image
            </Typography>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_TYPES.join(",")}
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="outlined"
                className="flex items-center gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <LucideIcons.Upload className="w-4 h-4" />
                {isUploading ? "Uploading..." : "Choose File"}
              </Button>
              <Typography variant="small" color="blue-gray" className="opacity-70">
                PNG, JPG, WEBP, GIF or SVG — max 2 MB
              </Typography>
            </div>
            {uploadError && (
              <Typography variant="small" color="red">
                {uploadError}
              </Typography>
            )}
          </div>

        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleOpen}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
