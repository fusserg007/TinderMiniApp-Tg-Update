import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from 'fs';
import * as path from 'path';

export class ObjectStorage {
  #client: S3Client | null = null;
  #bucket: string;
  #useLocalStorage: boolean;
  #localStoragePath: string;

  constructor() {
    // Проверяем, доступен ли MinIO
    this.#useLocalStorage = !this.#isMinIOAvailable();
    this.#bucket = process.env.AWS_BUCKET || "";
    this.#localStoragePath = path.join(process.cwd(), 'uploads');

    if (!this.#useLocalStorage) {
      this.#client = new S3Client({
        credentials: {
          accessKeyId: process.env.MINIO_ROOT_USER || "",
          secretAccessKey: process.env.MINIO_ROOT_PASSWORD || "",
        },
        endpoint: "http://object-storage:9000",
        forcePathStyle: true,
        region: process.env.AWS_REGION || "us-east-1",
      });
    } else {
      console.warn('⚠️ MinIO недоступен, используется локальное хранилище для разработки');
      // Создаем папку uploads если её нет
      if (!fs.existsSync(this.#localStoragePath)) {
        fs.mkdirSync(this.#localStoragePath, { recursive: true });
      }
    }
  }

  #isMinIOAvailable(): boolean {
    // Простая проверка доступности MinIO через переменные окружения
    return process.env.NODE_ENV === 'production' || process.env.MINIO_AVAILABLE === 'true';
  }

  async uploadFile(key: string, file: Buffer) {
    if (this.#useLocalStorage) {
      // Локальное сохранение для разработки
      const filePath = path.join(this.#localStoragePath, key);
      const dir = path.dirname(filePath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, file);
      console.log(`📁 Файл сохранен локально: ${filePath}`);
      
      return {
        $metadata: { httpStatusCode: 200 },
        ETag: '"mock-etag"',
        Location: `file://${filePath}`
      };
    }

    // Обычная загрузка в MinIO/S3
    const command = new PutObjectCommand({
      Bucket: this.#bucket,
      Key: key,
      Body: file,
      ContentType: this.#getContentType(key),
    });

    return await this.#client!.send(command);
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
