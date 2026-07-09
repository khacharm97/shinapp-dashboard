import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Checkbox,
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon, CheckCircleIcon, PlusIcon } from "@heroicons/react/24/solid";
import { 
  useGetSkillsQuery, 
  useCreateSkillMutation, 
  useUpdateSkillMutation, 
  useDeleteSkillMutation 
} from "../../services/api";

export function Skills() {
  const { data: skills, isLoading } = useGetSkillsQuery();
  const [createSkill] = useCreateSkillMutation();
  const [updateSkill] = useUpdateSkillMutation();
  const [deleteSkill] = useDeleteSkillMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    key: "",
    nameEn: "",
    nameAm: "",
    nameRu: "",
    approved: true,
  });

  const handleOpenDialog = (skill = null) => {
    if (skill) {
      setEditingSkill(skill.id);
      setFormData({
        key: skill.key,
        nameEn: skill.nameEn,
        nameAm: skill.nameAm,
        nameRu: skill.nameRu,
        approved: skill.approved,
      });
    } else {
      setEditingSkill(null);
      setFormData({
        key: "",
        nameEn: "",
        nameAm: "",
        nameRu: "",
        approved: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSave = async () => {
    if (editingSkill) {
      await updateSkill({ id: editingSkill, ...formData });
    } else {
      await createSkill(formData);
    }
    handleCloseDialog();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      await deleteSkill(id);
    }
  };

  const handleApprove = async (skill) => {
    await updateSkill({ id: skill.id, approved: true });
  };

  if (isLoading) return <Typography className="p-8 text-center">Loading skills...</Typography>;

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6 flex justify-between items-center">
          <Typography variant="h6" color="white">
            Skills Management
          </Typography>
          <Button color="white" className="flex items-center gap-2" onClick={() => handleOpenDialog()}>
            <PlusIcon className="h-4 w-4 text-blue-500" /> <span className="text-blue-500">Add Skill</span>
          </Button>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Key", "English", "Armenian", "Russian", "Status", "Actions"].map((el) => (
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
              {skills?.map((skill, key) => {
                const className = `py-3 px-5 ${
                  key === skills.length - 1 ? "" : "border-b border-blue-gray-50"
                }`;

                return (
                  <tr key={skill.id}>
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        {skill.key}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-normal text-blue-gray-600">
                        {skill.nameEn}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-normal text-blue-gray-600">
                        {skill.nameAm}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-normal text-blue-gray-600">
                        {skill.nameRu}
                      </Typography>
                    </td>
                    <td className={className}>
                      <div className="flex items-center gap-2">
                        {skill.approved ? (
                          <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded">Approved</span>
                        ) : (
                          <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded">Pending</span>
                        )}
                      </div>
                    </td>
                    <td className={className}>
                      <div className="flex items-center gap-2">
                        {!skill.approved && (
                          <Button variant="text" color="green" size="sm" onClick={() => handleApprove(skill)} title="Approve">
                            <CheckCircleIcon className="h-5 w-5" />
                          </Button>
                        )}
                        <Button variant="text" color="blue" size="sm" onClick={() => handleOpenDialog(skill)} title="Edit">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="text" color="red" size="sm" onClick={() => handleDelete(skill.id)} title="Delete">
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Dialog open={openDialog} handler={handleCloseDialog}>
        <DialogHeader>{editingSkill ? "Edit Skill" : "Add New Skill"}</DialogHeader>
        <DialogBody divider className="flex flex-col gap-4">
          <Input 
            label="Key" 
            value={formData.key} 
            onChange={(e) => setFormData({ ...formData, key: e.target.value })} 
            disabled={!!editingSkill}
          />
          <Input 
            label="English Name" 
            value={formData.nameEn} 
            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} 
          />
          <Input 
            label="Armenian Name" 
            value={formData.nameAm} 
            onChange={(e) => setFormData({ ...formData, nameAm: e.target.value })} 
          />
          <Input 
            label="Russian Name" 
            value={formData.nameRu} 
            onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })} 
          />
          <div className="flex items-center gap-2">
            <Checkbox 
              id="approved"
              checked={formData.approved} 
              onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
              label="Approved"
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={handleCloseDialog} className="mr-1">
            Cancel
          </Button>
          <Button variant="gradient" color="blue" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Skills;
