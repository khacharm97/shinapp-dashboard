import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
  Switch,
  Select,
  Option,
} from "@material-tailwind/react";
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/solid";
import {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetUsersQuery
} from "@/services/api";

export function Announcements() {
  const { data: announcements, isLoading } = useGetAnnouncementsQuery();
  const { data: users } = useGetUsersQuery();

  const [createAnnouncement] = useCreateAnnouncementMutation();
  const [updateAnnouncement] = useUpdateAnnouncementMutation();
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [formData, setFormData] = useState({
    id: null,
    companyId: "",
    sphere: "",
    title: "",
    description: "",
    urgent: false,
    status: "PUBLISHED",
    startDate: "",
    endDate: "",
  });

  const handleOpen = () => setOpen(!open);

  const resetForm = () => {
    setFormData({
      id: null,
      companyId: "",
      sphere: "",
      title: "",
      description: "",
      urgent: false,
      status: "PUBLISHED",
      startDate: "",
      endDate: "",
    });
    });
    setIsEditing(false);
    setSelectedFiles([]);
    setExistingImages([]);
    setPreviewUrls([]);
  };

  const handleAddClick = () => {
    resetForm();
    handleOpen();
  };

  const handleEditClick = (announcement) => {
    setFormData({
      id: announcement.id,
      companyId: announcement.companyId,
      sphere: announcement.sphere,
      title: announcement.title,
      description: announcement.description,
      urgent: announcement.urgent,
      status: announcement.status || "PUBLISHED",
      startDate: new Date(announcement.startDate).toISOString().split('T')[0],
      endDate: new Date(announcement.endDate).toISOString().split('T')[0],
    });
    });
    setIsEditing(true);
    setExistingImages(announcement.imageUrls || []);
    setSelectedFiles([]);
    setPreviewUrls([]);
    handleOpen();
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      await deleteAnnouncement(id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append("companyId", formData.companyId);
    data.append("sphere", formData.sphere);
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("urgent", formData.urgent);
    data.append("status", formData.status);
    data.append("startDate", formData.startDate);
    data.append("endDate", formData.endDate);
    
    selectedFiles.forEach((file) => {
      data.append("images", file);
    });
    
    existingImages.forEach((img) => {
      data.append("existingImages", img);
    });

    if (isEditing) {
      await updateAnnouncement({
        id: formData.id,
        body: data,
      });
    } else {
      await createAnnouncement(data);
    }
    handleOpen();
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const totalImages = existingImages.length + selectedFiles.length + filesArray.length;
      
      if (totalImages > 3) {
        alert("You can only upload up to 3 images.");
        return;
      }
      
      setSelectedFiles(prev => [...prev, ...filesArray]);
      
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const companies = users?.filter(u => u.roles.includes('COMPANY') && u.verifiedAt) || [];


  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex justify-between items-center">
          <Typography variant="h6" color="white">
            Announcements Table
          </Typography>
          <Button onClick={handleAddClick} className="flex items-center gap-3" size="sm">
            <PlusIcon strokeWidth={2} className="h-4 w-4" /> Add Announcement
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["company", "title", "sphere", "urgent", "status", "start date", "end date", "action"].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {announcements?.map((announcement, key) => {
                const className = `py-3 px-5 ${key === announcements.length - 1
                    ? ""
                    : "border-b border-blue-gray-50"
                  }`;

                return (
                  <tr key={announcement.id}>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {announcement.company?.name || announcement.company?.email || "Unknown"}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {announcement.title}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {announcement.sphere}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {announcement.urgent ? "Yes" : "No"}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {announcement.status}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {new Date(announcement.startDate).toLocaleDateString()}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {new Date(announcement.endDate).toLocaleDateString()}
                      </Typography>
                    </td>
                    <td className={className}>
                      <IconButton variant="text" color="blue-gray" onClick={() => handleEditClick(announcement)}>
                        <PencilIcon className="h-4 w-4" />
                      </IconButton>
                      <IconButton variant="text" color="red" onClick={() => handleDeleteClick(announcement.id)}>
                        <TrashIcon className="h-4 w-4" />
                      </IconButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Dialog open={open} handler={handleOpen}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>{isEditing ? "Edit" : "Add"} Announcement</DialogHeader>
          <DialogBody divider className="flex flex-col gap-4">
            <Select
              label="Company"
              value={formData.companyId}
              onChange={(val) => setFormData({ ...formData, companyId: val })}
            >
              {companies.map((company) => (
                <Option key={company.id} value={company.id}>
                  {company.name || company.email}
                </Option>
              ))}
            </Select>
            <Input
              label="Sphere (Area)"
              value={formData.sphere}
              onChange={(e) => setFormData({ ...formData, sphere: e.target.value })}
              required
            />
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4">
                <Typography color="blue-gray" className="font-medium">
                  Faster / Urgent
                </Typography>
                <Switch
                  id="urgent-switch"
                  checked={formData.urgent}
                  onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                />
              </div>
            </div>
            <Select
              label="Status"
              value={formData.status}
              onChange={(val) => setFormData({ ...formData, status: val })}
            >
              <Option value="PENDING">Pending</Option>
              <Option value="PUBLISHED">Published</Option>
              <Option value="REJECTED">Rejected</Option>
              <Option value="ARCHIVED">Archived</Option>
            </Select>
            <Input
              type="date"
              label="Start Date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              type="date"
              label="End Date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
            <div className="flex flex-col gap-2 mt-2">
              <Typography variant="small" color="blue-gray" className="font-medium">
                Images (Max 3)
              </Typography>
              <div className="flex flex-wrap gap-4">
                {existingImages.map((url, i) => (
                  <div key={`existing-${i}`} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-300">
                    <img src={url} alt={`Existing ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                ))}
                
                {previewUrls.map((url, i) => (
                  <div key={`new-${i}`} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-300">
                    <img src={url} alt={`New ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(i)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                ))}
                
                {(existingImages.length + selectedFiles.length) < 3 && (
                  <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700">
                    <PhotoIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs font-medium">Upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="text" color="red" onClick={handleOpen} className="mr-1">
              <span>Cancel</span>
            </Button>
            <Button variant="gradient" color="green" type="submit">
              <span>{isEditing ? "Save" : "Add"}</span>
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}

export default Announcements;
