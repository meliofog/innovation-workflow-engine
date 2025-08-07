import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../api/apiService';
import { IdeaDetailsModal } from './IdeaDetailsModal'
import { UserIcon, UserGroupIcon, DocumentTextIcon, PhotoIcon, FilmIcon, ArchiveBoxIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

// --- Document Management Component (Now uses processInstanceId) ---
export const DocumentManager = ({ token, processInstanceId }) => {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef(null);

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getDocumentsForProcessInstance(token, processInstanceId);
            setDocuments(data);
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (processInstanceId) {
            fetchDocuments();
        }
    }, [processInstanceId, token]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            await apiService.uploadDocument(token, processInstanceId, file);
            fetchDocuments();
        } catch (error) {
            alert("File upload failed.");
        }
    };

    return (
        <div>
            <h4 className="text-md font-semibold mb-2">Attached Documents</h4>
            <div className="border rounded-md p-4 min-h-[80px]">
                {isLoading ? <p>Loading documents...</p> : (
                    <ul className="space-y-2">
                        {documents.length > 0 ? documents.map(doc => (
                            <li key={doc.id} className="flex justify-between items-center text-sm">
                                <span>{doc.fileName.substring(doc.fileName.indexOf('_') + 1)}</span>
                                <a href={`/api/documents/${doc.id}/download`} download className="text-indigo-600 hover:underline">Download</a>
                            </li>
                        )) : <p className="text-gray-500">No documents attached.</p>}
                    </ul>
                )}
            </div>
            <div className="mt-4">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="w-full px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Upload New Document
                </button>
            </div>
        </div>
    );
};

