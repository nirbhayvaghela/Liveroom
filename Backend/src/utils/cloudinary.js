import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // console.log("File is uploaded succesfully", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteAssetFromCloudinary = async (imageUrl, resourceType = "image") => {
  try {
    const publicId = imageUrl.split("/").pop().split(".")[0];
    console.log(publicId);

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.log("Delete Result:", result);

    if (result.result === "ok") {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false };
  }
};

export { uploadOnCloudinary, deleteAssetFromCloudinary };
