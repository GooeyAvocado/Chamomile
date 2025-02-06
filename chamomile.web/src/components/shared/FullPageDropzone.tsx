import { useState, useEffect } from "react";
import { useImageUpload } from "../hooks/useImageUpload";
import { Card } from "@mui/material";
import { Upload } from "@mui/icons-material";

export default function FullPageDropzone(props: { children: React.ReactNode }) {
  const [dragging, setDragging] = useState(false);
  const { setFiles } = useImageUpload();

  useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      setDragging(true);
    };

    const handleDragLeave = (event: DragEvent) => {
      if (event.relatedTarget === null) {
        setDragging(false);
      }
    };

    const handleDrop = async (event: DragEvent) => {
      event.preventDefault();
      setDragging(false);

      if (event.dataTransfer?.items) {

        const entries: FileSystemEntry[] = [];
        for (let i = 0; i < event.dataTransfer.items.length; i++) {
          const entry = event.dataTransfer.items[i].webkitGetAsEntry();
          if (entry) {
            entries.push(entry);
          }
        }

        const files = await extractFiles(entries);
        setFiles(files);

      }
    };

    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);
    };
  }, []);

  async function extractFiles(items: FileSystemEntry[]): Promise<File[]> {
    const files: File[] = [];

    // Traverse directories recursively to extract all files
    async function traverseDirectory(entry: FileSystemDirectoryEntry) {
      const reader = entry.createReader();
      const entries: FileSystemEntry[] = await new Promise((resolve) =>
        reader.readEntries(resolve)
      );

      // Process each entry, whether it's a file or subdirectory
      for (const subEntry of entries) {
        if (subEntry.isFile) {
          const file = await new Promise<File>((resolve) =>
            (subEntry as FileSystemFileEntry).file(resolve)
          );
          files.push(file);
        } else if (subEntry.isDirectory) {
          await traverseDirectory(subEntry as FileSystemDirectoryEntry);
        }
      }
    }


    // Loop through all items (could be files or directories)
    for (const entry of items) {
      if (entry) {
        if (entry.isFile) {
          const file = await new Promise<File>((resolve) =>
            (entry as FileSystemFileEntry).file(resolve)
          );
          files.push(file);
        } else if (entry.isDirectory) {
          await traverseDirectory(entry as FileSystemDirectoryEntry);
        }
      }
    }

    return files;
  }

  return (
    <>
      {dragging && (
        <div style={{ position: 'fixed', left: 0, right: 0, width: "100vw", height: "100vh", background: "rgba(128,128,128,0.5", zIndex: '2', display: 'flex', flexDirection: "column", justifyContent: 'center', alignItems: 'center' }}>
          <Card>
            <div style={{ padding: "20px", textAlign: 'center' }}>
              <Upload fontSize="large" />
              <div>Upload images here!</div>
            </div>
          </Card>
        </div>
      )}
      {props.children}
    </>
  );
}
