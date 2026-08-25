import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

@Injectable()
export class StorageService {
  private readonly client: S3Client
  private readonly bucket: string

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.getOrThrow<string>('storage.bucket')

    this.client = new S3Client({
      endpoint: `${
        this.config.getOrThrow<boolean>('storage.useSSL')
          ? 'https'
          : 'http'
      }://${this.config.getOrThrow<string>('storage.endpoint')}:${this.config.getOrThrow<number>('storage.port')}`,
      region: 'us-east-1',
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>(
          'storage.accessKey',
        ),
        secretAccessKey: this.config.getOrThrow<string>(
          'storage.secretKey',
        ),
      },
    })
  }

  async upload(
    key: string,
    body: Buffer,
    mimeType: string,
  ) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: mimeType,
      }),
    )

    return key
  }

  async getPresignedUrl(
    key: string,
    expiresInSeconds = 3600,
  ) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })

    return getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    })
  }

  async delete(key: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    )
  }
}