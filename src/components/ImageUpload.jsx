// ImageUpload.js
import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

import "../css/ImageUpload.css";

function ImageUpload({ user }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    // Handle file selection
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    // Convert file to PNG using Canvas
    const convertToPng = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => resolve(blob), "image/png");
                };
            };
        });
    };

    // Upload file to Firebase Storage
    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            // Convert image to PNG format
            const pngBlob = await convertToPng(selectedFile);

            // Upload the converted PNG to Firebase Storage
            const storageRef = ref(storage, `userPFPs/${user}.png`);
            await uploadBytes(storageRef, pngBlob);

            // Retrieve the download URL
            const url = await getDownloadURL(storageRef);
            setImageUrl(url);
            console.log("File uploaded successfully as PNG:", url);
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <input
                type="file"
                onChange={handleFileChange}
                className="file-input"
                id="upload"
                hidden
            />
            <label for="upload">Choose File</label>
            {" " + (selectedFile ? selectedFile.name : "No file chosen")}

            {imageUrl && (
                <div>
                    <p>Uploaded Image:</p>
                    <img src={imageUrl} alt="Uploaded file" width="300" />
                </div>
            )}
            <label
                className="upload"
                onClick={handleUpload}
                disabled={!selectedFile}
            >
                {uploading ? "Uploading..." : "Upload Image"}
            </label>
        </div>
    );
}

export default ImageUpload;
