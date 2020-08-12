import React, { useRef, useState } from 'react';
import './App.css';
import Header from './components/header';

const kernelX = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1],
];

const kernelY = [
  [-1, -2, -1],
  [0, 0, 0],
  [1, 2, 1],
];

const getPixelAtPosition = (data, width) => {
  return (x, y, i = 0) => {
    return data[((width * y) + x) * 4 + i];
  };
};

const getKernelPixel = (kernel, pixelAt, x, y) => {
  return (kernel[0][0] * pixelAt(x - 1, y - 1)) +
    (kernel[0][1] * pixelAt(x, y - 1)) +
    (kernel[0][2] * pixelAt(x + 1, y - 1)) +
    (kernel[1][0] * pixelAt(x - 1, y)) +
    (kernel[1][1] * pixelAt(x, y)) +
    (kernel[1][2] * pixelAt(x + 1, y)) +
    (kernel[2][0] * pixelAt(x - 1, y + 1)) +
    (kernel[2][1] * pixelAt(x, y + 1)) +
    (kernel[2][2] * pixelAt(x + 1, y + 1));
};

const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));

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
          const pixelX = getKernelPixel(kernelX, pixelAt, x, y);

          const pixelY = getKernelPixel(kernelY, pixelAt, x, y);

          const magnitude = Math.sqrt((pixelX * pixelX) + (pixelY * pixelY));

          sobelData.push(magnitude, magnitude, magnitude, 255);
        }
      }

      const originalArr = Array.from(imageData.data);

      const sobelContext = sobelCanvas.current.getContext('2d');

      for (let step = 0, last = 0; step < sobelData.length; step += w * 4) {
        originalArr.splice(last, w * 4, ...sobelData.slice(last, w * 4 + last));
        const arr = new window.Uint8ClampedArray(originalArr);
        const newData = new window.ImageData(arr, w, h);
        sobelContext.putImageData(newData, 0, 0);

        last = step;
        await wait(30);
      }
    }
  };

  return (
    <div className="app">
      <Header/>
      <div className="app__content">
        <div className="app__text">
          <div>The Sobel operator, sometimes called the Sobel–Feldman operator or Sobel filter, is used in image
            processing and computer vision, particularly within edge detection algorithms where it creates an image
            emphasising edges.
          </div>
          <div>To see visualization select any file</div>
        </div>
        <input type="file" onChange={handleSelectFile}/>
        <div className="canvas">
          <canvas ref={sobelCanvas} width={width} height={height}/>
          <canvas ref={canvas} width={width} height={height}/>
        </div>
      </div>
    </div>
  );
}

export default App;
