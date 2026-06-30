const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOtpSms = async (phone, code) => {
  await client.messages.create({
    body: `Your CampusCycle verification code is ${code}. Valid for 5 minutes.`,
    from: process.env.TWILIO_PHONE,
    to: `+91${phone}`,
  });
};

module.exports = sendOtpSms;