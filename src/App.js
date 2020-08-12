import React, { useRef, useState } from 'react';
import './App.css';

const getPixelAtPosition = (data, width) => {
  return (x, y, i = 0) => {
    return data[((width * y) + x) * 4 + i];
  };
};

function App() {
  const canvas = useRef(null);
  const sobelCanvas = useRef(null);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const handleSelectFile = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const c = canvas.current;
      const image = await window.createImageBitmap(file);
      const w = image.width;
      const h = image.height;

      setWidth(w);
      setHeight(h);
      const context = c.getContext('2d');
      context.drawImage(image, 0, 0);

      const kernelX = [
        [-1,0,1],
        [-2,0,2],
        [-1,0,1]
      ];

      const kernelY = [
        [-1,-2,-1],
        [0,0,0],
        [1,2,1]
      ];

      const imageData = context.getImageData(0, 0, w, h);

      let pixelAt = getPixelAtPosition(imageData.data, w);

      const sobelData = [];
      const grayscaleData = [];

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const r = pixelAt(x, y, 0);
          const g = pixelAt(x, y, 1);
          const b = pixelAt(x, y, 2);

          const avg = (r + g + b) / 3;

          grayscaleData.push(avg, avg, avg, 255);
        }
      }

      pixelAt = getPixelAtPosition(grayscaleData, w);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const pixelX = (
            (kernelX[0][0] * pixelAt(x - 1, y - 1)) +
            (kernelX[0][1] * pixelAt(x, y - 1)) +
            (kernelX[0][2] * pixelAt(x + 1, y - 1)) +
            (kernelX[1][0] * pixelAt(x - 1, y)) +
            (kernelX[1][1] * pixelAt(x, y)) +
            (kernelX[1][2] * pixelAt(x + 1, y)) +
            (kernelX[2][0] * pixelAt(x - 1, y + 1)) +
            (kernelX[2][1] * pixelAt(x, y + 1)) +
            (kernelX[2][2] * pixelAt(x + 1, y + 1))
          );

          const pixelY = (
            (kernelY[0][0] * pixelAt(x - 1, y - 1)) +
            (kernelY[0][1] * pixelAt(x, y - 1)) +
            (kernelY[0][2] * pixelAt(x + 1, y - 1)) +
            (kernelY[1][0] * pixelAt(x - 1, y)) +
            (kernelY[1][1] * pixelAt(x, y)) +
            (kernelY[1][2] * pixelAt(x + 1, y)) +
            (kernelY[2][0] * pixelAt(x - 1, y + 1)) +
            (kernelY[2][1] * pixelAt(x, y + 1)) +
            (kernelY[2][2] * pixelAt(x + 1, y + 1))
          );

          const magnitude = Math.sqrt((pixelX * pixelX) + (pixelY * pixelY));

          sobelData.push(magnitude, magnitude, magnitude, 255);
        }
      }

      const arr = new window.Uint8ClampedArray(sobelData);
      const newData = new window.ImageData(arr, w, h);

      const sobelContext = sobelCanvas.current.getContext('2d');
      sobelContext.putImageData(newData, 0, 0);
    }
  };

  return (
    <div className="app">
      <input type="file" onChange={handleSelectFile}/>
      <div>
        <canvas ref={canvas} width={width} height={height}/>
        <canvas ref={sobelCanvas} width={width} height={height}/>
      </div>
    </div>
  );
}

export default App;