// --- Task-Specific Form Components ---

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
        <form onSubmit={handleSubmit}>
            <p className="text-sm text-gray-600 mb-4">Attach all relevant documents below. Once complete, submit this task.</p>
            <div className="mb-6">
                <DocumentManager 
                    token={token} 
                    processInstanceId={task.processInstanceId} 
                />
            </div>
            <div className="flex justify-end">
                 <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Mark as Complete
                </button>
            </div>
        </form>
    )
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

    return (
        <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-medium mb-4">Set Idea Priority</h3>
            <div className="mb-6">
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority Level</label>
                <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                </select>
            </div>
            <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Set Priority & Complete
                </button>
            </div>
        </form>
    );
};

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
        <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-medium mb-4">Qualify Idea</h3>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Decision</label>
                <select value={decision} onChange={(e) => setDecision(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                    <option value="VALIDEE">Validate</option>
                    <option value="AJOURNEE">Postpone</option>
                    <option value="REJETEE">Reject</option>
                </select>
            </div>
            {decision === 'REJETEE' && (
                <div className="mb-4">
                    <label htmlFor="motifRejet" className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                    <input type="text" id="motifRejet" value={motifRejet} onChange={(e) => setMotifRejet(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
            )}
            {decision === 'AJOURNEE' && (
                <div className="mb-4">
                    <label htmlFor="dateEcheance" className="block text-sm font-medium text-gray-700">New Deadline</label>
                    <input type="datetime-local" id="dateEcheance" value={dateEcheance} onChange={(e) => setDateEcheance(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
            )}
            <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Submit Decision
                </button>
            </div>
        </form>
    );
};

// --- NEW: Form for the POC Conclusion Task ---
export const PocConclusionForm = ({ task, token, onTaskCompleted }) => {
    const [decision, setDecision] = useState('favorable');
    const [conclusion, setConclusion] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const variables = {
            avis: decision,
            conclusion: conclusion
        };
        
        try {
            await apiService.completeTask(token, task.id, variables);
            onTaskCompleted();
        } catch (err) {
            alert('Error completing task: ' + err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-medium mb-4">POC Conclusion</h3>
            <div className="mb-4">
                <label htmlFor="conclusion" className="block text-sm font-medium text-gray-700">Conclusion Summary</label>
                <textarea id="conclusion" value={conclusion} onChange={(e) => setConclusion(e.target.value)} required rows="4" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Final Decision (Avis)</label>
                <select value={decision} onChange={(e) => setDecision(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                    <option value="favorable">Favorable</option>
                    <option value="defavorable">Défavorable</option>
                </select>
            </div>
            <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Submit Conclusion
                </button>
            </div>
        </form>
    );
};


// --- UPDATED: MVP Presentation Task Form with Clean Rich Recap ---
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

    // Helper function for document preview (same as IdeaDetailsModal)
    const getFileIcon = (fileType) => {
        if (fileType.startsWith('video/')) return <FilmIcon className="h-10 w-10 text-gray-400" />;
        if (fileType === 'application/pdf') return <DocumentTextIcon className="h-10 w-10 text-red-400" />;
        return <ArchiveBoxIcon className="h-10 w-10 text-gray-400" />;
    };

    return (
        <div className="space-y-8">
            {/* --- Clean Project Recap Section --- */}
            <div>
                <h3 className="text-lg font-medium text-gray-800 mb-6">Project Recap</h3>
                
                {/* Main Idea Details */}
                <div className="mb-8">
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
                </div>

                {/* POC Section (if available) */}
                {poc && (
                    <div className="mb-8">
                        <h4 className="text-md font-semibold text-gray-700 mb-4">POC Details</h4>
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

                {/* Development Section (if available) */}
                {developpement && (
                    <div className="mb-8">
                        <h4 className="text-md font-semibold text-gray-700 mb-4">Development Details</h4>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 flex items-center"><UserIcon className="h-4 w-4 mr-1"/>Project Lead</dt>
                                <dd className="mt-1 text-md text-gray-900">{developpement.chefDeProjet}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 flex items-center"><UserGroupIcon className="h-4 w-4 mr-1"/>Team Members</dt>
                                <dd className="mt-1 text-md text-gray-900">{developpement.membresEquipe?.split(',').join(', ')}</dd>
                            </div>
                        </dl>
                    </div>
                )}

                {/* Documents Section */}
                <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-4">Attached Documents</h4>
                    <div className="mt-2">
                        {documents.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {documents.map(doc => {
                                    const isImage = doc.fileType.startsWith('image/');
                                    const downloadUrl = `/api/documents/${doc.id}/download`;
                                    
                                    return (
                                        <a 
                                            key={doc.id}
                                            href={downloadUrl} 
                                            download 
                                            className="relative group block w-full h-24 bg-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                            title={`Download ${doc.fileName.substring(doc.fileName.indexOf('_') + 1)}`}
                                        >
                                            {isImage ? (
                                                <img 
                                                    src={downloadUrl} 
                                                    alt={doc.fileName} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    {getFileIcon(doc.fileType)}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                <div className="text-center text-white p-1">
                                                    <ArrowDownTrayIcon className="h-6 w-6 mx-auto mb-1" />
                                                    <span className="text-xs break-all">{doc.fileName.substring(doc.fileName.indexOf('_') + 1)}</span>
                                                </div>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No documents attached.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* --- The Decision Form Section --- */}
            <form onSubmit={handleSubmit} className="border-t pt-8">
                <h3 className="text-lg font-medium mb-6">MVP Presentation Outcome</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Conclusion</label>
                    <select value={conclusion} onChange={(e) => setConclusion(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                        <option value="ok">OK (Favorable)</option>
                        <option value="nok">NOK (Avis Négatif)</option>
                    </select>
                </div>
                {conclusion === 'nok' && (
                    <div className="mb-6">
                        <label htmlFor="avisNegatif" className="block text-sm font-medium text-gray-700">Negative Feedback Details</label>
                        <textarea id="avisNegatif" value={avisNegatif} onChange={(e) => setAvisNegatif(e.target.value)} required rows="4" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                    </div>
                )}
                <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
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
                const users = await apiService.getAllUsers(token);
                setAllUsers(users);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, [token]);

    const handleMemberSelect = (userId) => {
        setMembresEquipe(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // THIS LINE IS THE FIX: It now sends the processInstanceId, which is always available
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
        <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-medium mb-4">Team Composition</h3>
            <div className="mb-4">
                <label htmlFor="chefDeProjet" className="block text-sm font-medium text-gray-700">Project Lead (Chef de Projet)</label>
                <select id="chefDeProjet" value={chefDeProjet} onChange={(e) => setChefDeProjet(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="" disabled>Select a project lead...</option>
                    {allUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.firstName} {user.lastName} ({user.id})</option>
                    ))}
                </select>
            </div>
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Team Members (Membres Equipe)</label>
                <div className="mt-2 border rounded-md p-2 h-48 overflow-y-auto">
                    {allUsers.map(user => (
                        <div key={user.id} className="flex items-center">
                            <input
                                id={`user-${user.id}`}
                                type="checkbox"
                                checked={membresEquipe.includes(user.id)}
                                onChange={() => handleMemberSelect(user.id)}
                                className="h-4 w-4 rounded"
                            />
                            <label htmlFor={`user-${user.id}`} className="ml-3 text-sm text-gray-700">
                                {user.firstName} {user.lastName} ({user.id})
                            </label>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Set Team & Complete Task
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
        <form onSubmit={handleSubmit}>
            <p className="text-sm text-gray-600 mb-4">No specific form for this task. You can complete it directly.</p>
            <div className="flex justify-end">
                 <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    Complete Task
                </button>
            </div>
        </form>
    )
}