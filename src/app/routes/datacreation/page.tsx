"use client";
import React, { useState, useEffect, use } from "react";
import DataSetup from "@/app/components/DataSetup";
import CollectionsDisplay from "@/app/components/CollectionsDisplay";
import { useToast } from "@/app/components/ToastContext";
import { Stage } from "@/lib/enums/dataCreationStage";

function DataCreationPage() {
    const [stage, setStage] = useState<Stage>(Stage.DataCreation);
    const { showToast } = useToast();

    function handleCancel() {
        console.log("Cancel action triggered");
        setStage(Stage.CollectionsDisplay);
        // Add any additional logic for canceling here
    }

    function handleSave() {
        console.log("Save action triggered");
        setStage(Stage.CollectionsDisplay);
        showToast("Data saved successfully!", false);
        // Add any additional logic for saving here
    }

    useEffect(() => {
        const savedQuizSets = localStorage.getItem("savedQuizSets");
        if (savedQuizSets) {
            console.log("savedQuizSets found in localStorage:", JSON.parse(savedQuizSets));
            setStage(Stage.CollectionsDisplay);
        } else {
            setStage(Stage.DataCreation);
            console.log("No savedQuizSets found in localStorage.");
            showToast("No saved quiz sets found. Please create a new set.", true);
        }
    }, []);

    return (
        <div className="card w-full h-full grid grid-rows-[max-content_1fr] gap-4 p-4 bg-surface-200 dark:bg-surface-800 shadow-lg">
            {stage === Stage.DataCreation && (
                <DataSetup onSave={handleSave} onCancel={handleCancel} />
            )}
            {stage === Stage.CollectionsDisplay && (
                <CollectionsDisplay onNewCollection={() => setStage(Stage.DataCreation)} />
            )}
        </div>
    );
}

export default DataCreationPage;
