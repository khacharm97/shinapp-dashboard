import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/solid";
import { Home, ContactRequests, Skills, Announcements } from "@/pages/dashboard";
import Users from "@/pages/dashboard/users";
import { SignIn } from "@/pages/auth";
import { EnvelopeIcon } from "@heroicons/react/24/solid";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "users",
        path: "/users",
        element: <Users />,
      },
      {
        icon: <EnvelopeIcon {...icon} />,
        name: "contact requests",
        path: "/contact-requests",
        element: <ContactRequests />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "skills",
        path: "/skills",
        element: <Skills />,
      },
      {
        icon: <SpeakerWaveIcon {...icon} />,
        name: "announcements",
        path: "/announcements",
        element: <Announcements />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
    ],
  },
];

export default routes;
