import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Textarea,
  Button,
  Avatar,
  Chip,
} from "@material-tailwind/react";
import { PaperAirplaneIcon, LifebuoyIcon, CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import {
  useGetMeQuery,
  useGetSupportConversationsQuery,
  useGetSupportMessagesQuery,
  useSendSupportMessageMutation,
  useMarkSupportConversationReadMutation,
  useSetSupportConversationStatusMutation,
} from "@/services/api";

function customerOf(conversation, myId) {
  return conversation.otherParticipants.find((p) => p.id !== myId) || conversation.otherParticipants[0];
}

function ConversationListItem({ conversation, myId, active, onClick }) {
  const customer = customerOf(conversation, myId);
  const name = customer?.name || customer?.id?.slice(0, 8) || "Unknown";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-blue-gray-50 transition-colors ${
        active ? "bg-blue-50" : "hover:bg-blue-gray-50/50"
      }`}
    >
      <Avatar src={customer?.avatarUrl || "/img/team-1.jpeg"} alt={name} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <Typography variant="small" className="font-semibold text-blue-gray-900 truncate">
            {name}
          </Typography>
          {conversation.unreadCount > 0 && (
            <Chip size="sm" color="blue" value={conversation.unreadCount} className="rounded-full min-w-[1.5rem] text-center" />
          )}
        </div>
        <Typography variant="small" color="blue-gray" className="opacity-70 truncate">
          {conversation.lastMessage?.body || "No messages yet"}
        </Typography>
      </div>
    </button>
  );
}

export function SupportChat() {
  const { data: me } = useGetMeQuery();
  const myId = me?.id;

  const [searchParams, setSearchParams] = useSearchParams();
  const linkedConversationId = searchParams.get("conversationId");

  const { data: conversations, isLoading } = useGetSupportConversationsQuery();
  const [selectedId, setSelectedId] = useState(linkedConversationId || null);
  const [tab, setTab] = useState("open");

  const filteredConversations = (conversations ?? []).filter((c) =>
    tab === "open" ? c.status !== "RESOLVED" : c.status === "RESOLVED"
  );
  const openCount = (conversations ?? []).filter((c) => c.status !== "RESOLVED").length;

  useEffect(() => {
    if (linkedConversationId && linkedConversationId !== selectedId) {
      setSelectedId(linkedConversationId);
      setSearchParams({}, { replace: true });
      const linked = conversations?.find((c) => c.id === linkedConversationId);
      if (linked) setTab(linked.status === "RESOLVED" ? "resolved" : "open");
    } else if (!selectedId && filteredConversations.length > 0) {
      setSelectedId(filteredConversations[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, selectedId, linkedConversationId, tab]);

  const selected = conversations?.find((c) => c.id === selectedId);

  const { data: messages } = useGetSupportMessagesQuery(selectedId, {
    skip: !selectedId,
  });
  const [sendMessage, { isLoading: isSending }] = useSendSupportMessageMutation();
  const [markRead] = useMarkSupportConversationReadMutation();
  const [setStatus, { isLoading: isChangingStatus }] = useSetSupportConversationStatusMutation();
  const [text, setText] = useState("");

  useEffect(() => {
    if (selectedId && selected?.unreadCount > 0) {
      markRead(selectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, selected?.unreadCount]);

  const handleSend = async () => {
    const body = text.trim();
    if (!body || !selectedId || isSending) return;
    setText("");
    await sendMessage({ conversationId: selectedId, body });
  };

  const handleToggleStatus = () => {
    if (!selectedId || !selected) return;
    const nextStatus = selected.status === "RESOLVED" ? "OPEN" : "RESOLVED";
    setStatus({ conversationId: selectedId, status: nextStatus });
    // Resolving closes the thread out of view, back to the Open queue; the
    // effect above then auto-selects the next open conversation, if any.
    if (nextStatus === "RESOLVED") setSelectedId(null);
  };

  const customer = selected ? customerOf(selected, myId) : null;

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6 flex items-center gap-2">
          <LifebuoyIcon className="h-6 w-6 text-white" />
          <Typography variant="h6" color="white">
            Support Chat
          </Typography>
        </CardHeader>
        <CardBody className="px-0 pt-0 pb-0">
          <div className="flex border-t border-blue-gray-50" style={{ height: "70vh" }}>
            <div className="w-80 border-r border-blue-gray-50 flex flex-col shrink-0">
              <div className="flex border-b border-blue-gray-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setTab("open")}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    tab === "open" ? "text-blue-600 border-b-2 border-blue-500" : "text-blue-gray-500 hover:text-blue-gray-700"
                  }`}
                >
                  Open{openCount > 0 ? ` (${openCount})` : ""}
                </button>
                <button
                  type="button"
                  onClick={() => setTab("resolved")}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    tab === "resolved" ? "text-blue-600 border-b-2 border-blue-500" : "text-blue-gray-500 hover:text-blue-gray-700"
                  }`}
                >
                  Resolved
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <Typography className="p-4 text-center text-blue-gray-500">Loading...</Typography>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((c) => (
                    <ConversationListItem
                      key={c.id}
                      conversation={c}
                      myId={myId}
                      active={c.id === selectedId}
                      onClick={() => setSelectedId(c.id)}
                    />
                  ))
                ) : (
                  <Typography className="p-4 text-center text-blue-gray-500">
                    {tab === "open" ? "No open conversations." : "No resolved conversations."}
                  </Typography>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              {!selected ? (
                <div className="flex-1 flex items-center justify-center text-blue-gray-400">
                  Select a conversation
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-blue-gray-50">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={customer?.avatarUrl || "/img/team-1.jpeg"} size="sm" />
                      <Typography variant="h6" color="blue-gray" className="truncate">
                        {customer?.name || "Customer"}
                      </Typography>
                      {selected.status === "RESOLVED" && (
                        <Chip size="sm" color="green" value="Resolved" className="rounded-full" />
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outlined"
                      className="flex items-center gap-2 shrink-0"
                      onClick={handleToggleStatus}
                      disabled={isChangingStatus}
                    >
                      {selected.status === "RESOLVED" ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4" /> Reopen
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4" /> Resolve
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-blue-gray-50/30">
                    {messages?.map((m) => {
                      const mine = m.senderId === myId;
                      return (
                        <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[70%] rounded-xl px-4 py-2 text-sm ${
                              mine ? "bg-blue-500 text-white" : "bg-white border border-blue-gray-100 text-blue-gray-900"
                            }`}
                          >
                            {m.body}
                            <div className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-blue-gray-400"}`}>
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-3 border-t border-blue-gray-50 flex items-end gap-2">
                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      rows={1}
                      placeholder="Reply to customer..."
                      className="!border-blue-gray-200 focus:!border-blue-500"
                      labelProps={{ className: "before:content-none after:content-none" }}
                    />
                    <Button
                      className="flex items-center gap-2 shrink-0"
                      onClick={handleSend}
                      disabled={!text.trim() || isSending}
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default SupportChat;
