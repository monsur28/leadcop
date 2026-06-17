import { AuthUI } from "@/components/ui/auth-ui";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  return <AuthUI initialMode="signup" />;
}
