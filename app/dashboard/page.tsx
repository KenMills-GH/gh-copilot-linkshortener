import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserLinks } from "@/data/links";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateLinkDialog } from "@/components/create-link-dialog";
import { EditLinkDialog } from "@/components/edit-link-dialog";
import { DeleteLinkDialog } from "@/components/delete-link-dialog";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const links = await getUserLinks(userId);

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
              <Card key={link.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-semibold">
                          /{link.slug}
                        </CardTitle>
                        <Badge variant="secondary">{link.slug}</Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Original URL:
                        </p>
                        <a
                          href={link.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {link.originalUrl}
                        </a>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created{" "}
                        {new Date(link.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <EditLinkDialog
                        link={{
                          id: link.id,
                          slug: link.slug,
                          originalUrl: link.originalUrl,
                        }}
                      />
                      <DeleteLinkDialog linkId={link.id} linkSlug={link.slug} />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
