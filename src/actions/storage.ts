"use server";

import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { auth } from "@clerk/nextjs/server";

export async function getSignedUploadUrl({
    type,
    size,
}: {
    type: string;
    size: number;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Optional: Check for admin role here if strictly needed

    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrlBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

    if (!bucketName || !publicUrlBase) {
        throw new Error("Server configuration error: Missing R2 config");
    }

    // Generate a unique filename
    const extension = type.split("/")[1] || "bin";
    const fileKey = `products/${randomUUID()}.${extension}`;

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        ContentType: type,
        ContentLength: size,
        ACL: "public-read", // R2 usually ignores this but good practice for S3 compatibility
    });

    try {
        const signedUrl = await getSignedUrl(r2, command, { expiresIn: 600 }); // 10 minutes

        return {
            success: true,
            signedUrl,
            publicUrl: `${publicUrlBase}/${fileKey}`,
        };
    } catch (error) {
        console.error("Error generating signed URL:", error);
        return { success: false, error: "Failed to generate upload URL" };
    }
}
