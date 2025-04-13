import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { motion } from "framer-motion"
import { Copy, FileUp, LinkIcon, Calendar, CheckCircle2, AlertCircle, Upload } from "lucide-react"
import { Progress } from "../components/Progress"

export default function FileUpload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [shareableLink, setShareableLink] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [copied, setCopied] = useState(false)

  const handleFileChange = (acceptedFiles) => {
    setFile(acceptedFiles[0])
    setUploadStatus(null)
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setUploadStatus(null)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", file)

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = prev + Math.random() * 15
        return newProgress > 90 ? 90 : newProgress
      })
    }, 300)

    try {
      const response = await fetch("http://192.168.18.232:8000/upload/", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()
      if (result.status === "success") {
        setUploadStatus("success")
        setShareableLink(result.file.shareable_link)
        setExpiryDate(result.file.expiry_date)
      } else {
        setUploadStatus("error")
      }
    } catch (error) {
      clearInterval(progressInterval)
      setUploadStatus("error")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileChange,
    accept: "image/*, .pdf, .docx, .txt",
  })

  const parseExpiryDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return "Invalid Date"
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const dropZoneClass = `
    border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer
    flex flex-col items-center justify-center p-8 text-center
    ${isDragActive ? "border-purple-400 bg-purple-50" : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"}
    ${file ? "border-green-400 bg-green-50/50" : ""}
  `

  const buttonClass = `
    w-full py-6 text-lg font-medium transition-all duration-300
    ${!file ? "bg-gray-300" : "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"}
  `

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-xl shadow-xl border-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 z-0" />
        <div className="relative z-10 pb-0">
          <div className="text-center text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
            Share Your Files
          </div>
          <p className="text-center text-gray-500 mt-2">Drag & drop your file to get a shareable link</p>
        </div>

        <div className="relative z-10 pt-6 space-y-6">
          <div {...getRootProps()} className={dropZoneClass}>
            <input {...getInputProps()} />
            <motion.div initial={{ scale: 1 }} animate={{ scale: isDragActive ? 1.05 : 1 }} className="mb-4">
              {file ? (
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              ) : (
                <Upload className="h-16 w-16 text-purple-400" />
              )}
            </motion.div>

            {file ? (
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-700">
                  {isDragActive ? "Drop your file here" : "Click or drag file to upload"}
                </p>
                <p className="text-sm text-gray-500">Supports images, PDFs, Word documents, and text files</p>
              </div>
            )}
          </div>

          <button onClick={handleUpload} disabled={loading || !file} className={buttonClass}>
            {loading ? (
              <span className="flex items-center">
                <FileUp className="mr-2 h-5 w-5 animate-bounce" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center px-4">
                <FileUp className="mr-2 h-5 w-5" />
                Upload File
              </span>
            )}
          </button>

          {loading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-right text-sm text-gray-500">{Math.round(uploadProgress)}%</p>
            </div>
          )}

          {uploadStatus === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 rounded-xl border border-green-100 bg-green-50 overflow-hidden"
            >
              <div className="bg-green-500/10 p-4 border-b border-green-100">
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold text-green-700">File Uploaded Successfully!</h3>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <LinkIcon className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">Shareable Link:</p>
                    <a
                      href={shareableLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 font-medium text-sm hover:underline break-all"
                    >
                      {shareableLink}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Expires on:</p>
                    <p className="text-sm text-gray-700">{parseExpiryDate(expiryDate)}</p>
                  </div>
                </div>

                <div className="mt-4 relative">
                  <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <input
                      type="text"
                      readOnly
                      value={shareableLink}
                      className="flex-1 px-3 py-2 text-gray-700 text-sm focus:outline-none bg-transparent"
                    />
                    <button onClick={copyToClipboard} className="h-full px-3 rounded-none border-l">
                      {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  {copied && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute right-0 -top-6 text-xs text-green-600 font-medium"
                    >
                      Copied!
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {uploadStatus === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 flex items-center gap-2"
            >
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="font-medium">Upload failed. Please try again!</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
