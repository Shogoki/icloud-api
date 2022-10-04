import icloud from 'npm:icloud-shared-album@1.1.0'
import { Application, Router, helpers } from 'https://deno.land/x/oak/mod.ts';
import { Derivative, ICloudResponse, ImageResponse } from './types.ts';
import { isPosixPathSeparator } from 'https://deno.land/std@0.152.0/path/_util.ts';
const port = 8000;
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
    
    const resp: ImageResponse[] = data.photos.map(photo => {
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
      return {caption: photo.caption, fullImageUrl: fullImage.url, thumbnailUrl: thumbnail.url, assetType: photo.mediaAssetType ?? "image"}
    })
    ctx.response.body = resp;
  });

app.use(router.allowedMethods());
app.use(router.routes());

app.addEventListener('listen', () => {
  console.log(`Listening on: localhost:${port}`);
});

await app.listen({ port });


// const data = await icloud.getImages('B0OGrq0zwH4gVC');
