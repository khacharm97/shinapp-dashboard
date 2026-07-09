import { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Switch,
  Chip
} from "@material-tailwind/react";
import { 
  useGetUsersQuery, 
  useGetUserByIdQuery, 
  useToggleBlockUserMutation, 
  useToggleVerifyUserMutation,
  useGetSkillsQuery,
  useUpdateSkillMutation
} from "../../services/api";

function UserDetailsModal({ open, handleOpen, userId }) {
  const { data: user, isLoading } = useGetUserByIdQuery(userId, { skip: !userId });
  const [toggleBlock] = useToggleBlockUserMutation();
  const [toggleVerify] = useToggleVerifyUserMutation();
  const { data: skillsData } = useGetSkillsQuery();
  const [updateSkill] = useUpdateSkillMutation();

  if (!open) return null;

  const isMaster = user?.roles?.includes('MASTER');

  const unapprovedSkills = user?.userInfo?.skills?.filter(skillKey => {
    const s = skillsData?.find(sd => sd.key === skillKey);
    return s && !s.approved;
  }) || [];

  const handleApproveSkill = async (skillKey) => {
    const skill = skillsData?.find(s => s.key === skillKey);
    if (skill) {
      await updateSkill({ id: skill.id, approved: true }).unwrap();
    }
  };

  return (
    <Dialog open={open} handler={handleOpen} size="md">
      <DialogHeader>User Details</DialogHeader>
      <DialogBody divider className="h-[28rem] overflow-scroll">
        {isLoading || !user ? (
          <Typography>Loading details...</Typography>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                {user.avatarUrl ? (
                  <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${user.avatarUrl}`} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-xl">{user.email?.charAt(0).toUpperCase()}</div>
                )}
                <div>
                  <Typography variant="h5" color="blue-gray">{user.name}</Typography>
                  <Typography variant="small" color="gray">{user.email} | {user.phone}</Typography>
                  <div className="flex gap-2 mt-2">
                    {user.roles?.map(role => (
                      <Chip key={role} value={role} size="sm" color={role === 'MASTER' ? 'green' : 'blue'} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Typography variant="h6" color="blue-gray">Access Control</Typography>
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <Typography color="blue-gray" className="font-semibold">Block User</Typography>
                  <Typography variant="small" color="gray">Prevent user from logging in</Typography>
                </div>
                <Switch 
                  color="red" 
                  checked={user.isBlocked} 
                  onChange={(e) => toggleBlock({ id: user.id, isBlocked: e.target.checked })}
                />
              </div>

              {isMaster && (
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <Typography color="blue-gray" className="font-semibold">Verify Master</Typography>
                    <Typography variant="small" color="gray">Approve master profile to show in search</Typography>
                  </div>
                  <Switch 
                    color="green" 
                    checked={!!user.verifiedAt} 
                    onChange={(e) => toggleVerify({ id: user.id, isVerified: e.target.checked })}
                  />
                </div>
              )}
            </div>

            {isMaster && user.userInfo && (
              <div className="flex flex-col gap-2 mt-4">
                <Typography variant="h6" color="blue-gray">Master Info</Typography>
                <Typography variant="small"><strong>Skills:</strong> {user.userInfo.skills?.join(', ') || 'None'}</Typography>
                <Typography variant="small"><strong>Pricing:</strong> {user.userInfo.pricingFormat} {user.userInfo.priceValue ? `- ${user.userInfo.priceValue}` : ''}</Typography>
                <Typography variant="small"><strong>About:</strong> {user.userInfo.about}</Typography>

                {unapprovedSkills.length > 0 && (
                  <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <Typography variant="small" className="font-bold text-orange-800 mb-2">Unapproved Custom Skills Detected:</Typography>
                    <div className="flex flex-col gap-2">
                      {unapprovedSkills.map(skillKey => {
                        const skill = skillsData?.find(sd => sd.key === skillKey);
                        return (
                          <div key={skillKey} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                            <Typography variant="small" className="font-medium">{skill?.nameEn} ({skillKey})</Typography>
                            <Button size="sm" color="green" onClick={() => handleApproveSkill(skillKey)}>Approve</Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {user.portfolios && user.portfolios.length > 0 && (
                  <div className="mt-4">
                    <Typography variant="h6" color="blue-gray" className="mb-2">Portfolios ({user.portfolios.length})</Typography>
                    <div className="grid grid-cols-2 gap-4">
                      {user.portfolios.map(port => (
                        <div key={port.id} className="border p-2 rounded-lg bg-gray-50">
                          {port.imageUrls && port.imageUrls.length > 0 ? (
                            <div className="flex gap-2 overflow-x-auto mb-2 pb-1">
                              {port.imageUrls.map((url, i) => (
                                <img key={i} src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${url}`} className="w-24 h-24 object-cover rounded shrink-0 border border-gray-200" alt={`${port.title} - ${i + 1}`} />
                              ))}
                            </div>
                          ) : (
                            <div className="w-full h-24 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400">No Image</div>
                          )}
                          <Typography variant="small" className="font-bold truncate">{port.title}</Typography>
                          <Typography variant="small" color="gray" className="truncate">{port.description}</Typography>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={handleOpen}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

export function Users() {
  const { data: users, isLoading, error } = useGetUsersQuery();
  const [selectedUser, setSelectedUser] = useState(null);

  if (isLoading) {
    return <Typography className="p-8 text-center">Loading users...</Typography>;
  }

  if (error) {
    return <Typography color="red" className="p-8 text-center">Failed to load users</Typography>;
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <UserDetailsModal 
        open={!!selectedUser} 
        handleOpen={() => setSelectedUser(null)} 
        userId={selectedUser} 
      />

      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Users Table
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["name", "email", "roles", "joined", "status", "action"].map((el) => (
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
              {users?.map(
                (user, key) => {
                  const className = `py-3 px-5 ${
                    key === users.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={user.id} className="hover:bg-blue-gray-50 transition-colors">
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <div>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-semibold"
                            >
                              {user.name || "No name"}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {user.email || user.phone}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="flex gap-1">
                          {user.roles?.map(role => (
                            <Chip key={role} value={role} size="sm" variant="ghost" color={role === 'MASTER' ? 'green' : 'blue'} />
                          ))}
                        </div>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </td>
                      <td className={className}>
                        {user.isBlocked ? (
                          <Chip value="Blocked" size="sm" color="red" />
                        ) : (
                          <Chip value="Active" size="sm" color="green" />
                        )}
                      </td>
                      <td className={className}>
                        <Button variant="text" size="sm" onClick={() => setSelectedUser(user.id)}>
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default Users;
