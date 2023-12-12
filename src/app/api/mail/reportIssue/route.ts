import nodemailer from "nodemailer";
import { successResponse, errorResponse } from "../../responses";

export async function POST(request: Request) {
  try {
    const { name, email, issue, message, token } = (await request.json()) as {
      name: string;
      email: string;
      issue: string;
      message: string;
      token: string;
    };

    if (!name || !email || !issue || !message || !token) {
      return errorResponse("Missing required fields", 400);
    }

    // const recaptchaData = {
    //   event: {
    //     token,
    //     expectedAction: "CONTACT_FORM",
    //     siteKey: "6Lc4IC0pAAAAAL5HI5yBegQkmeYpYS619IaJi8kO",
    //   },
    // };

    // if (process.env.RECAPTCHA_API_KEY != "TESTING") {
    //   const recaptcha = await fetch(
    //     `https://recaptchaenterprise.googleapis.com/v1/projects/chesstrainingapp-2/assessments?key=${process.env.RECAPTCHA_API_KEY}`,
    //     {
    //       method: "POST",
    //       body: JSON.stringify(recaptchaData),
    //     },
    //   );

    //   const recaptchaResponse = await recaptcha.json();

    //   if (recaptchaResponse.tokenProperties.valid !== true) {
    //     return errorResponse("Invalid recaptcha", 400);
    //   }

    //   if (recaptchaResponse.tokenProperties.action !== "CONTACT_FORM") {
    //     return errorResponse("Invalid recaptcha action", 400);
    //   }

    //   if (recaptchaResponse.tokenProperties.score < 0.5) {
    //     return errorResponse("Invalid recaptcha score", 400);
    //   }

    //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //   if (!emailRegex.test(email)) {
    //     return errorResponse("Invalid email", 400);
    //   }
    // }

    const transporter = nodemailer.createTransport({
      // @ts-expect-error : types are wrong, host is required
      host: process.env.SMTP_HOST!,
      port: process.env.SMTP_PORT!,
      secure: false,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    });
    await transporter.sendMail({
      from: `${name} <${email}>`,
      to: "product@chesstraining.app",
      subject: "Issue Reported: " + issue,
      text: `From: ${name} <${email}>
Issue Type: ${issue}
Message:
${message}`,
    });

    return successResponse("Message sent", {}, 200);
  } catch (e) {
    if (e instanceof Error) {
      return errorResponse(e.message, 500);
    }
    return errorResponse("Unknown error", 500);
  }
}
