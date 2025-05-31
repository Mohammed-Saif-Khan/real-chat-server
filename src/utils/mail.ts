import nodemailer from "nodemailer";
import { ApiError } from "./ApiError";

const sendResetPasswordEmail = async (email: string, url: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      port: 465,
      auth: {
        user: process.env.USER_MAIL!,
        pass: process.env.USER_MAIL_PASSWORD!,
      },
    });

    const mailOptions = {
      from: "realchat@gmail.com",
      to: email,
      subject: "Reset Your Password",
      html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
    };

    const response = await transporter.sendMail(mailOptions);
    return response;
  } catch (error) {
    throw new ApiError(500, "Server error while sending email", error);
  }
};

export { sendResetPasswordEmail };
