import { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Typography,
  Textarea,
  Checkbox,
  Switch
} from "@material-tailwind/react";
import { useCreateUserMutation, useUpdateUserMutation, useGetSkillsQuery } from "../../services/api";
import { armeniaRegions } from "../../lib/armenia-regions";

export function AddUserModal({ open, handleOpen, initialData }) {
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const { data: skillsData } = useGetSkillsQuery();
  const isLoading = isCreating || isUpdating;
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
    skills: [],
    pricingFormat: "",
    priceValue: "",
    about: "",
    itn: "",
    workersCount: "",
    website: "",
    regionId: "",
    cityId: "",
    largeScale: false,
    urgentOrders: false,
    onlinePay: false,
    buyMaterial: false,
    nightShift: false,
    socialFacebook: "",
    socialInstagram: "",
    socialTiktok: ""
  });

  const [error, setError] = useState(null);

  // Reset form when opened
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          id: initialData.id,
          name: initialData.name || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          password: "",
          role: initialData.roles?.[0] || "USER",
          skills: initialData.userInfo?.skills || [],
          pricingFormat: initialData.userInfo?.pricingFormat || "",
          priceValue: initialData.userInfo?.priceValue || "",
          about: initialData.userInfo?.about || "",
          itn: initialData.userInfo?.itn || "",
          workersCount: initialData.userInfo?.workersCount || "",
          website: initialData.userInfo?.website || "",
          regionId: initialData.userInfo?.regionId || "",
          cityId: initialData.userInfo?.cityId || "",
          largeScale: initialData.userInfo?.largeScale || false,
          urgentOrders: initialData.userInfo?.urgentOrders || false,
          onlinePay: initialData.userInfo?.onlinePay || false,
          buyMaterial: initialData.userInfo?.buyMaterial || false,
          nightShift: initialData.userInfo?.nightShift || false,
          socialFacebook: initialData.userInfo?.socialFacebook || "",
          socialInstagram: initialData.userInfo?.socialInstagram || "",
          socialTiktok: initialData.userInfo?.socialTiktok || ""
        });
      } else {
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          role: "USER",
          skills: [],
          pricingFormat: "",
          priceValue: "",
          about: "",
          itn: "",
          workersCount: "",
          website: "",
          regionId: "",
          cityId: "",
          largeScale: false,
          urgentOrders: false,
          onlinePay: false,
          buyMaterial: false,
          nightShift: false,
          socialFacebook: "",
          socialInstagram: "",
          socialTiktok: ""
        });
      }
      setError(null);
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    setFormData(prev => ({ ...prev, role: e.target.value }));
  };

  const handleSkillToggle = (skillKey) => {
    setFormData(prev => {
      const skills = prev.skills.includes(skillKey)
        ? prev.skills.filter(k => k !== skillKey)
        : [...prev.skills, skillKey];
      return { ...prev, skills };
    });
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!formData.email && !formData.phone) {
      setError("Please provide either email or phone");
      return;
    }
    if (!formData.name) {
      setError("Name is required");
      return;
    }
    if (!isEditMode && !formData.password) {
      setError("Password is required");
      return;
    }

    try {
      if (isEditMode) {
        await updateUser(formData).unwrap();
      } else {
        await createUser(formData).unwrap();
      }
      handleOpen(); // close modal
    } catch (err) {
      setError(err?.data?.message || err?.message || "Failed to save user.");
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} handler={handleOpen} size="lg">
      <DialogHeader>{isEditMode ? "Edit User" : "Add New User"}</DialogHeader>
      <DialogBody divider className="h-[65vh] overflow-y-auto flex flex-col gap-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Name" name="name" value={formData.name} onChange={handleChange} required />
          <Input label={isEditMode ? "New Password (optional)" : "Password"} name="password" type="password" value={formData.password} onChange={handleChange} required={!isEditMode} />
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
          <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
        </div>

        <div className="flex flex-col gap-2">
          <Typography variant="small" color="blue-gray" className="font-bold">
            Role
          </Typography>
          <select 
            className="w-full border border-blue-gray-200 rounded-lg px-3 py-2.5 text-sm text-blue-gray-700 focus:border-blue-500 focus:outline-none"
            name="role" 
            value={formData.role} 
            onChange={handleRoleChange}
          >
            <option value="USER">User</option>
            <option value="MASTER">Master</option>
            <option value="COMPANY">Company</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* Dynamic Fields for MASTER or COMPANY */}
        {(formData.role === "MASTER" || formData.role === "COMPANY") && (
          <div className="flex flex-col gap-6 border-t pt-4">
            <Typography variant="h6" color="blue-gray">
              {formData.role === "MASTER" ? "Master Details" : "Company Details"}
            </Typography>

            {/* Region & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Typography variant="small" color="blue-gray" className="font-bold">
                  Region
                </Typography>
                <select 
                  className="w-full border border-blue-gray-200 rounded-lg px-3 py-2.5 text-sm text-blue-gray-700 focus:border-blue-500 focus:outline-none"
                  name="regionId" 
                  value={formData.regionId} 
                  onChange={(e) => {
                    handleChange(e);
                    setFormData(prev => ({ ...prev, cityId: "" }));
                  }}
                >
                  <option value="">Select Region</option>
                  {armeniaRegions.map(region => (
                    <option key={region.id} value={region.id}>{region.nameEn}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Typography variant="small" color="blue-gray" className="font-bold">
                  City
                </Typography>
                <select 
                  className="w-full border border-blue-gray-200 rounded-lg px-3 py-2.5 text-sm text-blue-gray-700 focus:border-blue-500 focus:outline-none"
                  name="cityId" 
                  value={formData.cityId} 
                  onChange={handleChange}
                  disabled={!formData.regionId}
                >
                  <option value="">Select City</option>
                  {armeniaRegions.find(r => r.id === formData.regionId)?.cities.map(city => (
                    <option key={city.id} value={city.id}>{city.nameEn}</option>
                  ))}
                </select>
              </div>
            </div>

            {formData.role === "MASTER" && (
              <>
                <div className="flex flex-col gap-2">
                  <Typography variant="small" color="blue-gray" className="font-bold">
                    Skills
                  </Typography>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border border-blue-gray-100 p-4 rounded-lg max-h-48 overflow-y-auto">
                    {skillsData?.map(skill => (
                      <Checkbox 
                        key={skill.key}
                        label={skill.nameEn}
                        checked={formData.skills.includes(skill.key)}
                        onChange={() => handleSkillToggle(skill.key)}
                        containerProps={{ className: "p-0" }}
                        labelProps={{ className: "text-sm" }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Pricing Format (e.g. hourly, fixed)" name="pricingFormat" value={formData.pricingFormat} onChange={handleChange} />
                  <Input label="Price Value (e.g. 5000 AMD)" name="priceValue" value={formData.priceValue} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border border-blue-gray-100 p-4 rounded-lg">
                  <Switch id="largeScale" name="largeScale" label="Large Scale" checked={formData.largeScale} onChange={handleSwitchChange} />
                  <Switch id="urgentOrders" name="urgentOrders" label="Urgent Orders" checked={formData.urgentOrders} onChange={handleSwitchChange} />
                  <Switch id="onlinePay" name="onlinePay" label="Online Pay" checked={formData.onlinePay} onChange={handleSwitchChange} />
                  <Switch id="buyMaterial" name="buyMaterial" label="Buy Material" checked={formData.buyMaterial} onChange={handleSwitchChange} />
                  <Switch id="nightShift" name="nightShift" label="Night Shift" checked={formData.nightShift} onChange={handleSwitchChange} />
                </div>
              </>
            )}

            {formData.role === "COMPANY" && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="ITN (Tax Number)" name="itn" value={formData.itn} onChange={handleChange} />
                  <Input label="Workers Count" name="workersCount" type="number" value={formData.workersCount} onChange={handleChange} />
                  <Input label="Website" name="website" value={formData.website} onChange={handleChange} className="md:col-span-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Facebook" name="socialFacebook" value={formData.socialFacebook} onChange={handleChange} />
                  <Input label="Instagram" name="socialInstagram" value={formData.socialInstagram} onChange={handleChange} />
                  <Input label="TikTok" name="socialTiktok" value={formData.socialTiktok} onChange={handleChange} />
                </div>
              </div>
            )}

            <Textarea label="About" name="about" value={formData.about} onChange={handleChange} />
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={handleOpen} className="mr-2">
          Cancel
        </Button>
        <Button variant="gradient" color="blue" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Saving..." : (isEditMode ? "Save Changes" : "Create User")}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
