import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../api/apiService';

// --- Document Management Component (Now uses processInstanceId) ---
const DocumentManager = ({ token, processInstanceId }) => {
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

const BusinessPlanForm = ({ task, token, onTaskCompleted }) => {
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

const PrioritizationForm = ({ task, token, onTaskCompleted }) => {
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

const QualificationForm = ({ task, token, onTaskCompleted }) => {
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
const PocConclusionForm = ({ task, token, onTaskCompleted }) => {
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


// --- NEW: Form for the MVP Presentation Task ---
const MvpPresentationForm = ({ task, token, onTaskCompleted }) => {
    const [conclusion, setConclusion] = useState('ok');
    const [avisNegatif, setAvisNegatif] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const variables = { conclusion };
        if (conclusion === 'nok') {
            variables.avisNegatif = avisNegatif;
        }
        
        try {
            await apiService.completeTask(token, task.id, variables);
            onTaskCompleted();
        } catch (err) {
            alert('Error completing task: ' + err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-medium mb-4">MVP Presentation Outcome</h3>
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
    );
};

const GenericTaskForm = ({ task, token, onTaskCompleted }) => {
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

export const TaskModal = ({ task, token, onClose, onTaskCompleted }) => {
    
    const renderTaskForm = () => {
        switch (task.taskDefinitionKey) {
            case 'Activity_10rvc7h': // Priorisation / Filtrage
                return <PrioritizationForm task={task} token={token} onTaskCompleted={onTaskCompleted} />;
            case 'Activity_0tg41vr': // Valider, Ajourner ou rejeter l'idée
                return <QualificationForm task={task} token={token} onTaskCompleted={onTaskCompleted} />;
            case 'Activity_0bqn3dl': // Elaboration Business plan, business modèle, ...
                return <BusinessPlanForm task={task} token={token} onTaskCompleted={onTaskCompleted} />;
            case 'Activity_1oplie6': // Saisir la conclusion du POC
                return <PocConclusionForm task={task} token={token} onTaskCompleted={onTaskCompleted} />;
            // THIS LINE IS NEW
            case 'Activity_0a8a9ls': // Présentation MVP aux clients pilotes
                return <MvpPresentationForm task={task} token={token} onTaskCompleted={onTaskCompleted} />;
            default:
                return <GenericTaskForm task={task} token={token} onTaskCompleted={onTaskCompleted} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{task.name}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                <div className="border-t pt-4">
                    {renderTaskForm()}
                </div>
            </div>
        </div>
    );
};