import type { NextApiRequest, NextApiResponse } from "next";

import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const auth = (req: NextApiRequest, res: NextApiResponse) => ({ id: "fakeId" }); // Fake auth function

const withDefaultHandlers = (route: ReturnType<typeof f>) =>
  route
    .middleware(async ({ req, res }) => {
      // This code runs on your server before upload
      const user = await auth(req, res);

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.ufsUrl);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    });

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: withDefaultHandlers(
    f({
      image: {
        /**
         * For full list of options and defaults, see the File Route API reference
         * @see https://docs.uploadthing.com/file-routes#route-config
         */
        maxFileSize: "4MB",
        maxFileCount: 1,
      },
    }),
  ),
  submissionUploader: withDefaultHandlers(
    f({
      /**
       * Allow the various non-video formats our submission flow expects.
       * `blob` covers Office docs, slides, archives, etc.
       */
      image: {
        maxFileSize: "16MB",
        maxFileCount: 1,
      },
      pdf: {
        maxFileSize: "32MB",
        maxFileCount: 1,
      },
      text: {
        maxFileSize: "16MB",
        maxFileCount: 1,
      },
      blob: {
        maxFileSize: "64MB",
        maxFileCount: 1,
      },
    }),
  ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
