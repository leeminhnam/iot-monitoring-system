import axiosClient from "./axiosClient";

const sensorApi = {
  getSensorData: (params) => {
    return axiosClient.get("/sensors/data", { params });
  },
  getLatestSensorData: () => {
    return axiosClient.get("/sensors/data/latest");
  },
};

export default sensorApi;