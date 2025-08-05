import React, { useState, useEffect, useRef } from 'react';
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

export const TaskModal = ({ task, token, onClose, onTaskCompleted }) => {
    const [taskDetails, setTaskDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!task) return;
            setIsLoading(true);
            try {
                const data = await apiService.getTaskDetails(token, task.id);
                setTaskDetails(data);
            } catch (error) {
                console.error("Failed to fetch task details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [task, token]);

    const renderTaskForm = () => {
        if (!taskDetails) return null;

        switch (taskDetails.task.taskDefinitionKey) {
            case 'Activity_10rvc7h': // Priorisation / Filtrage
                return <PrioritizationForm task={taskDetails.task} token={token} onTaskCompleted={onTaskCompleted} />;
            case 'Activity_0tg41vr': // Valider, Ajourner ou rejeter l'idée
                return <QualificationForm task={taskDetails.task} token={token} onTaskCompleted={onTaskCompleted} />;
            case 'Activity_0bqn3dl': // Elaboration Business plan, business modèle, ...
                return <BusinessPlanForm task={taskDetails.task} token={token} onTaskCompleted={onTaskCompleted} />;
            case 'Activity_1oplie6': // Saisir la conclusion du POC
                return <PocConclusionForm task={taskDetails.task} token={token} onTaskCompleted={onTaskCompleted} />;
            case 'Activity_0a8a9ls': // Présentation MVP aux clients pilotes
                return <MvpPresentationForm 
                            task={taskDetails.task} 
                            taskDetails={taskDetails} // Pass the full details object
                            token={token} 
                            onTaskCompleted={onTaskCompleted} 
                        />;
            case 'Activity_1cgibts': // Constitution de l'équipe
                return <TeamCompositionForm task={taskDetails.task} token={token} onTaskCompleted={onTaskCompleted} />;
            case 'Activity_1npl4tr': // Travailler sur le business model et business plans définitifs
                return <BusinessPlanForm task={taskDetails.task} token={token} onTaskCompleted={onTaskCompleted} />;

            default:
                return <GenericTaskForm task={taskDetails.task} token={token} onTaskCompleted={onTaskCompleted} />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{task.name}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>

                {isLoading ? (
                    <p>Loading task details...</p>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 border rounded-lg bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Related Idea: {taskDetails?.idea?.titre}</h3>
                            <p className="text-sm text-gray-600">{taskDetails?.idea?.description}</p>
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