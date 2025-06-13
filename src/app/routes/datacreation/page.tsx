"use client";
import React, { useState, useEffect } from "react";
import DataCreation from "@/app/components/DataCreation";
import CollectionsDisplay from "@/app/components/CollectionsDisplay";

function DataCreationPage() {
    const [stage, setStage] = useState(0);

    function handleCancel() {
        console.log("Cancel action triggered");
        setStage(1);
        // Add any additional logic for canceling here
    }

    function handleSave() {
        console.log("Save action triggered");
        setStage(1);
        // Add any additional logic for saving here
    }

    useEffect(() => {
        const savedQuizSets = localStorage.getItem("savedQuizSets");
        if (savedQuizSets) {
            console.log("savedQuizSets found in localStorage:", JSON.parse(savedQuizSets));
            setStage(1);
        } else {
            setStage(0);
            console.log("No savedQuizSets found in localStorage.");
        }
    }, []);

    return (
        <div>
            {stage === 0 && (
                <DataCreation onSave={handleSave} onCancel={handleCancel} />
            )}
            {stage === 1 && (
              <div>
                <CollectionsDisplay onNewCollection={() => setStage(0)} />
              </div>
            )}
        </div>
    );
}

export default DataCreationPage;
