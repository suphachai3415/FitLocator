import { useRouter } from "expo-router";

const router = useRouter();

const goToHome = () => {
  router.replace("/");  // หรือ "/index"
};