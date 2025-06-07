import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export class ObjectStorage {
  #client: S3Client;

  #bucket: string;

  constructor() {
    this.#client = new S3Client({
      credentials: {
        accessKeyId: process.env.MINIO_ROOT_USER || "",
        secretAccessKey: process.env.MINIO_ROOT_PASSWORD || "",
      },
      endpoint: "http://object-storage:9000",
      forcePathStyle: true,
      region: process.env.AWS_REGION || "us-east-1",
    });

    this.#bucket = process.env.AWS_BUCKET || "";
  }

  async uploadFile(key: string, file: Buffer) {
    const command = new PutObjectCommand({
      Bucket: this.#bucket,
      Key: key,
      Body: file,
      ContentType: this.#getContentType(key),
    });

    return await this.#client.send(command);
  }

  #getContentType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    const types: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
    };
    return types[extension || ''] || 'application/octet-stream';
  }
}
