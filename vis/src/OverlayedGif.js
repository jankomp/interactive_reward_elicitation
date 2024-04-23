import React, { useState, useEffect }  from 'react';
import { env } from './constants';
import { GifReader } from 'omggif';

const GIFEncoder = require('gifencoder');

async function overlayClips(gifPaths) {
    if (gifPaths.length === 0) {
        return null;
    }
    // Create a Promise for each GIF path to read them asynchronously
    const gifPromises = gifPaths.map(path => readGIF(path));

    // Wait for all GIFs to be read
    const gifs = await Promise.all(gifPromises);

    // Get the number of frames in the first GIF
    const numFrames = gifs[0].numFrames();

    // Create a canvas element to overlay the frames
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = gifs[0].width;
    canvas.height = gifs[0].height;

    // Create a GifEncoder object to generate the new GIF
    const gif = new GIFEncoder(canvas.width, canvas.height);

    // Start the gif
    gif.start();

    /// Create a buffer to hold the pixel data
    let buffer = new Uint8Array(canvas.width * canvas.height * 4);

    // Create an off-screen canvas to hold the image data for each frame
    let offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    let offscreenCtx = offscreenCanvas.getContext('2d');

    // Loop through each frame
    for (let i = 0; i < numFrames; i++) {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw each GIF with reduced opacity onto the canvas
        gifs.forEach((gifReader, index) => {
            // Decode the frame
            gifReader.decodeAndBlitFrameRGBA(i, buffer);

            // Create an ImageData object from the buffer
            let imageData = new ImageData(new Uint8ClampedArray(buffer), canvas.width, canvas.height);

            // Draw the image data onto the off-screen canvas
            offscreenCtx.putImageData(imageData, 0, 0);

            // Set the global alpha (opacity)
            ctx.globalAlpha = 1.0 / gifs.length;

            // Draw the off-screen canvas onto the main canvas
            ctx.drawImage(offscreenCanvas, 0, 0);

            // Reset the global alpha
            ctx.globalAlpha = 1;
        });

        // Add the overlaid frame to the new GIF
        gif.addFrame(ctx);
    }

    // Finish the gif
    gif.finish();

    // Get the binary data
    const binaryData = gif.out.getData();

    // Convert the binary data to a blob
    const blob = new Blob([binaryData], { type: 'image/gif' });

    // Convert the blob to a temporary URL
    const url = URL.createObjectURL(blob);

    return url;
}

// Helper function to read a GIF asynchronously
function readGIF(path) {
    return new Promise((resolve, reject) => {
        fetch(path)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                const uint8Array = new Uint8Array(buffer);
                const reader = new GifReader(uint8Array);
                resolve(reader);
            })
            .catch(reject);
    });
}

const OverlayedGif = ({ filteredEmbeddingData, resetExpanded }) => {
    const [overlayGif, setOverlayGif] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            console.log('overlayedGif ' + filteredEmbeddingData);
            if (Array.isArray(filteredEmbeddingData)) {
                console.log(filteredEmbeddingData, typeof filteredEmbeddingData);
                let gifPaths = filteredEmbeddingData.map(embeddingData => `http://localhost:3000/gifs_${env}/training-episode-${embeddingData.key}.gif`);
                let overlayGif = await overlayClips(gifPaths);
                setOverlayGif(overlayGif);
            }
        };
        fetchData();
    }, [filteredEmbeddingData]);

    return (
        <div id='behavior' className='subpane'>
            <div style={{ height: 5 }} />
            <div style={{ marginLeft: 10, fontSize: 16 }}>Behaviors</div>
            <div style={{ overflow: "scroll", height: 820, marginLeft: 0, marginTop: 5 }}>
                {overlayGif &&
                    <>
                        <img src={overlayGif} alt="Overlay GIF" />
                        <button title='Expand' onClick={resetExpanded(true)}>Expand behaviors</button>
                    </>
                }
            </div>
        </div>
    );
};

export default OverlayedGif;
