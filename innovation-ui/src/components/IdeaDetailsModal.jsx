import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import { DocumentTextIcon, PhotoIcon, ArrowDownTrayIcon, FilmIcon, ArchiveBoxIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';

// Helper component for displaying a document with an image preview or an icon
const DocumentItem = ({ doc }) => {
    const isImage = doc.fileType.startsWith('image/');
    const downloadUrl = `/api/documents/${doc.id}/download`;

    const getFileIcon = (fileType) => {
        if (fileType.startsWith('video/')) return <FilmIcon className="h-10 w-10 text-gray-400" />;
        if (fileType === 'application/pdf') return <DocumentTextIcon className="h-10 w-10 text-red-400" />;
        return <ArchiveBoxIcon className="h-10 w-10 text-gray-400" />;
    };

    return (
        <a 
            href={downloadUrl} 
            download 
            className="relative group block w-full h-24 bg-gray-100 rounded-lg overflow-hidden border"
            title={`Download ${doc.fileName.substring(doc.fileName.indexOf('_') + 1)}`}
        >
            {isImage ? (
                <img 
                    src={downloadUrl} 
                    alt={doc.fileName} 
                    className="w-full h-full object-cover" 
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">{getFileIcon(doc.fileType)}</div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                <div className="text-center text-white p-1">
                    <ArrowDownTrayIcon className="h-6 w-6 mx-auto mb-1" />
                    <span className="text-xs break-all">{doc.fileName.substring(doc.fileName.indexOf('_') + 1)}</span>
                </div>
            </div>
        </a>
    );
};

// Main Modal Component
export const IdeaDetailsModal = ({ token, ideaId, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!ideaId) return;
      try {
        const data = await apiService.getIdeaDetails(token, ideaId);
        setDetails(data);
      } catch (error) {
        console.error("Failed to fetch details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [ideaId, token]);

  const idea = details?.idea;
  const poc = details?.poc;
  const developpement = details?.developpement;
  const documents = details?.documents || [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{loading ? 'Loading...' : idea?.titre}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Created on: {idea ? new Date(idea.dateCreation).toLocaleDateString() : '...'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
        </div>

        {loading ? <p>Loading details...</p> : (
          <div className="space-y-8">
            {/* Main Details Section */}
            <div className="border-t pt-4">
              <dl className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-md text-gray-900">{idea?.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-md text-gray-900">{idea?.statut}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Priority</dt>
                  <dd className="mt-1 text-md text-gray-900">{idea?.priority || 'Not set'}</dd>
                </div>
                {idea?.motifRejet && (
                   <div className="sm:col-span-3">
                    <dt className="text-sm font-medium text-red-600">Rejection Reason</dt>
                    <dd className="mt-1 text-md text-gray-900">{idea.motifRejet}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* POC Section (Conditional) */}
            {poc && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">POC Details</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Conclusion</dt>
                    <dd className="mt-1 text-md text-gray-900">{poc.conclusion || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Decision</dt>
                    <dd className="mt-1 text-md text-gray-900 capitalize">{poc.decision}</dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Development Section (Conditional) */}
            {developpement && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Development Details</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                   <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center"><UserIcon className="h-4 w-4 mr-1"/>Project Lead</dt>
                    <dd className="mt-1 text-md text-gray-900">{developpement.chefDeProjet}</dd>
                  </div>
                   <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center"><UserGroupIcon className="h-4 w-4 mr-1"/>Team Members</dt>
                    <dd className="mt-1 text-md text-gray-900">{developpement.membresEquipe?.split(',').join(', ')}</dd>
                  </div>
                  {developpement.avisNegatif && (
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-red-600">Negative MVP Feedback</dt>
                      <dd className="mt-1 text-md text-gray-900">{developpement.avisNegatif}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Documents Section */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Attached Documents</h3>
              <div className="mt-2 border rounded-md p-4">
                {documents.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {documents.map(doc => <DocumentItem key={doc.id} doc={doc} />)}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No documents attached.</p>
                )}
              </div>
            </div>

             <div className="border-t pt-4 flex justify-end">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};