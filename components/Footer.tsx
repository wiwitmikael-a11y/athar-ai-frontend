import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="p-4 bg-white border-t text-center text-sm text-gray-500">
      Built with open-source models via Hugging Face. Replace HF key & Mongo URI in backend .env.
    </footer>
  );
};

export default Footer;
