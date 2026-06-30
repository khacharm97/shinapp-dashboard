import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Accordion,
  AccordionHeader,
  AccordionBody,
  Chip,
} from "@material-tailwind/react";
import { useState } from "react";
import { useGetContactRequestsQuery, useMarkContactRequestReadMutation } from "../../services/api";
import { EnvelopeIcon, EnvelopeOpenIcon } from "@heroicons/react/24/solid";

export function ContactRequests() {
  const { data: requests, isLoading, error } = useGetContactRequestsQuery();
  const [markAsRead] = useMarkContactRequestReadMutation();
  const [open, setOpen] = useState(0);

  const handleOpen = (value, req) => {
    setOpen(open === value ? 0 : value);
    if (open !== value && !req.isRead) {
      markAsRead(req.id);
    }
  };

  if (isLoading) {
    return <Typography className="p-8 text-center">Loading contact requests...</Typography>;
  }

  if (error) {
    return <Typography color="red" className="p-8 text-center">Failed to load contact requests</Typography>;
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6 flex justify-between items-center">
          <Typography variant="h6" color="white">
            Contact Requests
          </Typography>
        </CardHeader>
        <CardBody className="px-4 pt-0 pb-6">
          {requests?.length === 0 ? (
            <Typography className="text-center text-blue-gray-500 py-4">
              No contact requests found.
            </Typography>
          ) : (
            <div className="flex flex-col gap-2">
              {requests?.map((req, index) => {
                const isOpen = open === index + 1;
                return (
                  <Accordion
                    key={req.id}
                    open={isOpen}
                    className="border border-blue-gray-100 px-4 rounded-lg"
                  >
                    <AccordionHeader
                      onClick={() => handleOpen(index + 1, req)}
                      className={`border-b-0 transition-colors ${
                        isOpen ? "text-blue-500 hover:!text-blue-700" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          {req.isRead ? (
                            <EnvelopeOpenIcon className="h-5 w-5 text-blue-gray-400" />
                          ) : (
                            <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                          )}
                          <Typography variant="h6" color="blue-gray" className={req.isRead ? "font-normal" : "font-bold"}>
                            {req.firstName || req.lastName ? `${req.firstName || ''} ${req.lastName || ''}`.trim() : req.email}
                          </Typography>
                          {!req.isRead && (
                            <Chip size="sm" color="blue" value="New" className="ml-2 rounded-full" />
                          )}
                        </div>
                        <Typography variant="small" color="blue-gray" className="font-normal opacity-70">
                          {new Date(req.createdAt).toLocaleString()}
                        </Typography>
                      </div>
                    </AccordionHeader>
                    <AccordionBody className="pt-0 text-base font-normal">
                      <div className="flex flex-col gap-4 p-4 bg-blue-gray-50/50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Typography variant="small" color="blue-gray" className="font-bold opacity-70 uppercase">
                              Email Address
                            </Typography>
                            <Typography color="blue-gray">{req.email}</Typography>
                          </div>
                          <div>
                            <Typography variant="small" color="blue-gray" className="font-bold opacity-70 uppercase">
                              Type
                            </Typography>
                            <Typography color="blue-gray">
                              {req.contact ? "Contact Request" : "Estimate Request"}
                            </Typography>
                          </div>
                        </div>
                        {req.notes && (
                          <div className="mt-2">
                            <Typography variant="small" color="blue-gray" className="font-bold opacity-70 uppercase mb-1">
                              Notes / Details
                            </Typography>
                            <div className="p-3 bg-white rounded border border-blue-gray-100 whitespace-pre-wrap text-sm text-blue-gray-800">
                              {req.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionBody>
                  </Accordion>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default ContactRequests;
