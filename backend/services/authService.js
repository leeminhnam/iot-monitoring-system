const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const AppError = require("../utils/appError");
require("dotenv").config();

const loginService = async ({ username, password }) => {
    const user = await User.findOne({ username });

    if (!user) {
        throw new AppError(400, "Tài khoản hoặc mật khẩu không chính xác");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AppError(400, "Tài khoản hoặc mật khẩu không chính xác");
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.secretKey,
        { expiresIn: "1h" }
    );

    return token;
};

module.exports = { loginService };