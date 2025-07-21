import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ToolCard from './components/ToolCard';
import AddLinkForm from './components/AddLinkForm';
import QRCodePopup from './components/QRCodePopup';
import PasswordPrompt from './components/PasswordPrompt';
import SafeIcon from './common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import * as BsIcons from 'react-icons/bs';
import supabase from './lib/supabase';

const { FiHome, FiPlus } = FiIcons;
const { BsQrCode } = BsIcons;

function App() {
  const [tools, setTools] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isQRPopupOpen, setIsQRPopupOpen] = useState(false);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [actionAfterPassword, setActionAfterPassword] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tools from Supabase
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const { data, error } = await supabase
          .from('tools_shared_x7y9z')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        setTools(data);
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError('Failed to load tools');
      } finally {
        setLoading(false);
      }
    };

    fetchTools();

    // Subscribe to realtime changes
    const toolsSubscription = supabase
      .channel('tools_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tools_shared_x7y9z' 
        }, 
        (payload) => {
          // Refresh the tools list when changes occur
          fetchTools();
        }
      )
      .subscribe();

    return () => {
      toolsSubscription.unsubscribe();
    };
  }, []);

  const handleAddTool = async (newTool, editId = null) => {
    try {
      if (editId) {
        const { error } = await supabase
          .from('tools_shared_x7y9z')
          .update({
            title: newTool.title,
            url: newTool.url,
            description: newTool.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', editId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tools_shared_x7y9z')
          .insert([{
            title: newTool.title,
            url: newTool.url,
            description: newTool.description
          }]);

        if (error) throw error;
      }
    } catch (err) {
      console.error('Error saving tool:', err);
      setError('Failed to save tool');
    }
  };

  const handleEditClick = (tool) => {
    setEditingTool(tool);
    setActionAfterPassword('edit');
    setIsPasswordPromptOpen(true);
  };

  const handleNewLinkClick = () => {
    setEditingTool(null);
    setActionAfterPassword('add');
    setIsPasswordPromptOpen(true);
  };

  const handlePasswordSuccess = () => {
    setIsPasswordPromptOpen(false);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTool(null);
  };

  const handleHomeClick = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-primary mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading tools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-purple-primary text-white rounded-lg hover:bg-purple-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed Navigation */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black bg-opacity-90 backdrop-blur-sm border-b border-gray-800">
        <div className="flex justify-between items-center p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <SafeIcon icon={FiHome} className="w-5 h-5" />
              <span>Home</span>
            </button>
            
            <button
              onClick={() => setIsQRPopupOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <SafeIcon icon={BsQrCode} className="w-5 h-5" />
              <span className="hidden sm:inline">QR Code</span>
            </button>
          </div>

          <button
            onClick={handleNewLinkClick}
            className="flex items-center gap-2 px-4 py-2 bg-purple-primary text-white rounded-lg hover:bg-purple-dark transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5" />
            <span>New Link</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-primary bg-clip-text text-transparent">
              ESOL Tools Hub
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Discover and access powerful tools for English language learning and teaching. 
              Scan QR codes or click links to explore each resource.
            </p>
          </motion.div>

          {/* Tools Grid */}
          <div className="space-y-6">
            {tools.map((tool, index) => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                index={index}
                onEditClick={handleEditClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Link Form Modal */}
      <AddLinkForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onAddTool={handleAddTool}
        editingTool={editingTool}
      />

      {/* QR Code Popup */}
      <QRCodePopup
        isOpen={isQRPopupOpen}
        onClose={() => setIsQRPopupOpen(false)}
        url={window.location.href}
      />

      {/* Password Prompt */}
      <PasswordPrompt
        isOpen={isPasswordPromptOpen}
        onClose={() => setIsPasswordPromptOpen(false)}
        onSuccess={handlePasswordSuccess}
        correctPassword="U7pJ@qR1dQmL9Fw!"
      />
    </div>
  );
}

export default App;