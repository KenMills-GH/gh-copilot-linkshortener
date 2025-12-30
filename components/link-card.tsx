"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { EditLinkDialog } from "@/components/edit-link-dialog";
import { DeleteLinkDialog } from "@/components/delete-link-dialog";

interface Link {
  id: number;
  slug: string;
  originalUrl: string;
  createdAt: Date;
}

interface LinkCardProps {
  link: Link;
  baseUrl: string;
}

export function LinkCard({ link, baseUrl }: LinkCardProps) {
  const fullUrl = `${baseUrl}/l/${link.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Copied to clipboard!", {
        description: "Shortened URL copied successfully",
      });
    } catch (error) {
      toast.error("Failed to copy", {
        description: "Please try again",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Shortened URL Display */}
            <TooltipProvider>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-md font-mono truncate">
                  {fullUrl}
                </code>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopy}
                      aria-label="Copy shortened URL"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                      aria-label="Open in new tab"
                    >
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            {/* Original URL */}
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Original URL:</p>
              <a
                href={link.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400 block truncate"
              >
                {link.originalUrl}
              </a>
            </div>

            {/* Metadata */}
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

          {/* Actions */}
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
  );
}
