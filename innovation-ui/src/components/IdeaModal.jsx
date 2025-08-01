import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';

// This modal now handles both creating a new idea and editing an existing one.
export const IdeaModal = ({ token, ideaToEdit, onClose, onSave }) => {
    const [titre, setTitre] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    
    // Check if we are in "edit" mode
    const isEditing = ideaToEdit !== null;

    // If we are editing, pre-fill the form with the idea's data
    useEffect(() => {
        if (isEditing) {
            setTitre(ideaToEdit.titre);
            setDescription(ideaToEdit.description);
        }
    }, [ideaToEdit, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Call the update service if editing
                await apiService.updateIdea(token, ideaToEdit.id, { titre, description });
            } else {
                // Call the submit service if creating
                await apiService.submitIdea(token, { titre, description });
            }
            onSave(); // A single callback for both create and update
        } catch (err) {
            setError(isEditing ? 'Failed to update idea.' : 'Failed to submit idea.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Idea' : 'Submit a New Idea'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="titre" className="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" id="titre" value={titre} onChange={(e) => setTitre(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows="4" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    </div>
                    {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                            {isEditing ? 'Save Changes' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
