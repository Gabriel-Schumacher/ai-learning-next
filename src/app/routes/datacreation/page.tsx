"use client";
import React, { useState, useEffect } from "react";
import DataCreation from "@/app/components/DataCreation";
import CollectionsDisplay from "@/app/components/CollectionsDisplay";
import Toast from "@/app/components/Toast";


function DataCreationPage() {
    const [stage, setStage] = useState(0);
    let showingToast = false;
    let isError = false;
    const [toastMessage, setToastMessage] = useState<string>("Welcome to the Library!");

    function handleCancel() {
        console.log("Cancel action triggered");
        setStage(1);
        // Add any additional logic for canceling here
    }

    function handleSave() {
        console.log("Save action triggered");
        setStage(1);
        handleToastMessage("Data saved successfully!", false);
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

    function handleToastMessage(message: string, error: boolean) {
        isError = error;
        if (error) {
          isError = true
        } 
        isError = false;
        setToastMessage(message);
        showingToast = true;
        setTimeout(() => {
          showingToast = false;
          setToastMessage("");
        }, 3000); // Hide toast after 3 seconds
      }

    return (
        <div>
            {Toast(toastMessage, isError, showingToast)}
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
