/* 
** copied from: https://github.com/ghostops/ICloud-Shared-Album
** All props go to ghostops
*/
export type Derivative = {
    checksum: string;
    fileSize: number;
    width: number;
    height: number;
    url?: string;
};

export type Image = {
    batchGuid: string;
    derivatives: Record<string, Derivative>;
    contributorLastName: string;
    batchDateCreated: Date;
    dateCreated: Date;
    contributorFirstName: string;
    photoGuid: string;
    contributorFullName: string;
    caption: string;
    height: number;
    width: number;
    mediaAssetType?: "video"
};

export type Metadata = {
    streamName: string;
    userFirstName: string;
    userLastName: string;
    streamCtag: string;
    itemsReturned: number;
    locations: unknown;
};

export type ICloudResponse = {
    metadata: Metadata;
    photos: Image[];
};

export type ImageResponse = {
    caption: string;
    fullImageUrl: string;
    thumbnailUrl: string;
    assetType: "video" | "image"
    
}