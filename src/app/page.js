"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";

export default function Home() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [startNumber, setStartNumber] = useState(1);
  const [includeNumbering, setIncludeNumbering] = useState(true); // 번호 매기기 여부 상태 추가

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter((file) => file.type.startsWith("image/"));
    setImages(validImages);
    setProgress(0);
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

      let currentNumber = parseInt(startNumber);

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

              // 번호 매기기가 활성화된 경우에만 번호 추가
              if (includeNumbering) {
                const text = `#${currentNumber}`;
                const textWidth = pdf.getTextWidth(text);
                const textX = x + (maxWidth - textWidth) / 2;
                const textY = offsetY + imgHeight + 15;

                pdf.setFontSize(12);
                pdf.text(text, textX, textY);

                currentNumber++;
              }

              // 진행 상태 업데이트
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
        <>
          <div className="flex items-center mb-4">
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
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-500 transition"
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
