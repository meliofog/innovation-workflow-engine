import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import {
    BusinessPlanForm,
    PrioritizationForm,
    QualificationForm,
    PocConclusionForm,
    MvpPresentationForm,
    TeamCompositionForm,
    GenericTaskForm
} from './TaskForms';

export const TaskModal = ({ details, token, onClose, onTaskCompleted }) => {
    // This state will hold the complete details, which might be fetched.
    const [fullDetails, setFullDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFullDetailsIfNeeded = async () => {
            setIsLoading(true);
            const initialTask = details.task;
            const initialIdea = details.idea;

            // If it's the MVP task, we need to fetch the complete details for the recap.
            if (initialTask.taskDefinitionKey === 'Activity_0a8a9ls' && initialIdea?.id) {
                try {
                    // Fetch the FullIdeaDetailsDto using the ideaId we already have
                    const fullIdeaData = await apiService.getIdeaDetails(token, initialIdea.id);
                    // Combine the task with the full idea details
                    setFullDetails({ task: initialTask, ...fullIdeaData });
                } catch (error) {
                    console.error("Failed to fetch full idea details:", error);
                    setFullDetails(details); // Fallback to initial details on error
                } finally {
                    setIsLoading(false);
                }
            } else {
                // For all other tasks, the details passed in are sufficient.
                setFullDetails(details);
                setIsLoading(false);
            }
        };

        fetchFullDetailsIfNeeded();
    }, [details, token]);

    const renderTaskForm = () => {
        if (!fullDetails) return null;

        switch (fullDetails.task.taskDefinitionKey) {
            case 'Activity_10rvc7h': // Priorisation / Filtrage
                return <PrioritizationForm task={fullDetails.task} token={token} onTaskCompleted={onTaskCompleted} />;
            case 'Activity_0tg41vr': // Valider, Ajourner ou rejeter l'idée
                return <QualificationForm task={fullDetails.task} token={token} onTaskCompleted={onTaskCompleted} />;
            case 'Activity_0bqn3dl': // Elaboration Business plan, business modèle, ...
            case 'Activity_1npl4tr': // Travailler sur le business model et business plans définitifs
                return <BusinessPlanForm task={fullDetails.task} token={token} onTaskCompleted={onTaskCompleted} />;
            case 'Activity_1oplie6': // Saisir la conclusion du POC
                return <PocConclusionForm task={fullDetails.task} token={token} onTaskCompleted={onTaskCompleted} />;
            case 'Activity_0a8a9ls': // Présentation MVP aux clients pilotes
                return <MvpPresentationForm
                            task={fullDetails.task}
                            details={fullDetails} // Pass the full details object
                            token={token}
                            onTaskCompleted={onTaskCompleted}
                        />;
            case 'Activity_1cgibts': // Constitution de l'équipe
                return <TeamCompositionForm task={fullDetails.task} token={token} onTaskCompleted={onTaskCompleted} />;
            default:
                return <GenericTaskForm task={fullDetails.task} token={token} onTaskCompleted={onTaskCompleted} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{details.task.name}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>

                {isLoading ? (
                    <p className="text-center text-gray-500 py-8">Loading task details...</p>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 border rounded-lg bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Related Idea: {fullDetails?.idea?.titre}</h3>
                            <p className="text-sm text-gray-600">{fullDetails?.idea?.description}</p>
                        </div>
                        
                        <div className="border-t pt-4">
                            {renderTaskForm()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};