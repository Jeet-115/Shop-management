import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, text, html, attachments }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"SANT CORPORATION" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: text || "",
    html: html || undefined,
    attachments: attachments || [], // ✅ Pass attachments to nodemailer
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
