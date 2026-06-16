import { AuthUI } from "@/components/ui/auth-ui";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const mode = params?.mode === "signup" ? "signup" : "signin";
  
  return <AuthUI initialMode={mode} />;
}
