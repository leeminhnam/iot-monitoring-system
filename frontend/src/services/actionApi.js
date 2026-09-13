import axiosClient from "./axiosClient";

const actionApi = {
  getActionHistory: (params) => {
    return axiosClient.get("/actions", { params });
  }
};

export default actionApi;