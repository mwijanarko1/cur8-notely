'use client';

import { useState, useRef, useEffect } from 'react';
import { FiShare2, FiChevronDown, FiFileText, FiFile, FiCode, FiBook } from 'react-icons/fi';
import { Note } from '@/lib/firebase/notes';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { jsPDF } from 'jspdf';

type ShareButtonProps = {
  note: Note;
  className?: string;
};

export default function ShareButton({ note, className = '' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generate export file based on format
  const handleExport = async (format: string) => {
    const { title, content } = note;
    let fileContent = '';
    let fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    let mimeType = '';
    
    switch (format) {
      case 'txt':
        fileContent = `${title}\n\n${content}`;
        fileName += '.txt';
        mimeType = 'text/plain';
        downloadBlob(fileContent, fileName, mimeType);
        break;
      case 'md':
        fileContent = `# ${title}\n\n${content}`;
        fileName += '.md';
        mimeType = 'text/markdown';
        downloadBlob(fileContent, fileName, mimeType);
        break;
      case 'docx':
        await exportToDocx(title, content, fileName);
        break;
      case 'pdf':
        exportToPdf(title, content, fileName);
        break;
      default:
        return;
    }
    
    setIsOpen(false);
  };

  // Helper function to download blob
  const downloadBlob = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export to PDF using jsPDF
  const exportToPdf = (title: string, content: string, fileName: string) => {
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(18);
    pdf.text(title, 20, 20);
    
    // Add content - handle basic text wrapping
    pdf.setFontSize(12);
    const contentLines = pdf.splitTextToSize(content, 170);
    pdf.text(contentLines, 20, 30);
    
    // Save the PDF
    pdf.save(`${fileName}.pdf`);
  };

  // Export to DOCX using docx.js
  const exportToDocx = async (title: string, content: string, fileName: string) => {
    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: title,
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            new Paragraph({
              text: "", // Empty paragraph for spacing
            }),
            ...content.split('\n').map(line => 
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                  }),
                ],
              })
            ),
          ],
        },
      ],
    });

    // Generate blob from document
    const blob = await Packer.toBlob(doc);
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        className="px-4 py-2 text-sm rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors flex items-center"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Share note"
        title="Share note"
      >
        <FiShare2 className="mr-1" />
        <span>Share</span>
        <FiChevronDown className={`ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200">
          <div className="px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
            Export as
          </div>
          
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => handleExport('docx')}
          >
            <FiFileText className="mr-2 text-blue-500" />
            Word Document (.docx)
          </button>
          
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => handleExport('pdf')}
          >
            <FiBook className="mr-2 text-red-500" />
            PDF Document (.pdf)
          </button>
          
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => handleExport('txt')}
          >
            <FiFile className="mr-2 text-gray-500" />
            Plain Text (.txt)
          </button>
          
          <button
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => handleExport('md')}
          >
            <FiCode className="mr-2 text-green-500" />
            Markdown (.md)
          </button>
        </div>
      )}
    </div>
  );
} 