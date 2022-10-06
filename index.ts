import icloud from 'npm:icloud-shared-album@1.1.0'
import { Application, Router, helpers } from 'https://deno.land/x/oak/mod.ts';
import { Derivative, ICloudResponse, ImageResponse } from './types.ts';
import { oakCors } from "https://deno.land/x/cors/mod.ts";
//TODO: Read this from env
const port = parseInt(Deno.env.get("PORT") ?? "8000")
const app = new Application();

const router = new Router();

router.get("/album/:key", async (ctx) => {
    const { key } = helpers.getQuery(ctx, { mergeParams: true });
    const data: ICloudResponse = await icloud.getImages(key);
    console.log(data)
    if(!data?.photos || data?.photos.length === 0) {
        ctx.response.status = 404
        return
    }
    // const data = await icloud.getImages('B0OGrq0zwH4gVC');
    
    const resp: ImageResponse[] = data.photos
    // we want to sort by date created
    .sort((a,b) => (a.dateCreated - b.dateCreated))
    .map(photo => {
      const fullImage = Object.values(photo.derivatives).reduce(
       (prev, current) => {
         return prev.fileSize > current.fileSize ? prev : current
       }
      );
      const thumbnail = Object.values(photo.derivatives).reduce(
       (prev, current) => {
         return prev.fileSize < current.fileSize ? prev : current
       }
      );
      return {caption: photo.caption, fullImageUrl: fullImage.url ?? "", thumbnailUrl: thumbnail.url ?? "gh ", assetType: photo.mediaAssetType ?? "image"}
    })
    
    ctx.response.body = resp;
  });
// Allow CORS from some URLS
  app.use(
    oakCors({
      //TODO: Read this from ENV
      origin:["http://localhost:1313","https://travel.igl-web.de", "https://traveldev.igl-web.de"],
    }),
  );
app.use(router.allowedMethods());
app.use(router.routes());

app.addEventListener('listen', () => {
  console.log(`Listening on: localhost:${port}`);
});

await app.listen({ port });


// const data = await icloud.getImages('B0OGrq0zwH4gVC');
