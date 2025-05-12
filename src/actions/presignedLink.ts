"use server";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: "v4",
});

export const generatePresignedLink = async () => {
  const randomKey = generateRandomString(12);
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: randomKey,
    Expires: 60, // URL expiration time in seconds
  };

  try {
    const url = await s3.getSignedUrlPromise("putObject", params);
    return url;
  } catch (error) {
    console.log(error);
    return null;
  }
};

function generateRandomString(length: number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
