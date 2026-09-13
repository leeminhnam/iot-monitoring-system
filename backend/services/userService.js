const User = require("../models/user");
const AppError = require("../utils/appError");

const getMeService = async (userId) => {
    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw new AppError(404, "Không tìm thấy người dùng");
    }

    return user;
};

module.exports = { getMeService };
