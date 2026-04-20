import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

export const uploadAvatar = async (matricNo: string, file: File): Promise<string> => {
  const ext = file.name.split('.').pop() || "jpg";
  const avatarRef = ref(storage, `students/${matricNo}/avatar.${ext}`);
  
  await uploadBytes(avatarRef, file);
  return getDownloadURL(avatarRef);
};
