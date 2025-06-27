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
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 30px; background-color: #f9f9f9;">
      <h2 style="color: #333;">🔒 Password Reset Request</h2>
      <p style="font-size: 16px; color: #555;">
        Hello,<br /><br />
        We received a request to reset your password for your <strong>RealChat</strong> account.
        Click the button below to proceed. If you did not make this request, you can safely ignore this email.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background-color: #007BFF; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 14px; color: #999;">
        If the button above doesn't work, copy and paste the following link into your browser:<br />
        <a href="${url}" style="color: #007BFF;">${url}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        &copy; ${new Date().getFullYear()} RealChat. All rights reserved.
      </p>
    </div>
  `,
    };

    const response = await transporter.sendMail(mailOptions);
    return response;
  } catch (error) {
    throw new ApiError(500, "Server error while sending email", error);
  }
};

export { sendResetPasswordEmail };
