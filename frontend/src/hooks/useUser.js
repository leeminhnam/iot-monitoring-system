import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import userApi from "../services/userApi";
import { message } from "antd";

const fetchUser = async () => {
    const res = await userApi.getMe();
    return res.data?.data || res.data;
};

const useUser = (options = {}) => {
    const { enabled = true, ...rest } = options;

    const query = useQuery({
        queryKey: ["currentUser"],
        queryFn: fetchUser,
        enabled,
        ...rest,
    });

    useEffect(() => {
        if (query.isError) {
            message?.error(
                query.error?.response?.data?.message ||
                "Lỗi khi lấy thông tin người dùng",
            );
        }
    }, [query.isError, query.error]);

    return {
        user: query.data || null,
        loading: query.isLoading || query.isFetching,
        isError: query.isError,
        refetch: query.refetch,
        query,
    };
};

export default useUser;
