import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../api/apiService';
import { IdeaDetailsModal } from './IdeaDetailsModal';
import toast from 'react-hot-toast';
import {
  UserIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PhotoIcon,
  FilmIcon,
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

// ------------------------
// Reusable small helpers
// ------------------------
const filePrettyName = (name = '') =>
  name.includes('_') ? name.substring(name.indexOf('_') + 1) : name;

const FileTypeIcon = ({ type }) => {
  if (!type) return <ArchiveBoxIcon className="h-6 w-6 text-gray-400" />;
  if (type.startsWith('image/')) return <PhotoIcon className="h-6 w-6 text-gray-400" />;
  if (type.startsWith('video/')) return <FilmIcon className="h-6 w-6 text-gray-400" />;
  if (type === 'application/pdf') return <DocumentTextIcon className="h-6 w-6 text-red-400" />;
  return <ArchiveBoxIcon className="h-6 w-6 text-gray-400" />;
};

// --------------------------------------
// Document Management (processInstanceId)
// --------------------------------------
export const DocumentManager = ({ token, processInstanceId }) => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getDocumentsForProcessInstance(token, processInstanceId);
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Failed to load documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (processInstanceId) {
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processInstanceId, token]);

  const doUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const promise = apiService
      .uploadDocument(token, processInstanceId, file)
      .then(fetchDocuments)
      .finally(() => setUploading(false));
    toast.promise(promise, {
      loading: 'Uploading...',
      success: 'File uploaded!',
      error: 'Upload failed.',
    });
  };

  const handleFileInput = async (e) => {
    await doUpload(e.target.files?.[0]);
    // reset input so re-selecting same file triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    await doUpload(file);
  };

  const handleDelete = async (documentId) => {
    const promise = apiService.deleteDocument(token, documentId).then(fetchDocuments);
    toast.promise(promise, {
      loading: 'Deleting file...',
      success: 'File deleted.',
      error: 'Delete failed.',
    });
  };

  const Uploader = () => (
    <div
      className={`mt-4 rounded-lg border-2 border-dashed p-6 text-center transition
        ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-white'}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <CloudArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        Drag & drop a file here, or{' '}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="font-medium text-indigo-600 hover:text-indigo-700 underline"
          disabled={uploading}
        >
          browse
        </button>
      </p>
      <p className="text-[12px] text-gray-400 mt-1">Images, PDFs, or videos are supported.</p>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        className="hidden"
        aria-label="Upload document"
      />
      {uploading && (
        <div className="mt-3 inline-flex items-center gap-2 text-sm text-gray-600">
          <span className="animate-pulse inline-block h-2 w-2 rounded-full bg-indigo-500" />
          Uploading...
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-md font-semibold">Attached Documents</h4>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
          disabled={uploading}
          title="Upload New Document"
        >
          <CloudArrowUpIcon className="h-4 w-4" />
          Upload
        </button>
      </div>

      <div className="border rounded-lg p-4 min-h-[96px]">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 rounded" />
          </div>
        ) : documents.length > 0 ? (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileTypeIcon type={doc.fileType} />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900 truncate" title={filePrettyName(doc.fileName)}>
                      {filePrettyName(doc.fileName)}
                    </p>
                    <p className="text-xs text-gray-500">{doc.fileType || 'Unknown type'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`/api/documents/${doc.id}/download`}
                    download
                    className="text-indigo-600 hover:text-indigo-700 text-sm inline-flex items-center gap-1"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete File"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-2">No documents attached.</p>
        )}
      </div>

      {/* Drag & drop + browse */}
      <Uploader />
    </div>
  );
};

// ----------------------
// Task-Specific Forms
// ----------------------

export const BusinessPlanForm = ({ task, token, onTaskCompleted }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.completeTask(token, task.id, {});
      onTaskCompleted();
    } catch (err) {
      alert('Error completing task: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Business Plan</h3>
        <p className="text-sm text-gray-600">
          Attach all relevant documents below. When finished, mark this task as complete.
        </p>
      </div>

      <DocumentManager token={token} processInstanceId={task.processInstanceId} />

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <CheckCircleIcon className="h-4 w-4" />
          Mark as Complete
        </button>
      </div>
    </form>
  );
};

export const PrioritizationForm = ({ task, token, onTaskCompleted }) => {
  const [priority, setPriority] = useState('Medium');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.prioritizeIdea(token, task.processInstanceId, priority);
      onTaskCompleted();
    } catch (err) {
      alert('Error setting priority: ' + err.message);
    }
  };

  const Radio = ({ value, label, desc }) => (
    <label className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50 ${priority === value ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-gray-300'}`}>
      <input
        type="radio"
        name="priority"
        value={value}
        checked={priority === value}
        onChange={(e) => setPriority(e.target.value)}
        className="mt-1 h-4 w-4"
      />
      <span>
        <span className="block text-sm font-medium text-gray-900">{label}</span>
        <span className="block text-xs text-gray-500">{desc}</span>
      </span>
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-semibold">Set Idea Priority</h3>

      <div className="grid gap-3 sm:grid-cols-3">
        <Radio value="Low" label="Low" desc="Minor impact, flexible timing" />
        <Radio value="Medium" label="Medium" desc="Important but not urgent" />
        <Radio value="High" label="High" desc="Immediate attention required" />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <CheckCircleIcon className="h-4 w-4" />
          Set Priority & Complete
        </button>
      </div>
    </form>
  );
};

