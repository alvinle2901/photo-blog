import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../config";
import type { StorageProvider } from "./index";

const client = new S3Client({
	region: "auto",
	endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: config.R2_ACCESS_KEY_ID,
		secretAccessKey: config.R2_SECRET_ACCESS_KEY,
	},
});

export const r2: StorageProvider = {
	async upload({ key, body, contentType }) {
		await client.send(
			new PutObjectCommand({
				Bucket: config.R2_BUCKET,
				Key: key,
				Body: body,
				ContentType: contentType,
			}),
		);
		return `${config.R2_PUBLIC_URL}/${key}`;
	},

	async delete(key) {
		await client.send(
			new DeleteObjectCommand({
				Bucket: config.R2_BUCKET,
				Key: key,
			}),
		);
	},

	async presignedUploadUrl({ key, contentType, expiresIn = 3600 }) {
		return getSignedUrl(
			client,
			new PutObjectCommand({
				Bucket: config.R2_BUCKET,
				Key: key,
				ContentType: contentType,
			}),
			{ expiresIn },
		);
	},
};
