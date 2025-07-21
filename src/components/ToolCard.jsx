import React from 'react';
import { motion } from 'framer-motion';
import QRCodeGenerator from './QRCodeGenerator';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiExternalLink, FiEdit } = FiIcons;

const ToolCard = ({ tool, index, onEditClick }) => {
  const handleTitleClick = () => {
    window.open(tool.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800 hover:border-purple-primary transition-all duration-300"
    >
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
        {/* QR Code */}
        <div className="flex-shrink-0 mx-auto lg:mx-0">
          <QRCodeGenerator url={tool.url} size={120} />
        </div>

        {/* Tool Information */}
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-between gap-2 mb-3">
            <button
              onClick={handleTitleClick}
              className="group flex items-center gap-2 text-xl font-semibold text-white hover:text-purple-primary transition-colors duration-200"
            >
              <span>{tool.title}</span>
              <SafeIcon icon={FiExternalLink} className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={() => onEditClick(tool)}
              className="p-2 text-gray-400 hover:text-purple-primary transition-colors"
              title="Edit Tool"
            >
              <SafeIcon icon={FiEdit} className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-300 leading-relaxed max-w-md mx-auto lg:mx-0">
            {tool.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ToolCard;