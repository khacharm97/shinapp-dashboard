import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
  tagTypes: ['User', 'ContactRequest', 'Skill', 'Announcement'],
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
      query: ({ id, ...patch }) => ({
        url: `/admin/announcements/${id}`,
        method: 'PUT',
        body: patch,
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
  }),
});

export const { 
  useLoginMutation, 
  useGetUsersQuery,
  useGetUserByIdQuery,
  useToggleBlockUserMutation,
  useToggleVerifyUserMutation,
  useGetMeQuery, 
  useGetContactRequestsQuery, 
  useMarkContactRequestReadMutation,
  useGetSkillsQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation
} = api;
