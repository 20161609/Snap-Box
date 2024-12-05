"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";

export default function Home() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [startNumber, setStartNumber] = useState(1);
  const [includeNumbering, setIncludeNumbering] = useState(true);

  // 추가된 상태 변수
  const [uploadedFile, setUploadedFile] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter((file) =>
      file.type.startsWith("image/")
    );
    setImages(validImages);
    setProgress(0);
  };

  const handleXlsxUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".xlsx")) {
      const renamedFile = new File([file], "custom.xlsx", { type: file.type });
      setUploadedFile(renamedFile);
      setDownloadError("");
    } else {
      alert("xlsx 파일만 업로드 가능합니다.");
    }
  };

  const handleXlsxDownload = () => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      const link = document.createElement("a");
      link.href = url;
      link.download = uploadedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      setDownloadError("업로드된 파일이 없습니다.");
    }
  };

  const handleGeneratePDF = async () => {
    // 기존 PDF 생성 함수 내용
    // ...
  };

  return (
    <div className="flex flex-col items-center p-8 gap-4 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Snap Box</h1>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="file-input mb-4 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg cursor-pointer shadow-lg focus:outline-none hover:bg-gray-200"
      />

      {/* 기존 다운로드 버튼들 */}
      <div className="flex flex-col w-full gap-4">
        <a
          href="/sisimna.xlsx"
          download
          className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow-md hover:bg-green-500 transition text-center"
        >
          시심나 장부 다운로드
        </a>
        <a
          href="/request.xlsx"
          download
          className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white font-semibold rounded-full shadow-md hover:bg-purple-500 transition text-center"
        >
          지출결의서 다운로드
        </a>

        {/* 새로운 업로드 및 다운로드 버튼 */}
        <input
          type="file"
          accept=".xlsx"
          onChange={handleXlsxUpload}
          className="file-input mb-4 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg cursor-pointer shadow-lg focus:outline-none hover:bg-gray-200"
        />
        <button
          onClick={handleXlsxDownload}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-500 transition text-center"
        >
          업로드한 파일 다운로드
        </button>
        {downloadError && (
          <p className="text-red-500 font-semibold">{downloadError}</p>
        )}
      </div>

      {images.length > 0 && (
        <>
          <div className="flex items-center mt-4 mb-4">
            <input
              type="checkbox"
              checked={includeNumbering}
              onChange={(e) => setIncludeNumbering(e.target.checked)}
              className="mr-2"
            />
            <label className="text-gray-700 font-medium">번호 매기기</label>
          </div>

          {includeNumbering && (
            <input
              type="number"
              value={startNumber}
              onChange={(e) => setStartNumber(e.target.value)}
              placeholder="시작 번호를 입력하세요"
              className="mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-black placeholder:text-black"
            />
          )}

          <button
            onClick={handleGeneratePDF}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-500 transition text-center"
          >
            PDF 다운로드
          </button>
        </>
      )}

      <ul className="list-disc mt-4 text-gray-700">
        {images.map((image, index) => (
          <li key={index} className="font-medium">
            {image.name}
          </li>
        ))}
      </ul>

      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center z-50">
          <div className="loader mb-4"></div>
          <p className="text-white font-semibold mb-2">
            PDF 생성 중... {progress}%
          </p>
        </div>
      )}

      <style jsx>{`
        .file-input {
          border: 2px dashed #cbd5e1;
        }
        .loader {
          width: 40px;
          height: 40px;
          border: 5px solid #cbd5e1;
          border-top-color: #1d4ed8;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
