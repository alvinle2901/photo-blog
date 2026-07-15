export { getOptimizedKey, getOptimizedUrl } from "./utils";

export interface StorageProvider {
	/** Upload a file, returns its public URL */
	upload(params: {
		key: string;
		body: Buffer;
		contentType: string;
	}): Promise<string>;

	/** Delete a file by key */
	delete(key: string): Promise<void>;

	/** Generate a presigned URL for direct browser uploads (optional) */
	presignedUploadUrl?(params: {
		key: string;
		contentType: string;
		expiresIn?: number; // seconds, default 3600
	}): Promise<string>;
}

export { r2 as storage } from "./r2";
