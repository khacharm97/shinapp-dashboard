import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'ContactRequest'],
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
  }),
});

export const { useLoginMutation, useGetUsersQuery, useGetMeQuery, useGetContactRequestsQuery, useMarkContactRequestReadMutation } = api;
