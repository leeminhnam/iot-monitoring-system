import axiosClient from "./axiosClient";

const deviceApi = {
  getDevices: () => {
    return axiosClient.get("/devices");
  },
  toggleDevice: (deviceId, action) => {
    return axiosClient.post(`/devices/${deviceId}/toggle`, { action });
  },
};

export default deviceApi;