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
  Checkbox
} from "@material-tailwind/react";
import { useCreateUserMutation, useGetSkillsQuery } from "../../services/api";

export function AddUserModal({ open, handleOpen }) {
  const [createUser, { isLoading }] = useCreateUserMutation();
  const { data: skillsData } = useGetSkillsQuery();

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
    website: ""
  });

  const [error, setError] = useState(null);

  // Reset form when opened
  useEffect(() => {
    if (open) {
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
        website: ""
      });
      setError(null);
    }
  }, [open]);

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
    if (!formData.password) {
      setError("Password is required");
      return;
    }

    try {
      await createUser(formData).unwrap();
      handleOpen(); // close modal
    } catch (err) {
      setError(err?.data?.message || err?.message || "Failed to create user. Maybe email/phone already exists?");
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} handler={handleOpen} size="lg">
      <DialogHeader>Add New User</DialogHeader>
      <DialogBody divider className="h-[65vh] overflow-y-auto flex flex-col gap-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Name" name="name" value={formData.name} onChange={handleChange} required />
          <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
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

            {formData.role === "MASTER" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Pricing Format (e.g. hourly, fixed)" name="pricingFormat" value={formData.pricingFormat} onChange={handleChange} />
                <Input label="Price Value (e.g. 5000 AMD)" name="priceValue" value={formData.priceValue} onChange={handleChange} />
              </div>
            )}

            {formData.role === "COMPANY" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="ITN (Tax Number)" name="itn" value={formData.itn} onChange={handleChange} />
                <Input label="Workers Count" name="workersCount" type="number" value={formData.workersCount} onChange={handleChange} />
                <Input label="Website" name="website" value={formData.website} onChange={handleChange} className="md:col-span-2" />
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
          {isLoading ? "Saving..." : "Create User"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
