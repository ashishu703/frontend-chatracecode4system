import React from 'react';

export default function ServerFooter() {
  const currentYear = new Date().getFullYear();
  const baseUrl = 'https://code4system.anocabapp.com';

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/drpbrn2ax/image/upload/v1763706224/WhatsApp_Image_2025-11-21_at_11.50.23_AM_rvamky.jpg"
              alt="Code4System Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-gray-300 font-semibold">code4system</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href={`${baseUrl}/terms-and-condition`}
              className="text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Terms and Conditions
            </a>
            <a
              href={`${baseUrl}/privacy-policy`}
              className="text-gray-300 hover:text-purple-400 transition-colors duration-200 font-medium px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Privacy Policy
            </a>
          </div>
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} code4system. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

