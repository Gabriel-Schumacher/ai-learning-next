"use client";
import React, { useState, useEffect } from "react";
import DataCreation from "@/app/components/DataCreation";
import CollectionsDisplay from "@/app/components/CollectionsDisplay";

function DataCreationPage() {
    const [stage, setStage] = useState(0);

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
                <DataCreation onSave={() => setStage(1)} />
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
