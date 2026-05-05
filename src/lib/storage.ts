import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

export const uploadAvatar = async (matricNo: string, file: File): Promise<string> => {
  const safeId = matricNo.replace(/\//g, '-');
  const ext = file.name.split('.').pop() || "jpg";
  const avatarRef = ref(storage, `students/${safeId}/avatar.${ext}`);
  
  await uploadBytes(avatarRef, file);
  return getDownloadURL(avatarRef);
};
