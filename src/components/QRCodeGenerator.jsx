import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCopy, FiShare2 } = FiIcons;

const QRCodeGenerator = ({ url, size = 120 }) => {
  const canvasRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) console.error('QR Code generation error:', error);
        else {
          // Generate data URL for sharing/copying
          setQrDataUrl(canvasRef.current.toDataURL('image/png'));
        }
      });
    }
  }, [url, size]);

  const copyQRCode = async () => {
    try {
      if (!qrDataUrl) return;
      
      // Fetch the image as a blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      
      // Create clipboard item
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      
      // Show success message
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy QR code:', error);
    }
  };

  const shareQRCode = async () => {
    try {
      if (!qrDataUrl || !navigator.share) return;
      
      // Fetch the image as a blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      
      // Create file for sharing
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });
      
      await navigator.share({
        title: 'QR Code for ' + url,
        text: 'Scan this QR code to visit: ' + url,
        url: url,
        files: [file]
      });
      
      // Show success message
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to share QR code:', error);
    }
  };

  return (
    <div className="relative group">
      <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-purple-primary">
        <canvas ref={canvasRef} className="block" />
      </div>
      
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={copyQRCode}
          className="bg-purple-primary hover:bg-purple-dark text-white p-2 rounded-full shadow-md transition-colors"
          title="Copy QR Code"
        >
          <SafeIcon icon={FiCopy} className="w-4 h-4" />
        </button>
        
        <button 
          onClick={shareQRCode}
          className="bg-purple-primary hover:bg-purple-dark text-white p-2 rounded-full shadow-md transition-colors"
          title="Share QR Code"
        >
          <SafeIcon icon={FiShare2} className="w-4 h-4" />
        </button>
      </div>
      
      {/* Success notifications */}
      {copySuccess && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
          Copied!
        </div>
      )}
      
      {shareSuccess && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
          Shared!
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;