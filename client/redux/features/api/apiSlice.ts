/* eslint-disable @typescript-eslint/no-unused-vars */
import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:8000/api/v1/",
    }),
    endpoints: (builder) => ({
        refreshToken: builder.query({
          query: (data) => ({
            url: "refresh",
            method: "GET",
            credentials: "include" as const,
          }),
        }),
    }),
});

export const {} = apiSlice;