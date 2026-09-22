import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Chip,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ClockIcon,
  Bars3Icon,
  LifebuoyIcon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
} from "@/context";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useGetSupportUnreadCountQuery,
} from "@/services/api";

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Always mounted here so the chat socket (and therefore real-time support
  // updates) stays alive across every dashboard page, not just the Support
  // Chat page itself.
  useGetSupportUnreadCountQuery(undefined, { skip: !token });

  const { data: notificationsData } = useGetNotificationsQuery(undefined, { skip: !token });
  const [markNotificationRead] = useMarkNotificationReadMutation();
  const notifications = notificationsData?.notifications ?? [];
  const unreadNotifications = notifications.filter((n) => !n.isRead);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) markNotificationRead(notification.id);
    if (notification.metadata?.conversationId) {
      navigate(`/dashboard/support-chat?conversationId=${notification.metadata.conversationId}`);
    }
  };

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
          : "px-0 py-1"
      }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${
              fixedNavbar ? "mt-1" : ""
            }`}
          >
            <Link to={`/${layout}`}>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
              >
                {layout}
              </Typography>
            </Link>
            <Typography
              variant="small"
              color="blue-gray"
              className="font-normal"
            >
              {page}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h6" color="blue-gray">
            {page}
          </Typography>
        </div>
        <div className="flex items-center">
          <div className="mr-auto md:mr-4 md:w-56">
            <Input label="Search" />
          </div>
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
          </IconButton>
          {token ? (
            <div
              className="cursor-pointer"
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/auth/sign-in');
              }}
            >
              <Button
                variant="text"
                color="blue-gray"
                className="hidden items-center gap-1 px-4 xl:flex normal-case"
              >
                <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
                Logout
              </Button>
              <IconButton
                variant="text"
                color="blue-gray"
                className="grid xl:hidden"
              >
                <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
              </IconButton>
            </div>
          ) : (
            <Link to="/auth/sign-in">
              <Button
                variant="text"
                color="blue-gray"
                className="hidden items-center gap-1 px-4 xl:flex normal-case"
              >
                <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
                Sign In
              </Button>
              <IconButton
                variant="text"
                color="blue-gray"
                className="grid xl:hidden"
              >
                <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
              </IconButton>
            </Link>
          )}
          <Menu>
            <MenuHandler>
              <IconButton variant="text" color="blue-gray" className="relative">
                <BellIcon className="h-5 w-5 text-blue-gray-500" />
                {unreadNotifications.length > 0 && (
                  <Chip
                    size="sm"
                    value={unreadNotifications.length > 9 ? "9+" : unreadNotifications.length}
                    color="red"
                    className="absolute -top-1 -right-1 rounded-full h-5 min-w-5 flex items-center justify-center p-0 text-[10px]"
                  />
                )}
              </IconButton>
            </MenuHandler>
            <MenuList className="w-80 max-h-96 overflow-y-auto border-0">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-blue-gray-400 text-sm">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <MenuItem
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-center gap-3 ${!n.isRead ? "bg-blue-50" : ""}`}
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-tr from-blue-500 to-blue-700">
                      <LifebuoyIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <Typography variant="small" color="blue-gray" className="mb-1 font-normal truncate">
                        <strong>{n.title}</strong>
                      </Typography>
                      <Typography variant="small" color="blue-gray" className="truncate opacity-70">
                        {n.message}
                      </Typography>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="flex items-center gap-1 text-xs font-normal opacity-60"
                      >
                        <ClockIcon className="h-3.5 w-3.5" /> {timeAgo(n.createdAt)}
                      </Typography>
                    </div>
                  </MenuItem>
                ))
              )}
            </MenuList>
          </Menu>
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className="h-5 w-5 text-blue-gray-500" />
          </IconButton>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
