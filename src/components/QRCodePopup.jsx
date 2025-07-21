import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiCopy, FiShare2 } = FiIcons;

const QRCodePopup = ({ isOpen, onClose, url }) => {
  const canvasRef = useRef(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    if (canvasRef.current && url && isOpen) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
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
  }, [url, isOpen]);

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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-xl p-6 w-full max-w-xs border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Current Page QR</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-purple-primary mb-4">
                <canvas ref={canvasRef} className="block" />
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={copyQRCode}
                  className="flex-1 py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <SafeIcon icon={FiCopy} className="w-4 h-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={shareQRCode}
                  className="flex-1 py-2 px-4 bg-purple-primary text-white rounded-lg hover:bg-purple-dark transition-colors flex items-center justify-center gap-2"
                >
                  <SafeIcon icon={FiShare2} className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
              
              {/* Success notifications */}
              {copySuccess && (
                <div className="mt-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                  Copied!
                </div>
              )}
              
              {shareSuccess && (
                <div className="mt-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                  Shared!
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QRCodePopup;