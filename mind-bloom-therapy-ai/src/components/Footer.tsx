
import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Therapy Platform</h3>
            <p className="text-sm text-gray-600">
              Connecting patients with licensed therapists through secure, accessible mental healthcare.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Platform</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-sm text-gray-600 hover:text-gray-900">
                About Us
              </Link>
              <Link to="/pricing" className="block text-sm text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link to="/register" className="block text-sm text-gray-600 hover:text-gray-900">
                Get Started
              </Link>
            </div>
          </div>
          
          {/* For Therapists */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">For Therapists</h4>
            <div className="space-y-2">
              <Link to="/therapist-register" className="block text-sm text-gray-600 hover:text-gray-900">
                Join as Therapist
              </Link>
              <Link to="/login" className="block text-sm text-gray-600 hover:text-gray-900">
                Therapist Login
              </Link>
            </div>
          </div>
          
          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Legal</h4>
            <div className="space-y-2">
              <Link to="/privacy" className="block text-sm text-gray-600 hover:text-gray-900">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block text-sm text-gray-600 hover:text-gray-900">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p className="text-sm text-gray-600">
            © {currentYear} Therapy Platform. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link to="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-gray-600 hover:text-gray-900">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
