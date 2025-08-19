import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import {
  DocumentTextIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  FilmIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  UserIcon
} from '@heroicons/react/24/outline';

// =============== Small UI helpers ===============
const Badge = ({ children, tone = 'gray' }) => {
  const tones = {
    gray: 'bg-gray-100 text-gray-800 ring-gray-200',
    green: 'bg-green-100 text-green-800 ring-green-200',
    red: 'bg-red-100 text-red-800 ring-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 ring-yellow-200',
    blue: 'bg-blue-100 text-blue-800 ring-blue-200',
    orange: 'bg-orange-100 text-orange-800 ring-orange-200',
    purple: 'bg-purple-100 text-purple-800 ring-purple-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tones[tone] || tones.gray}`}>
      {children}
    </span>
  );
};

const statusTone = (statut) => {
  if (!statut) return 'gray';
  const s = statut.toUpperCase();
  if (s.includes('REJET')) return 'red';
  if (s.includes('VALID') || s.includes('APPRO')) return 'green';
  if (s.includes('ATTENTE') || s.includes('PENDING')) return 'yellow';
  if (s.includes('DEV') || s.includes('DÉV')) return 'blue';
  return 'gray';
};

const priorityTone = (prio) => {
  if (!prio) return 'gray';
  const p = prio.toUpperCase();
  if (p === 'HIGH' || p === 'ELEVEE' || p === 'ÉLEVÉE') return 'red';
  if (p === 'MEDIUM' || p === 'MOYENNE') return 'orange';
  if (p === 'LOW' || p === 'FAIBLE') return 'green';
  return 'purple';
};

const formatDateTime = (dt) => {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt ?? '';
  }
};

// =============== Document item ===============
const DocumentItem = ({ doc }) => {
  const isImage = doc.fileType?.startsWith('image/');
  const downloadUrl = `/api/documents/${doc.id}/download`;

  const getFileIcon = (fileType) => {
    if (!fileType) return <ArchiveBoxIcon className="h-10 w-10 text-gray-400" />;
    if (fileType.startsWith('video/')) return <FilmIcon className="h-10 w-10 text-gray-400" />;
    if (fileType === 'application/pdf') return <DocumentTextIcon className="h-10 w-10 text-red-400" />;
    if (fileType.startsWith('image/')) return <PhotoIcon className="h-10 w-10 text-gray-400" />;
    return <ArchiveBoxIcon className="h-10 w-10 text-gray-400" />;
  };

  const cleanName = doc.fileName?.includes('_')
    ? doc.fileName.substring(doc.fileName.indexOf('_') + 1)
    : doc.fileName;

  return (
    <a
      href={downloadUrl}
      download
      className="relative group block w-full h-24 bg-gray-50 rounded-lg overflow-hidden border hover:shadow-sm transition-shadow"
      title={`Download ${cleanName || 'file'}`}
    >
      {isImage ? (
        <img src={downloadUrl} alt={doc.fileName} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">{getFileIcon(doc.fileType)}</div>
      )}
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
        <div className="text-center text-white p-1">
          <ArrowDownTrayIcon className="h-6 w-6 mx-auto mb-1" />
          <span className="text-xs break-all">{cleanName}</span>
        </div>
      </div>
    </a>
  );
};

// =============== Modal ===============
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
        console.error('Failed to fetch details:', error);
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
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 truncate">
              {loading ? 'Loading…' : idea?.titre || 'Untitled Idea'}
            </h2>

            {/* Meta row: createdBy, createdOn, status, priority */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center text-sm text-gray-600">
                <UserIcon className="h-4 w-4 mr-1 text-gray-400" />
                <span className="truncate max-w-[14rem]" title={idea?.createdBy || ''}>
                  {idea?.createdBy || 'Unknown'}
                </span>
              </span>

              <span className="text-gray-300">•</span>

              <span className="text-sm text-gray-600">
                Created on: {idea ? formatDateTime(idea.dateCreation) : '…'}
              </span>

              {/* Status badge */}
              {idea?.statut && (
                <>
                  <span className="text-gray-300">•</span>
                  <Badge tone={statusTone(idea.statut)}>{idea.statut}</Badge>
                </>
              )}

              {/* Priority badge */}
              <span className="text-gray-300">•</span>
              <Badge tone={priorityTone(idea?.priority)}>
                {idea?.priority || 'Not set'}
              </Badge>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-3xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading details…</p>
        ) : (
          <div className="space-y-8">
            {/* Main Details */}
            <div className="border-t pt-4">
              <dl className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-md text-gray-900 whitespace-pre-wrap">
                    {idea?.description || '—'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Created By</dt>
                  <dd className="mt-1 text-md text-gray-900 break-all">
                    {idea?.createdBy || '—'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <Badge tone={statusTone(idea?.statut)}>{idea?.statut || '—'}</Badge>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Priority</dt>
                  <dd className="mt-1">
                    <Badge tone={priorityTone(idea?.priority)}>{idea?.priority || 'Not set'}</Badge>
                  </dd>
                </div>

                {idea?.motifRejet && (
                  <div className="sm:col-span-3">
                    <dt className="text-sm font-medium text-red-600">Rejection Reason</dt>
                    <dd className="mt-1 text-md text-gray-900">{idea.motifRejet}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* POC Section */}
            {poc && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">POC Details</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Conclusion</dt>
                    <dd className="mt-1 text-md text-gray-900">{poc.conclusion || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Decision</dt>
                    <dd className="mt-1 text-md text-gray-900 capitalize">{poc.decision || '—'}</dd>
                  </div>
                </dl>
              </div>
            )}

            {/* Development Section */}
            {developpement && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Development Details</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      Project Lead
                    </dt>
                    <dd className="mt-1 text-md text-gray-900">{developpement.chefDeProjet || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      Team Members
                    </dt>
                    <dd className="mt-1 text-md text-gray-900">
                      {developpement.membresEquipe
                        ? developpement.membresEquipe.split(',').join(', ')
                        : '—'}
                    </dd>
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

            {/* Documents */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Attached Documents</h3>
              <div className="mt-2 border rounded-lg p-4">
                {documents.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {documents.map((doc) => (
                      <DocumentItem key={doc.id} doc={doc} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No documents attached.</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
