import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { io } from 'socket.io-client';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const apiUrl = rawApiUrl.startsWith('http') ? rawApiUrl : `https://${rawApiUrl}`;

function connectSocket(namespace) {
  const token = localStorage.getItem('token');
  return io(namespace ? `${apiUrl}/${namespace}` : apiUrl, {
    auth: { token: `Bearer ${token}` },
    extraHeaders: { authorization: `Bearer ${token}` },
  });
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'ContactRequest', 'Skill', 'Announcement', 'SupportConversation', 'SupportMessage', 'Notification'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/admin/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getUsers: builder.query({
      query: () => '/admin/users',
      providesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    toggleBlockUser: builder.mutation({
      query: ({ id, isBlocked }) => ({
        url: `/admin/users/${id}/block`,
        method: 'PUT',
        body: { isBlocked },
      }),
      invalidatesTags: ['User'],
    }),
    toggleVerifyUser: builder.mutation({
      query: ({ id, isVerified }) => ({
        url: `/admin/users/${id}/verify`,
        method: 'PUT',
        body: { isVerified },
      }),
      invalidatesTags: ['User'],
    }),
    getMe: builder.query({
      query: () => '/admin/me',
    }),
    getContactRequests: builder.query({
      query: () => '/admin/contact-requests',
      providesTags: ['ContactRequest'],
    }),
    markContactRequestRead: builder.mutation({
      query: (id) => ({
        url: `/admin/contact-requests/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['ContactRequest'],
    }),
    getSkills: builder.query({
      query: () => '/admin/skills',
      providesTags: ['Skill'],
    }),
    createSkill: builder.mutation({
      query: (skill) => ({
        url: '/admin/skills',
        method: 'POST',
        body: skill,
      }),
      invalidatesTags: ['Skill'],
    }),
    updateSkill: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/admin/skills/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Skill'],
    }),
    uploadSkillIcon: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return { url: '/admin/skills/icon', method: 'POST', body: formData };
      },
    }),
    discardSkillIcons: builder.mutation({
      query: (urls) => ({ url: '/admin/skills/icon', method: 'DELETE', body: { urls } }),
    }),
    deleteSkill: builder.mutation({
      query: (id) => ({
        url: `/admin/skills/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Skill'],
    }),
    getAnnouncements: builder.query({
      query: () => '/admin/announcements',
      providesTags: ['Announcement'],
    }),
    createAnnouncement: builder.mutation({
      query: (announcement) => ({
        url: '/admin/announcements',
        method: 'POST',
        body: announcement,
      }),
      invalidatesTags: ['Announcement'],
    }),
    updateAnnouncement: builder.mutation({
      query: ({ id, body }) => ({
        url: `/admin/announcements/${id}`,
        method: 'PUT',
        body: body,
      }),
      invalidatesTags: ['Announcement'],
    }),
    deleteAnnouncement: builder.mutation({
      query: (id) => ({
        url: `/admin/announcements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Announcement'],
    }),
    createUser: builder.mutation({
      query: (user) => ({
        url: '/admin/users',
        method: 'POST',
        body: user,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...user }) => ({
        url: `/admin/users/${id}`,
        method: 'PUT',
        body: user,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),
    createAdminPortfolio: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/users/${id}/portfolios`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
    deleteAdminPortfolio: builder.mutation({
      query: ({ id, portfolioId }) => ({
        url: `/admin/users/${id}/portfolios/${portfolioId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
    getSupportConversations: builder.query({
      query: () => '/chat/conversations?type=SUPPORT',
      providesTags: ['SupportConversation'],
    }),
    getSupportMessages: builder.query({
      query: (conversationId) => `/chat/conversations/${conversationId}/messages?limit=50`,
      transformResponse: (res) => res.items,
      providesTags: (result, error, conversationId) => [{ type: 'SupportMessage', id: conversationId }],
    }),
    sendSupportMessage: builder.mutation({
      query: (body) => ({ url: '/chat/messages', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            api.util.updateQueryData('getSupportMessages', data.conversationId, (draft) => {
              if (!draft.some((m) => m.id === data.message.id)) draft.push(data.message);
            }),
          );
          dispatch(api.util.invalidateTags(['SupportConversation']));
        } catch {
          // surfaced to the caller via the mutation result
        }
      },
    }),
    markSupportConversationRead: builder.mutation({
      query: (conversationId) => ({
        url: `/chat/conversations/${conversationId}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['SupportConversation'],
    }),
    setSupportConversationStatus: builder.mutation({
      query: ({ conversationId, status }) => ({
        url: `/chat/conversations/${conversationId}/status`,
        method: 'POST',
        body: { status },
      }),
      async onQueryStarted({ conversationId, status }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          api.util.updateQueryData('getSupportConversations', undefined, (draft) => {
            const convo = draft.find((c) => c.id === conversationId);
            if (convo) convo.status = status;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    // Always-mounted in the dashboard navbar — keeps a live chat socket open so
    // support messages update every open thread/list in real time instead of
    // relying on polling, and so the backend sees this admin as "online" and
    // skips redundant push notifications while the dashboard is open.
    getSupportUnreadCount: builder.query({
      query: () => '/chat/unread-count',
      async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch, getState }) {
        const socket = connectSocket('chat');
        try {
          await cacheDataLoaded;

          socket.on('chat:message', ({ conversationId, message, conversationStatus }) => {
            const myId = api.endpoints.getMe.select()(getState())?.data?.id;
            const fromOther = message.senderId !== myId;

            dispatch(
              api.util.updateQueryData('getSupportMessages', conversationId, (draft) => {
                if (!draft.some((m) => m.id === message.id)) draft.push(message);
              }),
            );

            dispatch(
              api.util.updateQueryData('getSupportConversations', undefined, (draft) => {
                const idx = draft.findIndex((c) => c.id === conversationId);
                if (idx === -1) {
                  dispatch(api.util.invalidateTags(['SupportConversation']));
                  return;
                }
                const convo = draft[idx];
                convo.lastMessage = message;
                convo.lastMessageAt = message.createdAt;
                if (conversationStatus) convo.status = conversationStatus;
                if (fromOther) convo.unreadCount += 1;
                draft.splice(idx, 1);
                draft.unshift(convo);
              }),
            );

            if (fromOther) {
              updateCachedData((draft) => {
                draft.count += 1;
              });
            }
          });
        } catch {
          // cache entry removed before load resolved
        }

        await cacheEntryRemoved;
        socket.disconnect();
      },
    }),
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
      async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        const socket = connectSocket();
        try {
          await cacheDataLoaded;
          socket.on('new_notification', (notification) => {
            updateCachedData((draft) => {
              if (draft?.notifications) draft.notifications.unshift(notification);
            });
          });
        } catch {
          // cache entry removed before load resolved
        }
        await cacheEntryRemoved;
        socket.disconnect();
      },
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PUT' }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          api.util.updateQueryData('getNotifications', undefined, (draft) => {
            const target = draft?.notifications?.find((n) => n.id === id);
            if (target) target.isRead = true;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({ url: '/notifications/read-all', method: 'PUT' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          api.util.updateQueryData('getNotifications', undefined, (draft) => {
            draft?.notifications?.forEach((n) => {
              n.isRead = true;
            });
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const { 
  useLoginMutation, 
  useGetUsersQuery,
  useGetUserByIdQuery,
  useToggleBlockUserMutation,
  useToggleVerifyUserMutation,
  useCreateUserMutation,
  useGetMeQuery, 
  useGetContactRequestsQuery, 
  useMarkContactRequestReadMutation,
  useGetSkillsQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useUploadSkillIconMutation,
  useDiscardSkillIconsMutation,
  useDeleteSkillMutation,
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useUpdateUserMutation,
  useCreateAdminPortfolioMutation,
  useDeleteAdminPortfolioMutation,
  useGetSupportConversationsQuery,
  useGetSupportMessagesQuery,
  useSendSupportMessageMutation,
  useMarkSupportConversationReadMutation,
  useSetSupportConversationStatusMutation,
  useGetSupportUnreadCountQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = api;
