import S3 from "aws-sdk/clients/s3.js";
import message from "aws-sdk/lib/maintenance_mode_message.js";
import crypto from "crypto";
import zlib from "zlib";
import util from "util";
// const deflateAsync = util.promisify(zlib.deflate);
message.suppress = true;
const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME, REGION_KEY } =
  process.env;
const s3 = new S3({
  region: REGION_KEY,
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
});

export async function uploadFile(fileKey, typeExtension) {
  try {
    // const compressedBuffer = await deflateAsync(fileKey);
    // console.log(compressedBuffer, "compressBuffer");

    const randomImageName = (bytes = 32) =>
      crypto.randomBytes(bytes).toString("hex");
    const imageName = randomImageName();
    const params = {
      Bucket: BUCKET_NAME,
      Body: fileKey,
      Key: imageName,
      // Key: `${imageName}.${typeExtension}`,
    };
    const result = await s3.upload(params).promise();
    return `${process.env.CLOUD_FRONT_API}/${result?.Key}`;
  } catch (err) {
    console.log("err in upload aws fn", err);
  }
}
export async function getAwsFile(fileKey) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
  };
  const result = await s3.getSignedUrl("getObject", params);
  return result;
}
export async function deleteAwsFile(file) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: file,
  };
  return s3.deleteObject(params).promise();
}
