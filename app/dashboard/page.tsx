import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserLinks } from "@/data/links";
import { Card, CardContent } from "@/components/ui/card";
import { CreateLinkDialog } from "@/components/create-link-dialog";
import { LinkCard } from "@/components/link-card";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const links = await getUserLinks(userId);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your shortened links
            </p>
          </div>
          <CreateLinkDialog />
        </div>

        <div className="space-y-4">
          {links.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No links yet. Create your first shortened link!
                </p>
              </CardContent>
            </Card>
          ) : (
            links.map((link) => (
              <LinkCard key={link.id} link={link} baseUrl={baseUrl} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
