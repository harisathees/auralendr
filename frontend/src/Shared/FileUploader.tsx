import React from "react";

interface Props {
  onFilesSelected: (files: File[]) => void;
}

const FileUploader: React.FC<Props> = ({ onFilesSelected }) => {
  return (
    <div>
      <label>Upload Files:</label>
      <input
        type="file"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          onFilesSelected(files);
        }}
      />
    </div>
  );
};

export default FileUploader;
