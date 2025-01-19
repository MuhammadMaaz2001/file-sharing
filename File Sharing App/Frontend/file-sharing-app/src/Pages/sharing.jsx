import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFolder, FaCopy } from 'react-icons/fa';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [shareableLink, setShareableLink] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Handle file drop or file selection
  const handleFileChange = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://192.168.18.232:8000/upload/', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.status === 'success') {
        setUploadStatus('success');
        setShareableLink(result.file.shareable_link);
        setExpiryDate(result.file.expiry_date); // Assuming the API returns expiry date
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      setUploadStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop functionality
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleFileChange,
    accept: 'image/*, .pdf, .docx, .txt', // Filter allowed file types
  });

  // Function to parse the expiry date
  const parseExpiryDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-center text-2xl font-semibold text-gray-800 mb-6">Upload Your File</h1>

        {/* Drag and drop file area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-6 rounded-lg text-center ${
            file ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-100'
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <p className="text-gray-700 font-medium">{file.name}</p>
          ) : (
            <p className="text-gray-500">Drag & Drop a file or click to select</p>
          )}
        </div>

        {/* Upload button */}
        <button
          onClick={handleUpload}
          className={`w-full mt-6 p-3 text-white rounded-lg ${
            loading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={loading || !file}
        >
          {loading ? 'Uploading...' : 'Upload File'}
        </button>

        {/* Success/Error Message */}
        {uploadStatus === 'success' && (
          <div className="mt-6 p-6 bg-white rounded-lg shadow-md border border-gray-300 flex items-center">
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Your Shareable Link:</h3>
              <a
                href={shareableLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium "
              >
            <FaFolder className="text-gray-600 text-3xl mr-4 "  />
            {shareableLink}
              </a>

              <p className="mt-2 text-sm text-gray-500">
                Expires on: {parseExpiryDate(expiryDate)}
              </p>

              <div className="mt-4">
                <p className="text-sm text-gray-500">Shareable URL:</p>
                <div className="flex items-center justify-center mt-2 bg-gray-100 p-2 rounded-md border border-gray-300">
                  <input
                    type="text"
                    readOnly
                    value={shareableLink}
                    className="text-gray-600 text-sm w-full bg-transparent focus:outline-none"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(shareableLink)}
                    className="ml-2 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-all"
                  >
                    <FaCopy className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg">
            <p className="font-medium">Upload Failed. Try Again!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;
