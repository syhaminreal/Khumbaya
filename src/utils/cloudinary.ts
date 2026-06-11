// import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "../config/env";

// export async function uploadImageToCloudinary(
//   imageUri: string
// ): Promise<string> {
//   if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
//     throw new Error(
//       "Cloudinary configuration is missing. Please set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
//     );
//   }

//   const formData = new FormData();
//   const filename = imageUri.split("/").pop() || `upload-${Date.now()}.jpg`;
//   const fileType = filename.includes(".")
//     ? `image/${filename.split(".").pop()}`
//     : "image/jpeg";

//   formData.append("file", {
//     uri: imageUri,
//     name: filename,
//     type: fileType,
//   } as any);
//   formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

//   const response = await fetch(
//     `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
//     {
//       method: "POST",
//       body: formData,
//     }
//   );

//   if (!response.ok) {
//     const responseText = await response.text();
//     throw new Error(
//       `Cloudinary upload failed: ${response.status} ${response.statusText} ${responseText}`
//     );
//   }

//   const data = await response.json();

//   if (!data?.secure_url) {
//     throw new Error("Cloudinary did not return a secure URL.");
//   }

//   return data.secure_url as string;
// }
