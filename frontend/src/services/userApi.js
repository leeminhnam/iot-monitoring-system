import axiosClient from "./axiosClient";

const userApi = {
    getMe: () => {
        return axiosClient.get("/user/me");
    },
};

export default userApi;
