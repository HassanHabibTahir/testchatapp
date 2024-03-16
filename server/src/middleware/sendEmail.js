import sgMail from "@sendgrid/mail";
import { config } from "../utils/url.js";
const { SENDGRID_API_KEY, SMTP_USER } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);
const returnHtml = (otp) => {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Document</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body{
          background-color: #fff !important;
        }
        .main {
          width: 100%;
          height: auto;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #fff;
          font-family: sans-serif;
          color: #000;
        }
        .container {
          padding: 0 30px;
        }
  
        .button {
          padding: 15px 25px;
          background-color: #fa621c;
          border: 1px solid #fa621c;
          border-radius: 15px;
          color: #fff;
          letter-spacing: 2px;
          font-size: 18px;
          font-weight: bold;
          width: fit-content;
        }
        a:link {
          color: #fff;
          text-decoration: none;
        }
        a:hover {
          text-decoration: none;
        }
        h1 {
          text-align: center;
        }
        .firstParagraph {
          margin-top: 40px;
          margin-bottom: 30px;
          font-size: 20px;
        }
        .secondParagraph {
          margin-top: 10px;
          font-size: 15px;
        }
        .logo {
          text-align: center;
          margin-bottom: 50px;
        }
      </style>
    </head>
    <body>
      <div class="main">
        <div class="container">
          <div class="logo">
            <img
              class="img"
              width="200px"
              src="${config.production.server}/uploads/checkOut.png"/>
          </div>
          <h1>Confirm Your Email</h1>
          <p class="firstParagraph">
            Please use the following code to confirm your account.
          </p>
          <div class="button">${otp}</div>
          <br />
          <p class="secondParagraph">Thank you</p>
          <p class="secondParagraph">MarketSpace 360</p>
        </div>
      </div>
    </body>
  </html>
  `;
};

// ============================== send Verification Mail For SignUp========================
export const sendVerificationMailForSignUp = async (toMail, otp) => {
  // const verifyUrl = `${
  //   config[process.env.NODE_ENV].server
  // }/api/auth/verify-signup-email?token=${token}`;

  const msg = {
    to: toMail,
    from: { name: "MarketSpace360", email: SMTP_USER },
    subject: "Verification Code MarketSpace 360 App",
    text: "Please Click The Below Link To Verify Your Email Address",
    html: returnHtml(otp),
  };

  await sgMail.send(msg);
};

// ============================== Send Opt in MAil For ResetPassword========================
export const sendOptMailForResetPass = async (toMail, otp) => {
  const msg = {
    to: toMail,
    from: { name: "MarketSpace 360", email: SMTP_USER },
    subject: "Verification Code MarketSpace 360 App",
    text: "Please Click The Below Link To Verify Your Email Address",
    html: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body{
            background-color: #fff !important;
          }
          .main {
            width: 100%;
            height: auto;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #fff;
            font-family: sans-serif;
            color: #000;
          }
          .container {
            padding: 0 30px;
          }
    
          .button {
            padding: 15px 25px;
            background-color: #fa621c;
            border: 1px solid #fa621c;
            border-radius: 15px;
            color: #fff;
            letter-spacing: 2px;
            font-size: 18px;
            font-weight: bold;
            width: fit-content;
          }
          a:link {
            color: #fff;
            text-decoration: none;
          }
          a:hover {
            text-decoration: none;
          }
          h1 {
            text-align: center;
          }
          .firstParagraph {
            margin-top: 40px;
            margin-bottom: 30px;
            font-size: 20px;
          }
          .secondParagraph {
            margin-top: 10px;
            font-size: 15px;
          }
          .logo {
            text-align: center;
            margin-bottom: 50px;
          }
        </style>
      </head>
      <body>
        <div class="main">
          <div class="container">
            <div class="logo">
              <img
                class="img"
                width="200px"
                src="${config.production.server}/uploads/checkOut.png"/>
            </div>
            <h1>Confirm Your Email</h1>
            <p class="firstParagraph">
              Please use the following code to reset your password.
            </p>
            <div class="button">${otp}</div>
            <br />
            <p class="secondParagraph">Thank you</p>
            <p class="secondParagraph">MarketSpace 360</p>
          </div>
        </div>
      </body>
    </html>
    
    `,
  };

  await sgMail.send(msg);
};

// ============================== Send Notification Email ========================
export const sendMailForNotification = async ({ toMail, body, name, type }) => {
  const msg = {
    to: toMail,
    from: { name: "MarketSpace 360", email: SMTP_USER },
    subject: "Notification MarketSpace 360 App",
    text: "notification",
    html: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          .main {
            width: 100%;
            height: auto;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #fff !important;
            font-family: sans-serif;
            color: #000;
          }
          .container {
            padding: 0 30px;
          }
          body {
            background-color: #fff !important;
          }
          .button {
            padding: 20px;
            background-color: #fa621c;
            border-radius: 15px;
            color: #fff;
    
            font-size: 18px;
            font-weight: bold;
          }
          h1 {
            text-align: center;
          }
          .firstParagraph {
            margin: 25px 15px;
            font-size: 20px;
          }
          .secondParagraph {
            margin: 25px 0px;
            font-size: 20px;
            max-width: 500px;
          }
          .logo {
            text-align: center;
            margin-bottom: 50px;
          }
        </style>
      </head>
      <body>
        <div class="main">
          <div class="container">
            <div class="logo">
              <img
                class="img"
                width="200px"
                src="${config.production.server}/uploads/checkOut.png"/>
             
            </div>
            <h1>You got a new Notification</h1>
            <p class="firstParagraph">Hi, ${name}</p>
            <p class="firstParagraph">
              We have some new notifications regarding your account.
            </p>
            <div class="button">
              <h2>${type}</h2>
              <p class="secondParagraph">
              ${body}
              </p>
            </div>
            <br />
            <p class="firstParagraph">Thank you</p>
            <p class="firstParagraph">MarketSpace 360</p>
          </div>
        </div>
      </body>
    </html>        
    `,
  };

  await sgMail.send(msg);
};

// ============================== Send Notification approveIdentity ========================
export const sendMailForapproveIdentity = async (
  adminEmail,
  { firstName, lastName, email, docs_for_identify }
) => {
  const msg = {
    to: adminEmail,
    from: { name: "MarketSpace 360", email: SMTP_USER },
    subject: "Verification Document MarketSpace 360 App",
    text: "Identification Verification Document",
    html: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          .main {
            width: 100%;
            height: auto;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #fff !important;
            font-family: sans-serif;
            color: #000;
          }
          .container {
            padding: 0 30px;
          }
          body {
            background-color: #fff !important;
          }
          .button {
            border: 2px solid #f32700 !important;
            border-radius: 8px;
            text-align: center;
          }
          h1 {
            text-align: center;
          }
          .firstParagraph {
            margin: 20px 15px;
            font-size: 20px;
          }
          .secondParagraph {
            margin: 20px 15px;
            font-size: 20px;
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          span{
            font-weight:600;
          }
        </style>
      </head>
      <body>
        <div class="main">
          <div class="container">
            <div class="logo">
              <img
                class="img"
                width="200px"
                src="${config.production.server}/uploads/checkOut.png"/>
            </div>
            <h1>Verification Documents</h1>
            <p class="firstParagraph"><span>Name :</span> ${
              firstName + " " + lastName
            } </p>
            <p class="firstParagraph"><span>Email :</span> ${email} </p>
            <div class="button">
            <img
              class="img"
              width="300px"
              height="300px"
              srcSet="${docs_for_identify}"
              src="${docs_for_identify}"
            />
          </div>
          <p class="secondParagraph">Please check your dashboard to verify user identity verification.</p>
            <p class="firstParagraph">Thank you</p>
            <p class="firstParagraph">MarketSpace 360</p>
          </div>
        </div>
      </body>
    </html>    
    `,
  };

  await sgMail.send(msg);
};
