"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";

export default function Home() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 진행 상황 상태 추가

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter((file) => file.type.startsWith("image/"));
    setImages(validImages);
    setProgress(0); // 새 파일을 선택할 때 진행 상태 초기화
  };

  const handleGeneratePDF = async () => {
    setLoading(true);
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const topMargin = 50;
    const bottomMargin = 50;
    const horizontalMargin = 20;
    const verticalSpacing = 10;

    const contentWidth = pageWidth - horizontalMargin * 2;
    const contentHeight = pageHeight - topMargin - bottomMargin;

    const positions = [
      { x: horizontalMargin, y: topMargin },
      { x: horizontalMargin + contentWidth / 2, y: topMargin },
      { x: horizontalMargin, y: topMargin + contentHeight / 2 + verticalSpacing },
      { x: horizontalMargin + contentWidth / 2, y: topMargin + contentHeight / 2 + verticalSpacing },
    ];

    const imagePromises = images.map((imageFile) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve({ data: event.target.result, type: imageFile.type });
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(imageFile);
      });
    });

    try {
      const imgDataList = await Promise.all(imagePromises);

      for (let i = 0; i < imgDataList.length; i += 4) {
        if (i > 0) pdf.addPage();

        for (let j = 0; j < 4 && i + j < imgDataList.length; j++) {
          const imgData = imgDataList[i + j];
          const { x, y } = positions[j];
          const maxWidth = contentWidth / 2;
          const maxHeight = contentHeight / 2 - verticalSpacing / 2;

          const img = new Image();
          img.src = imgData.data;

          await new Promise((resolve) => {
            img.onload = () => {
              const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
              const imgWidth = img.width * ratio;
              const imgHeight = img.height * ratio;

              const offsetX = x + (maxWidth - imgWidth) / 2;
              const offsetY = y + (maxHeight - imgHeight) / 2;

              pdf.addImage(
                imgData.data,
                imgData.type.includes("png") ? "PNG" : "JPEG",
                offsetX,
                offsetY,
                imgWidth,
                imgHeight
              );

              // 이미지 처리 완료 시 진행 상태 업데이트
              const totalImages = imgDataList.length;
              const completed = i + j + 1;
              setProgress(Math.round((completed / totalImages) * 100));
              resolve();
            };
          });
        }
      }

      pdf.save("images.pdf");
    } catch (error) {
      console.error("이미지 로딩 오류:", error);
    }
    setLoading(false);
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
      
      {images.length > 0 && (
        <button
          onClick={handleGeneratePDF}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-500 transition"
        >
          PDF 다운로드
        </button>
      )}
      
      <ul className="list-disc mt-4 text-gray-700">
        {images.map((image, index) => (
          <li key={index} className="font-medium">{image.name}</li>
        ))}
      </ul>

      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center z-50">
          <div className="loader mb-4"></div>
          <p className="text-white font-semibold mb-2">PDF 생성 중... {progress}%</p>
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