// ---- Move these OUTSIDE so their identity is stable ----
const Select = ({ className = '', ...props }) => (
  <select
    {...props}
    className={
      "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 " +
      className
    }
  />
);

const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={
      "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 " +
      className
    }
  />
);

const Label = ({ children, className = '', ...props }) => (
  <label {...props} className={"block text-sm font-medium text-gray-700 " + className}>
    {children}
  </label>
);

// ---- Parent stays lean; no inline component defs ----
export const QualificationForm = ({ task, token, onTaskCompleted }) => {
  const [decision, setDecision] = useState('VALIDEE');
  const [motifRejet, setMotifRejet] = useState('');
  const [dateEcheance, setDateEcheance] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const variables = { resultatQualification: decision };
    if (decision === 'REJETEE') variables.motifRejet = motifRejet;
    if (decision === 'AJOURNEE') variables.dateEcheance = new Date(dateEcheance).toISOString().slice(0, -5);

    try {
      await apiService.completeTask(token, task.id, variables);
      onTaskCompleted();
    } catch (err) {
      alert('Error completing task: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-semibold">Qualify Idea</h3>

      <div>
        <Label>Decision</Label>
        <Select value={decision} onChange={(e) => setDecision(e.target.value)}>
          <option value="VALIDEE">Validate</option>
          <option value="AJOURNEE">Postpone</option>
          <option value="REJETEE">Reject</option>
        </Select>
      </div>

      {decision === 'REJETEE' && (
        <div>
          <Label htmlFor="motifRejet">Rejection Reason</Label>
          <Input
            id="motifRejet"
            type="text"
            value={motifRejet}
            onChange={(e) => setMotifRejet(e.target.value)}
            required
          />
        </div>
      )}

      {decision === 'AJOURNEE' && (
        <div>
          <Label htmlFor="dateEcheance">New Deadline</Label>
          <Input
            id="dateEcheance"
            type="datetime-local"
            value={dateEcheance}
            onChange={(e) => setDateEcheance(e.target.value)}
            required
          />
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <CheckCircleIcon className="h-4 w-4" />
          Submit Decision
        </button>
      </div>
    </form>
  );
};

export const PocConclusionForm = ({ task, token, onTaskCompleted }) => {
  const [decision, setDecision] = useState('favorable');
  const [conclusion, setConclusion] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const variables = { avis: decision, conclusion };
    try {
      await apiService.completeTask(token, task.id, variables);
      onTaskCompleted();
    } catch (err) {
      alert('Error completing task: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-semibold">POC Conclusion</h3>

      <div>
        <label htmlFor="conclusion" className="block text-sm font-medium text-gray-700">
          Conclusion Summary
        </label>
        <textarea
          id="conclusion"
          rows={4}
          value={conclusion}
          onChange={(e) => setConclusion(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Final Decision (Avis)</label>
        <select
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="favorable">Favorable</option>
          <option value="defavorable">Défavorable</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <CheckCircleIcon className="h-4 w-4" />
          Submit Conclusion
        </button>
      </div>
    </form>
  );
};

export const MvpPresentationForm = ({ task, details, token, onTaskCompleted }) => {
  const [conclusion, setConclusion] = useState('ok');
  const [avisNegatif, setAvisNegatif] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const variables = { conclusion };
    if (conclusion === 'nok') variables.avisNegatif = avisNegatif;

    try {
      await apiService.completeTask(token, task.id, variables);
      onTaskCompleted();
    } catch (err) {
      alert('Error completing task: ' + err.message);
    }
  };

  const idea = details?.idea;
  const poc = details?.poc;
  const developpement = details?.developpement;
  const documents = details?.documents || [];

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('video/')) return <FilmIcon className="h-10 w-10 text-gray-400" />;
    if (fileType === 'application/pdf') return <DocumentTextIcon className="h-10 w-10 text-red-400" />;
    return <ArchiveBoxIcon className="h-10 w-10 text-gray-400" />;
  };

  return (
    <div className="space-y-8">
      {/* Recap */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Recap</h3>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-3">
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

        {poc && (
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-700 mb-2">POC Details</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
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

        {developpement && (
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-700 mb-2">Development Details</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  Project Lead
                </dt>
                <dd className="mt-1 text-md text-gray-900">{developpement.chefDeProjet}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  Team Members
                </dt>
                <dd className="mt-1 text-md text-gray-900">
                  {developpement.membresEquipe?.split(',').join(', ')}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <div className="mt-6">
          <h4 className="text-md font-semibold text-gray-700 mb-2">Attached Documents</h4>
          {documents.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {documents.map((doc) => {
                const isImage = doc.fileType.startsWith('image/');
                const downloadUrl = `/api/documents/${doc.id}/download`;
                return (
                  <a
                    key={doc.id}
                    href={downloadUrl}
                    download
                    className="relative group block w-full h-24 bg-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    title={`Download ${filePrettyName(doc.fileName)}`}
                  >
                    {isImage ? (
                      <img src={downloadUrl} alt={doc.fileName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">{getFileIcon(doc.fileType)}</div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <div className="text-center text-white p-1">
                        <ArrowDownTrayIcon className="h-6 w-6 mx-auto mb-1" />
                        <span className="text-xs break-all">{filePrettyName(doc.fileName)}</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No documents attached.</p>
          )}
        </div>
      </div>

      {/* Decision Form */}
      <form onSubmit={handleSubmit} className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-semibold">MVP Presentation Outcome</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700">Conclusion</label>
          <select
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="ok">OK (Favorable)</option>
            <option value="nok">NOK (Avis Négatif)</option>
          </select>
        </div>

        {conclusion === 'nok' && (
          <div>
            <label htmlFor="avisNegatif" className="block text-sm font-medium text-gray-700">
              Negative Feedback Details
            </label>
            <textarea
              id="avisNegatif"
              rows={4}
              required
              value={avisNegatif}
              onChange={(e) => setAvisNegatif(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <CheckCircleIcon className="h-4 w-4" />
            Submit Conclusion
          </button>
        </div>
      </form>
    </div>
  );
};

export const TeamCompositionForm = ({ task, token, onTaskCompleted }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [chefDeProjet, setChefDeProjet] = useState('');
  const [membresEquipe, setMembresEquipe] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await apiService.getAllUsersForTask(token);
        setAllUsers(users);
      } catch (error) {
        console.error('Failed to fetch users', error);
        toast.error('Failed to load users.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const handleMemberSelect = (userId) => {
    setMembresEquipe((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // keep your original logic as-is
      await apiService.setDevelopmentTeam(token, task.processInstanceId, { chefDeProjet, membresEquipe });
      await apiService.completeTask(token, task.id, {});
      onTaskCompleted();
    } catch (err) {
      alert('Error setting team: ' + err.message);
    }
  };

  if (isLoading) {
    return <p>Loading users...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-lg font-semibold">Team Composition</h3>

      <div>
        <label htmlFor="chefDeProjet" className="block text-sm font-medium text-gray-700">
          Project Lead (Chef de Projet)
        </label>
        <select
          id="chefDeProjet"
          value={chefDeProjet}
          onChange={(e) => setChefDeProjet(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="" disabled>
            Select a project lead...
          </option>
          {allUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.firstName} {user.lastName} ({user.id})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Team Members (Membres Equipe)</label>
        <div className="mt-2 border rounded-lg p-2 h-48 overflow-y-auto space-y-1">
          {allUsers.map((user) => (
            <label key={user.id} htmlFor={`user-${user.id}`} className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-gray-50 cursor-pointer">
              <input
                id={`user-${user.id}`}
                type="checkbox"
                checked={membresEquipe.includes(user.id)}
                onChange={() => handleMemberSelect(user.id)}
                className="h-4 w-4 rounded"
              />
              <span className="text-sm text-gray-700">
                {user.firstName} {user.lastName} ({user.id})
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <CheckCircleIcon className="h-4 w-4" />
          Set Team & Complete Task
        </button>
      </div>
    </form>
  );
};

export const BusinessPlanValidationForm = ({ task, token, onTaskCompleted }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const variables = { businessPlanValidated: true };
    try {
      await apiService.completeTask(token, task.id, variables);
      onTaskCompleted();
    } catch (err) {
      alert('Error completing task: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Validate Final Business Plan</h3>
        <p className="text-sm text-gray-600">
          Review the attached documents below. If everything looks good, validate the business plan.
        </p>
      </div>

      <DocumentManager token={token} processInstanceId={task.processInstanceId} />

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <CheckCircleIcon className="h-4 w-4" />
          Validate and Approve
        </button>
      </div>
    </form>
  );
};

export const GenericTaskForm = ({ task, token, onTaskCompleted }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.completeTask(token, task.id, {});
      onTaskCompleted();
    } catch (err) {
      alert('Error completing task: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">No specific form for this task. You can complete it directly.</p>
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <CheckCircleIcon className="h-4 w-4" />
          Complete Task
        </button>
      </div>
    </form>
  );
};
